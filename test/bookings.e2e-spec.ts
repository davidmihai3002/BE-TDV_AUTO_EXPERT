import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { addDaysIso, bucharestTodayIso } from 'src/common/utils/date-utils';
import { createE2eApp, nextIp } from './e2e-app';

interface Issue {
  path: string;
}

// Needs the local DB with migrations 050–053 applied: npm run test:e2e:local
// The Bucharest-midnight edge (B9) is covered with a fixed clock in bookings.service.spec.ts.
describe('Bookings (e2e)', () => {
  let app: NestExpressApplication;
  let golfR: { id: string; instructorId: string | null };
  const created: string[] = [];
  const today = () => bucharestTodayIso();

  const body = (over: Record<string, unknown> = {}) => ({
    fleetId: golfR.id,
    fullName: 'E2E Ana Popescu',
    phone: '0722 123 456',
    preferredDate: addDaysIso(today(), 1),
    preferredTimeSlot: 'seara',
    gdprConsent: true,
    ...over,
  });

  const post = (payload: unknown, ip = nextIp()) =>
    request(app.getHttpServer())
      .post('/bookings')
      .set('X-Forwarded-For', ip)
      .send(payload as object);

  const created201 = async (payload: unknown) => {
    const res = await post(payload).expect(201);
    const id = (res.body as { id: string }).id;
    created.push(id);
    return db
      .selectFrom('bookings')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
  };

  const firstIssuePath = async (payload: unknown) => {
    const res = await post(payload).expect(400);
    return (res.body as { issues?: Issue[] }).issues?.[0]?.path;
  };

  beforeAll(async () => {
    app = await createE2eApp();
    golfR = await db
      .selectFrom('fleet')
      .select(['id', 'instructorId'])
      .where('slug', '=', 'volkswagen-golf-r')
      .executeTakeFirstOrThrow();
  });

  afterAll(async () => {
    if (created.length)
      await db.deleteFrom('bookings').where('id', 'in', created).execute();
    await app.close();
  });

  it('B1 minimal body → 201, defaults stored', async () => {
    const res = await post(body()).expect(201);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body).toMatchObject({ status: 'noua' });
    expect(typeof (res.body as { id: unknown }).id).toBe('string');
    created.push((res.body as { id: string }).id);
    const row = await db
      .selectFrom('bookings')
      .selectAll()
      .where('id', '=', (res.body as { id: string }).id)
      .executeTakeFirstOrThrow();
    expect(row).toMatchObject({
      quotedTotal: null,
      licenseCategory: null,
      lessonsCount: null,
      currency: 'RON',
      status: 'noua',
      phone: '+40722123456',
      instructorId: golfR.instructorId, // B17: active instructor snapshotted
      preferredDate: addDaysIso(today(), 1),
    });
    expect(row.gdprConsentAt).toBeInstanceOf(Date);
  });

  it('B2 full body: category uppercased, lessons stored, quotedTotal null (06)', async () => {
    const row = await created201(
      body({
        lessonsCount: 15,
        licenseCategory: 'b',
        email: 'ana.popescu@exemplu.ro',
        message: 'Aș prefera să încep cu traseul de examen.',
        website: '',
      }),
    );
    expect(row).toMatchObject({
      licenseCategory: 'B',
      lessonsCount: 15,
      quotedTotal: null,
    });
  });

  it('B3 lessons without category → category B', async () => {
    const row = await created201(body({ lessonsCount: 15 }));
    expect(row.licenseCategory).toBe('B');
  });

  it('B4 client-sent quotedTotal → 400 (strict)', async () => {
    await post(body({ quotedTotal: 1 })).expect(400);
  });

  it.each(['0722 123 456', '+40722123456', '0722.123.456'])(
    'B5 phone %s → stored +40722123456',
    async (phone) => {
      const row = await created201(body({ phone }));
      expect(row.phone).toBe('+40722123456');
    },
  );

  it.each(['0212345678', '0040722123456', '072212345'])(
    'B6 phone %s → 400 on phone',
    async (phone) => {
      expect(await firstIssuePath(body({ phone }))).toBe('phone');
    },
  );

  it('B7 today / yesterday / invalid date → 400 on preferredDate', async () => {
    for (const preferredDate of [
      today(),
      addDaysIso(today(), -1),
      '2026-02-30',
    ]) {
      expect(await firstIssuePath(body({ preferredDate }))).toBe(
        'preferredDate',
      );
    }
  });

  it('B8 +91 days → 400, +90 → 201', async () => {
    expect(
      await firstIssuePath(body({ preferredDate: addDaysIso(today(), 91) })),
    ).toBe('preferredDate');
    await created201(body({ preferredDate: addDaysIso(today(), 90) }));
  });

  it('B10 bad slot → 400', async () => {
    expect(await firstIssuePath(body({ preferredTimeSlot: 'noapte' }))).toBe(
      'preferredTimeSlot',
    );
  });

  it('B11 consent false / missing → 400 on gdprConsent', async () => {
    expect(await firstIssuePath(body({ gdprConsent: false }))).toBe(
      'gdprConsent',
    );
    const noConsent: Record<string, unknown> = body();
    delete noConsent.gdprConsent;
    expect(await firstIssuePath(noConsent)).toBe('gdprConsent');
  });

  it('B12 honeypot filled → 400 and nothing inserted', async () => {
    const before = await db
      .selectFrom('bookings')
      .select((eb) => eb.fn.countAll<string>().as('c'))
      .executeTakeFirstOrThrow();
    await post(body({ website: 'http://spam' })).expect(400);
    const after = await db
      .selectFrom('bookings')
      .select((eb) => eb.fn.countAll<string>().as('c'))
      .executeTakeFirstOrThrow();
    expect(Number(after.c)).toBe(Number(before.c));
  });

  it('B13 unknown or inactive car → 404', async () => {
    await post(
      body({ fleetId: '00000000-0000-4000-8000-000000000000' }),
    ).expect(404);
    await db
      .updateTable('fleet')
      .set({ isActive: false })
      .where('id', '=', golfR.id)
      .execute();
    try {
      await post(body()).expect(404);
    } finally {
      await db
        .updateTable('fleet')
        .set({ isActive: true })
        .where('id', '=', golfR.id)
        .execute();
    }
  });

  it('B14 fleetId not a uuid → 400', async () => {
    expect(await firstIssuePath(body({ fleetId: 'abc' }))).toBe('fleetId');
  });

  it('B17 inactive instructor → instructor_id NULL', async () => {
    await db
      .updateTable('instructors')
      .set({ isActive: false })
      .where('id', '=', golfR.instructorId)
      .execute();
    try {
      const row = await created201(body());
      expect(row.instructorId).toBeNull();
    } finally {
      await db
        .updateTable('instructors')
        .set({ isActive: true })
        .where('id', '=', golfR.instructorId)
        .execute();
    }
  });

  it('B18 6th request in 10 min from one IP → 429; GET /fleet still 200', async () => {
    const ip = nextIp();
    for (let i = 0; i < 5; i++) {
      const res = await post(body(), ip);
      expect(res.status).toBe(201);
      created.push((res.body as { id: string }).id);
    }
    const blocked = await post(body(), ip).expect(429);
    expect(blocked.body).toMatchObject({ statusCode: 429 });
    await request(app.getHttpServer())
      .get('/fleet')
      .set('X-Forwarded-For', ip)
      .expect(200);
  });

  it('B19 trims name, lower-cases email, empty message → NULL', async () => {
    const row = await created201(
      body({ fullName: '  Ana Pop  ', email: 'ANA@EX.RO', message: '' }),
    );
    expect(row).toMatchObject({
      fullName: 'Ana Pop',
      email: 'ana@ex.ro',
      message: null,
    });
  });

  it('B20 CORS preflight allows POST from the FE origin', async () => {
    const res = await request(app.getHttpServer())
      .options('/bookings')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');
    expect(res.status).toBeLessThan(300);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });
});
