// Unit tests: no DB. Operations are mocked; the real module would open a pg pool (and kysely is ESM-only).
jest.mock('src/clients', () => ({}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  calculateQuoteAmounts,
  isValidLessonCount,
} from 'src/common/utils/pricing-utils';
import { FuelType, TransmissionType } from 'src/types';
import { PricingService } from './pricing.service';

const GOLF_R = '11111111-1111-4111-8111-111111111111';
const settings = {
  currency: 'RON',
  vatIncluded: true,
  processingFee: 25,
  processingFeeLabel: 'Taxă de procesare',
  minLessons: 15,
  maxLessons: 60,
  defaultLessons: 15,
  lessonStep: 1,
};
const vehicle = (over = {}) => ({
  id: GOLF_R,
  slug: 'volkswagen-golf-r',
  carName: 'Volkswagen Golf R',
  transmission: TransmissionType.Manual,
  fuel: FuelType.Petrol,
  lessonPrice: '35.00', // pg numeric arrives as a string without the type parser
  ...over,
});

describe('calculateQuoteAmounts (integer bani)', () => {
  it.each([
    [
      'C1 design fixture (desktop)',
      85,
      15,
      25,
      { subtotal: 1275, processingFee: 25, total: 1300 },
    ],
    [
      'C2 design fixture (mobile, no fee)',
      35,
      10,
      0,
      { subtotal: 350, processingFee: 0, total: 350 },
    ],
    ['C3 Golf R', 35, 15, 25, { subtotal: 525, processingFee: 25, total: 550 }],
    [
      'C4 A4 S-Line ×30',
      35,
      30,
      25,
      { subtotal: 1050, processingFee: 25, total: 1075 },
    ],
    ['C5 Tesla', 38, 15, 25, { subtotal: 570, processingFee: 25, total: 595 }],
    [
      'C6 Golf 8 ×60',
      38,
      60,
      25,
      { subtotal: 2280, processingFee: 25, total: 2305 },
    ],
    [
      'float-safe cents',
      '33.33',
      3,
      '0.01',
      { subtotal: 99.99, processingFee: 0.01, total: 100 },
    ],
  ])('%s', (_label, rate, lessons, fee, expected) => {
    expect(calculateQuoteAmounts({ rate, lessons, fee })).toEqual(expected);
  });

  it('validates lesson counts against range and step', () => {
    expect(isValidLessonCount(15, settings)).toBe(true);
    expect(isValidLessonCount(14, settings)).toBe(false);
    expect(isValidLessonCount(61, settings)).toBe(false);
    expect(isValidLessonCount(15.5, settings)).toBe(false);
    expect(isValidLessonCount(17, { ...settings, lessonStep: 5 })).toBe(false);
    expect(isValidLessonCount(20, { ...settings, lessonStep: 5 })).toBe(true);
  });
});

describe('PricingService.computeQuote', () => {
  const ops = {
    getSettings: jest.fn(),
    getActiveCategories: jest.fn(),
    getOptionVehicleRates: jest.fn(),
    getActiveCategoryByCode: jest.fn(),
    getVehicleWithRate: jest.fn(),
    hasAnyActiveRate: jest.fn(),
  };
  const service = new PricingService(ops);
  const base = { categoryCode: 'B', vehicleId: GOLF_R, lessons: 15 };

  beforeEach(() => {
    jest.resetAllMocks();
    ops.getSettings.mockResolvedValue(settings);
    ops.getActiveCategoryByCode.mockResolvedValue({ id: 'cat-b', code: 'B' });
    ops.getVehicleWithRate.mockResolvedValue(vehicle());
  });

  it('C3: Golf R × 15 → 550 with lessons + fee lines', async () => {
    const q = await service.computeQuote(base);
    expect(q).toMatchObject({
      currency: 'RON',
      vatIncluded: true,
      lessons: 15,
      subtotal: 525,
      processingFee: 25,
      total: 550,
      vehicle: { slug: 'volkswagen-golf-r' },
    });
    expect(q.lines).toEqual([
      {
        code: 'lessons',
        label: 'Tarif mașină (Volkswagen Golf R)',
        unitAmount: 35,
        quantity: 15,
        amount: 525,
      },
      {
        code: 'processing_fee',
        label: 'Taxă de procesare',
        unitAmount: 25,
        quantity: 1,
        amount: 25,
      },
    ]);
  });

  it('omits the fee line when the fee is 0', async () => {
    ops.getSettings.mockResolvedValue({ ...settings, processingFee: 0 });
    const q = await service.computeQuote(base);
    expect(q.lines.map((l) => l.code)).toEqual(['lessons']);
    expect(q.total).toBe(525);
  });

  it.each([14, 61])(
    'C7/C8: %i lessons → 400 with the Romanian range message',
    async (lessons) => {
      await expect(service.computeQuote({ ...base, lessons })).rejects.toThrow(
        new BadRequestException(
          'Numărul de lecții trebuie să fie între 15 și 60',
        ),
      );
    },
  );

  it('C15: step 5 rejects 17, accepts 20 (725)', async () => {
    ops.getSettings.mockResolvedValue({ ...settings, lessonStep: 5 });
    await expect(
      service.computeQuote({ ...base, lessons: 17 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect((await service.computeQuote({ ...base, lessons: 20 })).total).toBe(
      725,
    );
  });

  it('C10: transmission or fuel mismatch → 400', async () => {
    await expect(
      service.computeQuote({
        ...base,
        transmission: TransmissionType.Automatic,
      }),
    ).rejects.toThrow(
      'Cutia de viteze sau combustibilul selectat nu corespunde mașinii',
    );
    await expect(
      service.computeQuote({ ...base, fuel: FuelType.Electric }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('C11: unknown car → 404', async () => {
    ops.getVehicleWithRate.mockResolvedValue(undefined);
    ops.hasAnyActiveRate.mockResolvedValue(undefined);
    await expect(service.computeQuote(base)).rejects.toThrow(
      new NotFoundException('Mașina nu a fost găsită'),
    );
  });

  it('car priced only in another category → 400 "not available for B"', async () => {
    ops.getVehicleWithRate.mockResolvedValue(undefined);
    ops.hasAnyActiveRate.mockResolvedValue({ fleetId: GOLF_R });
    await expect(service.computeQuote(base)).rejects.toThrow(
      'Mașina nu este disponibilă pentru categoria B',
    );
  });

  it('C12: unknown category → 400', async () => {
    ops.getActiveCategoryByCode.mockResolvedValue(undefined);
    await expect(
      service.computeQuote({ ...base, categoryCode: 'C' }),
    ).rejects.toThrow('Categorie necunoscută');
  });

  it('missing settings row → 500', async () => {
    ops.getSettings.mockResolvedValue(undefined);
    await expect(service.computeQuote(base)).rejects.toThrow(
      'Internal Server Error',
    );
  });
});

describe('PricingService.getOptions', () => {
  it('groups category rows per car and converts numerics to numbers', async () => {
    const ops = {
      getSettings: jest
        .fn()
        .mockResolvedValue({ ...settings, processingFee: '25.00' }),
      getActiveCategories: jest.fn().mockResolvedValue([
        {
          id: 'cat-b',
          code: 'B',
          name: 'n',
          shortName: 's',
          description: 'd',
          badgeLabel: 'Standard',
          icon: 'directions_car',
          sortOrder: 0,
        },
      ]),
      getOptionVehicleRates: jest.fn().mockResolvedValue([
        {
          ...vehicle(),
          imageUrl: '/x.webp',
          successRate: '93.50',
          averageGrade: '9.00',
          instructorName: 'Mihai Popescu',
          categoryCode: 'B',
          lessonPrice: '35.00',
        },
        {
          ...vehicle(),
          imageUrl: '/x.webp',
          successRate: '93.50',
          averageGrade: '9.00',
          instructorName: 'Mihai Popescu',
          categoryCode: 'BE',
          lessonPrice: '45.00',
        },
      ]),
    };
    const o = await new PricingService(ops as never).getOptions();
    expect(o.processingFee).toEqual({ amount: 25, label: 'Taxă de procesare' });
    expect(o.lessons).toEqual({ min: 15, max: 60, default: 15, step: 1 });
    expect(o.vehicles).toHaveLength(1);
    expect(o.vehicles[0]).toMatchObject({
      categoryCodes: ['B', 'BE'],
      lessonPrice: 35,
      pricesByCategory: { B: 35, BE: 45 },
      successRate: 93.5,
      averageGrade: 9,
    });
    expect(o.vehicles[0]).not.toHaveProperty('phoneNumber');
  });
});
