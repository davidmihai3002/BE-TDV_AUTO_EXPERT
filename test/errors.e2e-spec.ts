import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { FleetOperations } from 'src/clients';
import { createE2eApp } from './e2e-app';

// Error contract for every endpoint (ticket 07 §6.3). Needs the local DB: npm run test:e2e:local
describe('Error envelope (e2e)', () => {
  let app: NestExpressApplication;
  const server = () => app.getHttpServer();
  const expectEnvelope = (
    body: Record<string, unknown>,
    statusCode: number,
    error: string,
  ) => {
    expect(body).toMatchObject({ statusCode, error });
    expect(
      typeof body.message === 'string' || Array.isArray(body.message),
    ).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(
      /at \w+ \(|select |insert |postgres|\.ts:\d+/i,
    );
  };

  beforeAll(async () => {
    app = await createE2eApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.restoreAllMocks());

  it('unknown route → 404 "Cannot GET /nope"', async () => {
    const res = await request(server()).get('/nope').expect(404);
    expectEnvelope(res.body as Record<string, unknown>, 404, 'Not Found');
    expect(res.body).toMatchObject({ message: 'Cannot GET /nope' });
    expect(res.headers['content-type']).toMatch(
      /application\/json; charset=utf-8/,
    );
  });

  it('unknown method on a known path → 404', async () => {
    const res = await request(server()).delete('/blogs').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      message: 'Cannot DELETE /blogs',
      error: 'Not Found',
    });
  });

  it('unknown blog slug and unknown / malformed fleet id → 404', async () => {
    const blog = await request(server())
      .get('/blogs/does-not-exist')
      .expect(404);
    expect(blog.body).toMatchObject({
      message: 'Blog "does-not-exist" not found',
    });
    const uuid = '0b9c1c1e-6d0b-4a51-9b4e-1f3c1a2b3c4d';
    const fleet = await request(server()).get(`/fleet/${uuid}`).expect(404);
    expect(fleet.body).toMatchObject({
      message: `Fleet car "${uuid}" not found`,
    });
    const malformed = await request(server()).get('/fleet/abc').expect(404);
    expect(malformed.body).toMatchObject({
      statusCode: 404,
      message: 'Fleet car "abc" not found',
    });
  });

  it('zod validation failure → 400', async () => {
    const res = await request(server())
      .get('/fleet?transmission=boat')
      .expect(400);
    expectEnvelope(res.body as Record<string, unknown>, 400, 'Bad Request');
  });

  it('malformed JSON body → 400 "Malformed JSON body"', async () => {
    const res = await request(server())
      .post('/pricing/quote')
      .set('Content-Type', 'application/json')
      .send('{"categoryCode":"B",')
      .expect(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      message: 'Malformed JSON body',
      error: 'Bad Request',
    });
  });

  it('pg invalid text representation (22P02) → 404', async () => {
    jest
      .spyOn(FleetOperations.prototype, 'getFleetCarBySlug')
      .mockRejectedValue(
        Object.assign(new Error('invalid input syntax for type uuid: "x"'), {
          code: '22P02',
        }),
      );
    const res = await request(server()).get('/fleet/x').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      message: 'Not Found',
      error: 'Not Found',
    });
  });

  it('pg unique violation (23505) → 409', async () => {
    jest
      .spyOn(FleetOperations.prototype, 'getFleetCarBySlug')
      .mockRejectedValue(
        Object.assign(
          new Error('duplicate key value violates unique constraint'),
          { code: '23505' },
        ),
      );
    const res = await request(server()).get('/fleet/x').expect(409);
    expect(res.body).toMatchObject({
      statusCode: 409,
      message: 'Resource already exists',
      error: 'Conflict',
    });
  });

  it('database unavailable → 503 without driver details', async () => {
    jest
      .spyOn(FleetOperations.prototype, 'getFleetCarBySlug')
      .mockRejectedValue(
        Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
          code: 'ECONNREFUSED',
        }),
      );
    const res = await request(server()).get('/fleet/x').expect(503);
    expect(res.body).toMatchObject({
      statusCode: 503,
      message: 'Service temporarily unavailable',
      error: 'Service Unavailable',
    });
    expect(JSON.stringify(res.body)).not.toContain('5432');
  });

  it('any other thrown value → generic 500, no leak', async () => {
    jest
      .spyOn(FleetOperations.prototype, 'getFleetCarBySlug')
      .mockRejectedValue(new Error('select * from secret_table'));
    const res = await request(server()).get('/fleet/x').expect(500);
    expect(res.body).toMatchObject({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });

  it('x-request-id: generated on every response, valid incoming ids echoed, invalid ones replaced', async () => {
    const ok = await request(server()).get('/health').expect(200);
    expect(ok.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    const err = await request(server()).get('/nope').expect(404);
    expect(err.headers['x-request-id']).toBeTruthy();
    const echoed = await request(server())
      .get('/health')
      .set('x-request-id', 'client-abc-12345');
    expect(echoed.headers['x-request-id']).toBe('client-abc-12345');
    const bad = await request(server())
      .get('/health')
      .set('x-request-id', 'bad id!');
    expect(bad.headers['x-request-id']).not.toBe('bad id!');
  });

  it('CORS exposes x-request-id to the browser', async () => {
    const res = await request(server())
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-expose-headers']).toMatch(
      /x-request-id/i,
    );
  });
});
