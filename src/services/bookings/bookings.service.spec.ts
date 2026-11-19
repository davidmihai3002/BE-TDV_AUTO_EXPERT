// Unit tests: no DB. Operations are mocked; the real module would open a pg pool (and kysely is ESM-only).
jest.mock('src/clients', () => ({}));

import { NotFoundException } from '@nestjs/common';
import {
  BookingStatus,
  BookingTimeSlot,
  CreateBookingDto,
  createBookingSchema,
} from 'src/types';
import { BookingsService } from './bookings.service';

const FLEET_ID = '6f1c1c1e-6d0b-4a51-9b4e-1f3c1a2b3c4d';

describe('BookingsService', () => {
  const ops = { getBookableCar: jest.fn(), insertBooking: jest.fn() };
  const service = new BookingsService(ops);
  const base: CreateBookingDto = {
    fleetId: FLEET_ID,
    fullName: 'Ana Popescu',
    phone: '+40722123456',
    preferredDate: '2026-11-25',
    preferredTimeSlot: BookingTimeSlot.Seara,
    gdprConsent: true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    ops.insertBooking.mockResolvedValue({
      id: 'b-1',
      status: BookingStatus.Noua,
    });
  });

  it('snapshots the instructor and keeps quotedTotal null even with lessons', async () => {
    ops.getBookableCar.mockResolvedValue({ id: FLEET_ID, instructorId: 'i-1' });
    const now = new Date('2026-11-19T10:00:00Z');
    const res = await service.createBooking({ ...base, lessonsCount: 15 }, now);
    expect(res).toEqual({ id: 'b-1', status: 'noua' });
    expect(ops.insertBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        fleetId: FLEET_ID,
        instructorId: 'i-1',
        lessonsCount: 15,
        licenseCategory: 'B', // defaulted because lessons were requested
        quotedTotal: null,
        currency: 'RON',
        email: null,
        message: null,
        gdprConsentAt: now,
      }),
    );
  });

  it('leaves licenseCategory null when neither category nor lessons are given', async () => {
    ops.getBookableCar.mockResolvedValue({ id: FLEET_ID, instructorId: null });
    await service.createBooking(base);
    expect(ops.insertBooking).toHaveBeenCalledWith(
      expect.objectContaining({ licenseCategory: null, instructorId: null }),
    );
  });

  it('throws 404 for a missing or inactive car', async () => {
    ops.getBookableCar.mockResolvedValue(undefined);
    await expect(service.createBooking(base)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(ops.insertBooking).not.toHaveBeenCalled();
  });
});

describe('createBookingSchema', () => {
  const body = (over: Record<string, unknown> = {}) => ({
    fleetId: FLEET_ID,
    fullName: '  Ana Pop  ',
    phone: '0722 123 456',
    email: 'ANA@EX.RO',
    preferredDate: '2026-11-20',
    preferredTimeSlot: 'seara',
    licenseCategory: 'b',
    message: '',
    gdprConsent: true,
    website: '',
    ...over,
  });

  beforeEach(() => {
    // 22:30 UTC on 18 Nov = 00:30 on 19 Nov in Bucharest → min date is 2026-11-20
    jest.useFakeTimers({ now: new Date('2026-11-18T22:30:00Z') });
  });
  afterEach(() => jest.useRealTimers());

  it('normalises phone, trims name, lower-cases email, uppercases category, drops empty message', () => {
    const r = createBookingSchema.parse(body());
    expect(r).toMatchObject({
      fullName: 'Ana Pop',
      phone: '+40722123456',
      email: 'ana@ex.ro',
      licenseCategory: 'B',
    });
    expect(r.message).toBeUndefined();
  });

  it.each(['+40722123456', '0722.123.456', '0722-123-456'])(
    'accepts phone %s',
    (phone) => {
      expect(createBookingSchema.parse(body({ phone })).phone).toBe(
        '+40722123456',
      );
    },
  );

  it.each(['0212345678', '0040722123456', '072212345'])(
    'rejects phone %s with reason phone',
    (phone) => {
      const r = createBookingSchema.safeParse(body({ phone }));
      expect(r.success).toBe(false);
      const issue = r.error!.issues[0];
      expect(issue.path).toEqual(['phone']);
      expect(issue.code === 'custom' && issue.params?.reason).toBe('phone');
    },
  );

  it('uses the Bucharest date: "today" there (2026-11-19) is rejected, tomorrow accepted', () => {
    expect(
      createBookingSchema.safeParse(body({ preferredDate: '2026-11-19' }))
        .success,
    ).toBe(false);
    expect(
      createBookingSchema.safeParse(body({ preferredDate: '2026-11-20' }))
        .success,
    ).toBe(true);
  });

  it('allows up to +90 days, rejects +91 and invalid dates', () => {
    // today (Bucharest) = 2026-11-19 → +90 = 2027-02-17
    expect(
      createBookingSchema.safeParse(body({ preferredDate: '2027-02-17' }))
        .success,
    ).toBe(true);
    expect(
      createBookingSchema.safeParse(body({ preferredDate: '2027-02-18' }))
        .success,
    ).toBe(false);
    expect(
      createBookingSchema.safeParse(body({ preferredDate: '2026-02-30' }))
        .success,
    ).toBe(false);
  });

  it.each([
    ['unknown key quotedTotal', { quotedTotal: 1 }],
    ['bad slot', { preferredTimeSlot: 'noapte' }],
    ['consent false', { gdprConsent: false }],
    ['honeypot filled', { website: 'http://spam' }],
    ['bad fleetId', { fleetId: 'abc' }],
  ])('rejects %s', (_label, over) => {
    expect(createBookingSchema.safeParse(body(over)).success).toBe(false);
  });
});
