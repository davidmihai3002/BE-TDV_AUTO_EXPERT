import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { db } from 'src/clients';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter, paginate } from 'src/common';

// Needs the local DB with migrations applied: npm run test:e2e:local
describe('Foundation (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health → 200 ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'up' });
  });

  it('GET /site-settings → Romanian seed, RON, cache header', async () => {
    const res = await request(app.getHttpServer())
      .get('/site-settings')
      .expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    expect(res.body).toMatchObject({
      brandName: 'TDV Auto Expert',
      copyrightText: 'TDV Auto Expert. Toate drepturile rezervate.',
      currency: 'RON',
      contact: {
        phone: '+40 700 000 000',
        address: 'Str. Exemplu nr. 1, București',
      },
    });
    expect(res.body).not.toHaveProperty('bookingUrl');
  });

  it('GET /fleet → camelCase keys and numbers', async () => {
    const res = await request(app.getHttpServer()).get('/fleet').expect(200);
    const [first] = (res.body as { items: Record<string, unknown>[] }).items;
    expect(first).toHaveProperty('imageUrl');
    expect(first).not.toHaveProperty('imageURL');
    expect(typeof first.successRate).toBe('number');
  });

  it('unknown route → normalised 404', async () => {
    const res = await request(app.getHttpServer()).get('/nope').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      path: '/nope',
    });
  });

  it('paginate(): page 2 / pageSize 2 over the fleet', async () => {
    const total = Number(
      (
        await db
          .selectFrom('fleet')
          .select((eb) => eb.fn.countAll().as('c'))
          .executeTakeFirstOrThrow()
      ).c,
    );
    const result = await paginate(
      db.selectFrom('fleet').selectAll().orderBy('carName'),
      { page: 2, pageSize: 2 },
    );
    expect(result.total).toBe(total);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(Math.min(2, Math.max(0, total - 2)));
  });
});
