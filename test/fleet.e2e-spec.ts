import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { createE2eApp } from './e2e-app';

interface Car {
  id: string;
  slug: string;
  successRate: unknown;
  averageGrade: unknown;
  zeroToHundredSeconds: unknown;
  instructor: unknown;
}
interface ListBody {
  items: Car[];
  total: number;
  page: number;
  pageSize: number;
  facets: Record<string, Record<string, number>>;
}

const ALL_SLUGS = [
  'audi-r8-lms',
  'volkswagen-golf-r',
  'honda-civic-si',
  'vw-golf-8',
  'audi-a4-s-line',
  'tesla-model-3',
];

// Needs the local DB with migrations 050–053 applied: npm run test:e2e:local
describe('Fleet (e2e)', () => {
  let app: NestExpressApplication;
  const get = (url: string) => request(app.getHttpServer()).get(url);
  const list = async (qs = '') =>
    (await get(`/fleet${qs}`).expect(200)).body as ListBody;
  const slugs = (b: ListBody) => b.items.map((c) => c.slug);

  beforeAll(async () => {
    app = await createE2eApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /fleet → envelope, display order, numbers, cache header', async () => {
    const res = await get('/fleet').expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    const body = res.body as ListBody;
    expect(slugs(body)).toEqual(ALL_SLUGS);
    expect(body).toMatchObject({ total: 6, page: 1, pageSize: 24 });
    const r8 = body.items[0];
    expect(typeof r8.successRate).toBe('number');
    expect(typeof r8.averageGrade).toBe('number');
    expect(r8.zeroToHundredSeconds).toBe(3.2);
    expect(r8.instructor).toMatchObject({
      fullName: 'Andrei Ionescu',
      phoneNumber: '+40721555101',
    });
    expect(r8).not.toHaveProperty('isActive');
    expect(body.facets).toEqual({
      transmission: { manual: 2, automatic: 4 },
      fuel: { petrol: 5, diesel: 0, hybrid: 0, electric: 1 },
      category: { beginner: 1, fundamentals: 1, advanced: 2, mastery: 2 },
    });
  });

  it('filters: single, csv, repeated, combined; facets ignore filters', async () => {
    const all = await list();
    const manual = await list('?transmission=manual');
    expect(slugs(manual)).toEqual(['volkswagen-golf-r', 'audi-a4-s-line']);
    expect(manual.total).toBe(2);
    expect(slugs(await list('?fuel=electric'))).toEqual(['tesla-model-3']);
    expect((await list('?category=advanced,mastery')).total).toBe(4);
    expect((await list('?category=advanced&category=mastery')).total).toBe(4);
    const combined = await list('?transmission=automatic&fuel=petrol');
    expect(slugs(combined)).toEqual([
      'audi-r8-lms',
      'honda-civic-si',
      'vw-golf-8',
    ]);
    expect(slugs(await list('?bodyType=sedan')).length).toBe(3);
    expect(manual.facets).toEqual(all.facets);
    expect(combined.facets).toEqual(all.facets);
  });

  it('pagination', async () => {
    const p2 = await list('?page=2&pageSize=4');
    expect(slugs(p2)).toEqual(['audi-a4-s-line', 'tesla-model-3']);
    expect(p2).toMatchObject({ total: 6, page: 2, pageSize: 4 });
  });

  it('invalid query → 400 with issues; unknown keys ignored', async () => {
    const res = await get('/fleet?fuel=lpg').expect(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
    });
    expect((res.body as { issues: { path: string }[] }).issues[0].path).toBe(
      'fuel.0',
    );
    await get('/fleet?pageSize=51').expect(400);
    expect((await list('?foo=bar')).total).toBe(6);
  });

  it('GET /fleet/:slug and /fleet/:uuid return the same car; unknown → 404; bad param → 400', async () => {
    const bySlug = (await get('/fleet/tesla-model-3').expect(200)).body as Car;
    const byId = (await get(`/fleet/${bySlug.id}`).expect(200)).body as Car;
    expect(byId).toEqual(bySlug);
    const nf = await get('/fleet/nope').expect(404);
    expect(nf.body).toMatchObject({
      statusCode: 404,
      message: 'Fleet car "nope" not found',
    });
    await get('/fleet/Not_A_Slug!').expect(400);
  });

  it('inactive cars disappear from list, facets and detail', async () => {
    await db
      .updateTable('fleet')
      .set({ isActive: false })
      .where('slug', '=', 'tesla-model-3')
      .execute();
    try {
      const body = await list();
      expect(slugs(body)).not.toContain('tesla-model-3');
      expect(body.facets.fuel.electric).toBe(0);
      await get('/fleet/tesla-model-3').expect(404);
    } finally {
      await db
        .updateTable('fleet')
        .set({ isActive: true })
        .where('slug', '=', 'tesla-model-3')
        .execute();
    }
  });

  it('inactive instructor → instructor: null', async () => {
    await db
      .updateTable('instructors')
      .set({ isActive: false })
      .where('phoneNumber', '=', '+40724555404')
      .execute();
    try {
      const car = (await get('/fleet/tesla-model-3').expect(200)).body as Car;
      expect(car.instructor).toBeNull();
    } finally {
      await db
        .updateTable('instructors')
        .set({ isActive: true })
        .where('phoneNumber', '=', '+40724555404')
        .execute();
    }
  });
});
