import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { createE2eApp } from './e2e-app';

interface Vehicle {
  id: string;
  slug: string;
  transmission: string;
  fuel: string;
  lessonPrice: unknown;
  [key: string]: unknown;
}
interface Options {
  currency: string;
  vatIncluded: boolean;
  processingFee: { amount: unknown; label: string };
  lessons: { min: number; max: number; default: number; step: number };
  categories: { code: string; name: string; badgeLabel: string | null }[];
  vehicles: Vehicle[];
}

describe('Pricing (e2e)', () => {
  let app: NestExpressApplication;
  let options: Options;
  const id = (slug: string) =>
    options.vehicles.find((v) => v.slug === slug)!.id;
  const quote = (payload: Record<string, unknown>) =>
    request(app.getHttpServer()).post('/pricing/quote').send(payload);

  beforeAll(async () => {
    app = await createE2eApp();
    options = (
      await request(app.getHttpServer()).get('/pricing/options').expect(200)
    ).body as Options;
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /pricing/options: RON, settings, category B, 6 priced cars, numbers as numbers, no phones', async () => {
    const res = await request(app.getHttpServer())
      .get('/pricing/options')
      .expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    expect(options).toMatchObject({
      currency: 'RON',
      vatIncluded: true,
      processingFee: { amount: 25, label: 'Taxă de procesare' },
      lessons: { min: 15, max: 60, default: 15, step: 1 },
    });
    expect(options.categories).toEqual([
      expect.objectContaining({
        code: 'B',
        name: 'Categoria B – Autoturism',
        badgeLabel: 'Standard',
      }),
    ]);
    expect(options.vehicles.map((v) => v.slug).sort()).toEqual([
      'audi-a4-s-line',
      'audi-r8-lms',
      'honda-civic-si',
      'tesla-model-3',
      'volkswagen-golf-r',
      'vw-golf-8',
    ]);
    const golf = options.vehicles.find((v) => v.slug === 'volkswagen-golf-r')!;
    expect(golf).toMatchObject({
      transmission: 'manual',
      fuel: 'petrol',
      instructorName: 'Mihai Popescu',
      successRate: 93.5,
      categoryCodes: ['B'],
      lessonPrice: 35,
      pricesByCategory: { B: 35 },
    });
    expect(JSON.stringify(res.body)).not.toMatch(/\+40|phone/i);
  });

  it.each([
    ['C3 Golf R × 15', 'volkswagen-golf-r', 15, 550],
    ['C4 A4 S-Line × 30', 'audi-a4-s-line', 30, 1075],
    ['C5 Tesla × 15', 'tesla-model-3', 15, 595],
    ['C6 Golf 8 × 60', 'vw-golf-8', 60, 2305],
  ])('%s → %i lei', async (_label, slug, lessons, total) => {
    const res = await quote({
      categoryCode: 'B',
      vehicleId: id(slug),
      lessons,
    }).expect(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body).toMatchObject({
      currency: 'RON',
      vatIncluded: true,
      lessons,
      total,
    });
  });

  it('C3 response shape: lines, subtotal, fee', async () => {
    const res = await quote({
      categoryCode: 'B',
      vehicleId: id('volkswagen-golf-r'),
      lessons: 15,
      transmission: 'manual',
      fuel: 'petrol',
    }).expect(200);
    expect(res.body).toMatchObject({
      vehicle: { slug: 'volkswagen-golf-r', carName: 'Volkswagen Golf R' },
      lines: [
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
      ],
      subtotal: 525,
      processingFee: 25,
      total: 550,
    });
  });

  it.each([14, 61])(
    'C7/C8 %i lessons → 400 with the range message',
    async (lessons) => {
      const res = await quote({
        categoryCode: 'B',
        vehicleId: id('volkswagen-golf-r'),
        lessons,
      }).expect(400);
      expect(res.body).toMatchObject({
        message: 'Numărul de lecții trebuie să fie între 15 și 60',
      });
    },
  );

  it.each([15.5, '15'])('C9 lessons %p → 400 (zod)', async (lessons) => {
    await quote({
      categoryCode: 'B',
      vehicleId: id('volkswagen-golf-r'),
      lessons,
    }).expect(400);
  });

  it('C10 transmission mismatch → 400', async () => {
    const res = await quote({
      categoryCode: 'B',
      vehicleId: id('volkswagen-golf-r'),
      lessons: 15,
      transmission: 'automatic',
    }).expect(400);
    expect(res.body).toMatchObject({
      message:
        'Cutia de viteze sau combustibilul selectat nu corespunde mașinii',
    });
  });

  it('C11 unknown car → 404', async () => {
    const res = await quote({
      categoryCode: 'B',
      vehicleId: '00000000-0000-4000-8000-000000000000',
      lessons: 15,
    }).expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      message: 'Mașina nu a fost găsită',
    });
  });

  it('C12 unknown category → 400', async () => {
    const res = await quote({
      categoryCode: 'C',
      vehicleId: id('volkswagen-golf-r'),
      lessons: 15,
    }).expect(400);
    expect(res.body).toMatchObject({ message: 'Categorie necunoscută' });
  });

  it('C13 client-sent total → 400 (strict schema)', async () => {
    await quote({
      categoryCode: 'B',
      vehicleId: id('volkswagen-golf-r'),
      lessons: 15,
      total: 1,
    }).expect(400);
  });

  it('C14 deactivated rate → 404 and car absent from options', async () => {
    const golf = id('volkswagen-golf-r');
    await db
      .updateTable('pricingVehicleRates')
      .set({ isActive: false })
      .where('fleetId', '=', golf)
      .execute();
    try {
      await quote({ categoryCode: 'B', vehicleId: golf, lessons: 15 }).expect(
        404,
      );
      const o = (
        await request(app.getHttpServer()).get('/pricing/options').expect(200)
      ).body as Options;
      expect(o.vehicles.map((v) => v.slug)).not.toContain('volkswagen-golf-r');
    } finally {
      await db
        .updateTable('pricingVehicleRates')
        .set({ isActive: true })
        .where('fleetId', '=', golf)
        .execute();
    }
  });

  it('C15 lesson_step 5: 17 → 400, 20 → 725', async () => {
    await db
      .updateTable('pricingSettings')
      .set({ lessonStep: 5 })
      .where('id', '=', 1)
      .execute();
    try {
      await quote({
        categoryCode: 'B',
        vehicleId: id('volkswagen-golf-r'),
        lessons: 17,
      }).expect(400);
      const res = await quote({
        categoryCode: 'B',
        vehicleId: id('volkswagen-golf-r'),
        lessons: 20,
      }).expect(200);
      expect((res.body as { total: number }).total).toBe(725);
    } finally {
      await db
        .updateTable('pricingSettings')
        .set({ lessonStep: 1 })
        .where('id', '=', 1)
        .execute();
    }
  });

  it('CORS preflight allows POST /pricing/quote from the FE origin', async () => {
    const res = await request(app.getHttpServer())
      .options('/pricing/quote')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });
});
