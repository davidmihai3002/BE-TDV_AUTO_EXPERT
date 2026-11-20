import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { landingResponseSchema } from 'src/types';
import { createE2eApp } from './e2e-app';

interface Landing {
  sections: Record<string, { title: string; [k: string]: unknown }>;
  stats: { label: string; [k: string]: unknown }[];
  features: { title: string }[];
  fleetHighlights: {
    slug: string;
    carCount: number;
    transmissions: string[];
    badgeLabel: string;
    badgeVariantMobile: string;
  }[];
  faqs: { question: string; answer: string }[];
}

describe('Landing (e2e)', () => {
  let app: NestExpressApplication;
  const landing = async () =>
    (await request(app.getHttpServer()).get('/landing').expect(200))
      .body as Landing;

  beforeAll(async () => {
    app = await createE2eApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /landing: all sections, 4 stats, 3 features, 6 FAQs, camelCase, no internals, cache header', async () => {
    const res = await request(app.getHttpServer()).get('/landing').expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    const body = res.body as Landing;
    expect(landingResponseSchema.safeParse(body).success).toBe(true);
    expect(Object.keys(body.sections).sort()).toEqual([
      'advantage',
      'cta',
      'faq',
      'fleet',
      'hero',
      'insights',
    ]);
    expect(body.sections.hero).toMatchObject({
      title: 'Stăpânește volanul cu ',
      titleHighlight: 'TDV Auto Expert',
      primaryCtaHref: '/flota',
      secondaryCtaHref: '/preturi',
      extra: {
        telemetryLabel: 'Mașini cu dublă comandă disponibile',
        telemetryStatus: 'Înscrieri deschise',
      },
    });
    expect(body.sections.cta).toMatchObject({
      title: 'Ești gata să urci la volan?',
      showOnDesktop: true,
    });
    expect(body.stats.map((s) => s.label)).toEqual([
      'Promovabilitate din prima',
      'Cursanți pregătiți',
      'Instructori autorizați',
      'Ani de experiență',
    ]);
    expect(body.stats[1]).toMatchObject({ value: '5.000', suffix: '+' });
    expect(body.features.map((f) => f.title)).toEqual([
      'Precizie tehnică',
      'Siguranță pe primul loc',
      'Promovare din prima',
    ]);
    expect(body.faqs).toHaveLength(6);
    expect(body.faqs[0].question).toBe(
      'Ce vârstă trebuie să am ca să mă înscriu?',
    );
    expect(JSON.stringify(body)).not.toMatch(
      /sortOrder|isPublished|createdAt|updatedAt|\(\*\)|[şţŞŢ]/,
    );
  });

  it('fleet highlights come from live fleet counts: compacts+sedans 5 cars, both gearboxes; no SUV card', async () => {
    const body = await landing();
    expect(body.fleetHighlights).toEqual([
      expect.objectContaining({
        slug: 'compacte-si-sedanuri',
        carCount: 5,
        transmissions: ['manual', 'automatic'],
        badgeLabel: 'Manual și automat',
        badgeVariantMobile: 'primary',
      }),
    ]);
  });

  it('deactivating a car changes the count', async () => {
    await db
      .updateTable('fleet')
      .set({ isActive: false })
      .where('slug', '=', 'vw-golf-8')
      .execute();
    try {
      expect((await landing()).fleetHighlights[0].carCount).toBe(4);
    } finally {
      await db
        .updateTable('fleet')
        .set({ isActive: true })
        .where('slug', '=', 'vw-golf-8')
        .execute();
    }
  });

  it('an automatic SUV makes the SUV card appear with "Doar automat" (blue on mobile)', async () => {
    await db
      .updateTable('fleet')
      .set({ bodyType: 'suv' as never })
      .where('slug', '=', 'tesla-model-3')
      .execute();
    try {
      const suv = (await landing()).fleetHighlights.find(
        (h) => h.slug === 'suv-uri',
      );
      expect(suv).toMatchObject({
        carCount: 1,
        badgeLabel: 'Doar automat',
        badgeVariantMobile: 'secondary',
      });
    } finally {
      await db
        .updateTable('fleet')
        .set({ bodyType: 'sedan' as never })
        .where('slug', '=', 'tesla-model-3')
        .execute();
    }
  });

  it('unpublished rows disappear', async () => {
    await db
      .updateTable('landingStats')
      .set({ isPublished: false })
      .where('label', '=', 'Cursanți pregătiți')
      .execute();
    try {
      expect((await landing()).stats.map((s) => s.label)).not.toContain(
        'Cursanți pregătiți',
      );
    } finally {
      await db
        .updateTable('landingStats')
        .set({ isPublished: true })
        .where('label', '=', 'Cursanți pregătiți')
        .execute();
    }
  });

  it('GET /faqs: list envelope; invalid query → 400', async () => {
    const res = await request(app.getHttpServer())
      .get('/faqs?limit=2')
      .expect(200);
    expect(res.body).toMatchObject({ total: 6, page: 1, pageSize: 2 });
    expect((res.body as { items: unknown[] }).items).toHaveLength(2);
    expect(
      (await request(app.getHttpServer()).get('/faqs?page=pricing').expect(200))
        .body,
    ).toMatchObject({ total: 0, items: [] });
    for (const qs of ['limit=0', 'limit=abc', 'page=foo']) {
      const bad = await request(app.getHttpServer())
        .get(`/faqs?${qs}`)
        .expect(400);
      expect(bad.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    }
  });
});
