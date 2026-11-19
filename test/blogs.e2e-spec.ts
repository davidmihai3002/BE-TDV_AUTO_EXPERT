import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { BLOGS_SEED } from 'src/clients/database/seeds/blogs-seed-data';
import { createE2eApp } from './e2e-app';

interface Item {
  slug: string;
  readTimeMinutes: unknown;
  category: { slug: string; name: string };
  [key: string]: unknown;
}
interface ListBody {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
}

const SEED_SLUGS = BLOGS_SEED.map((b) => b.slug);
const FEATURED = 'dinamica-avansata-in-viraje';
// non-featured seed posts in published_at DESC order (desktop cards 1–4, then mobile rows)
const GRID = SEED_SLUGS.filter((s) => s !== FEATURED);

// Needs the local DB with migrations 030–035 applied: npm run test:e2e:local
// Tolerates extra (non-seed) blogs a developer inserted locally: exact counts use seed-only filters.
describe('Blogs listing (e2e)', () => {
  let app: NestExpressApplication;
  let extraBlogs = 0;
  const get = (url: string) => request(app.getHttpServer()).get(url);
  const list = async (qs = '') =>
    (await get(`/blogs${qs}`).expect(200)).body as ListBody;
  const seedOnly = (b: ListBody) =>
    b.items.map((i) => i.slug).filter((s) => SEED_SLUGS.includes(s));

  beforeAll(async () => {
    app = await createE2eApp();
    const row = await db
      .selectFrom('blogs')
      .select((eb) => eb.fn.countAll<number>().as('c'))
      .where('slug', 'not in', SEED_SLUGS)
      .where('publishedAt', '<=', new Date())
      .executeTakeFirstOrThrow();
    extraBlogs = Number(row.c);
  });
  afterAll(async () => {
    await app.close();
  });

  it('default listing: envelope, pageSize 6, no content, camelCase, cache header', async () => {
    const res = await get('/blogs').expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=60');
    const body = res.body as ListBody;
    expect(body).toMatchObject({ page: 1, pageSize: 6, total: 9 + extraBlogs });
    expect(body.items).toHaveLength(6);
    for (const item of body.items) {
      expect(item).not.toHaveProperty('content');
      expect(item).not.toHaveProperty('categoryId');
      expect(typeof item.readTimeMinutes).toBe('number');
      expect(item.category).toEqual({
        slug: expect.any(String) as string,
        name: expect.any(String) as string,
      });
    }
  });

  it('featured=false keeps the seed grid order and paginates', async () => {
    const all = await list('?featured=false&pageSize=24');
    expect(all.total).toBe(8 + extraBlogs);
    expect(seedOnly(all)).toEqual(GRID);
    const p2 = await list(`?featured=false&page=2&pageSize=6`);
    expect(p2.page).toBe(2);
    expect(p2.items.length).toBe(Math.min(6, all.total - 6));
  });

  it('featured=true returns only the featured post', async () => {
    const body = await list('?featured=true&pageSize=1');
    expect(body.items.map((i) => i.slug)).toEqual([FEATURED]);
    expect(body.items[0]).toMatchObject({
      isFeatured: true,
      category: { slug: 'maiestrie-tehnica', name: 'Măiestrie tehnică' },
    });
  });

  it('category filter; unknown category → empty 200', async () => {
    // ticket 05 adds a related stub to this category, so compare the 04 seed posts only
    const body = await list('?category=condus-defensiv');
    expect(seedOnly(body)).toEqual([
      'condusul-pe-timp-de-noapte-scanarea-vizuala',
      'condus-defensiv-avansat-stapanirea-apexului',
    ]);
    expect(body.items.every((i) => i.category.slug === 'condus-defensiv')).toBe(
      true,
    );
    expect(await list('?category=nope')).toMatchObject({ items: [], total: 0 });
  });

  it('limit alias (ticket 02) and pageSize precedence', async () => {
    expect((await list('?limit=3')).items).toHaveLength(3);
    expect((await list('?limit=3')).pageSize).toBe(3);
    expect((await list('?limit=3&pageSize=5')).pageSize).toBe(5);
  });

  it('sort=oldest reverses the order', async () => {
    const oldest = await list('?sort=oldest&pageSize=24');
    expect(seedOnly(oldest)).toEqual([...SEED_SLUGS].reverse());
  });

  it.each([
    '?pageSize=25',
    '?page=0',
    '?sort=foo',
    '?category=Bad%20Slug',
    '?featured=yes',
    '?search=a',
  ])('%s → 400 in the Nest error shape', async (qs) => {
    const res = await get(`/blogs${qs}`).expect(400);
    expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
  });

  it.each(['scoala', 'școală', 'ȘCOALĂ', 'şcoală'])(
    'search "%s" is diacritics- and case-insensitive',
    async (term) => {
      const body = await list(`?search=${encodeURIComponent(term)}`);
      expect(seedOnly(body)).toEqual([
        'verificarea-de-5-minute-inainte-de-plecare',
      ]);
    },
  );

  it('search matches substrings and escapes LIKE wildcards', async () => {
    expect(seedOnly(await list('?search=acvaplan'))).toEqual([
      'combaterea-acvaplanarii-raspunsul-senzorilor-activi',
      'strategii-de-prevenire-a-acvaplanarii',
    ]);
    expect((await list(`?search=${encodeURIComponent('50%')}`)).total).toBe(0);
    expect((await list(`?search=${encodeURIComponent('__')}`)).total).toBe(0);
  });

  it('GET /blogs/categories: 8 Romanian categories in sort order with post counts', async () => {
    const res = await get('/blogs/categories').expect(200);
    const items = (
      res.body as { items: { slug: string; name: string; postCount: number }[] }
    ).items;
    expect(items.map((c) => c.slug)).toEqual([
      'mecanica-conducerii',
      'protocoale-de-siguranta',
      'tehnologia-flotei',
      'perspectiva-instructorilor',
      'condus-defensiv',
      'intretinerea-vehiculului',
      'siguranta-rutiera',
      'maiestrie-tehnica',
    ]);
    expect(items.find((c) => c.slug === 'intretinerea-vehiculului')?.name).toBe(
      'Întreținerea vehiculului',
    );
    const counts = Object.fromEntries(items.map((c) => [c.slug, c.postCount]));
    expect(counts['condus-defensiv']).toBeGreaterThanOrEqual(2);
    expect(counts['siguranta-rutiera']).toBe(1);
    expect(counts['perspectiva-instructorilor']).toBeGreaterThanOrEqual(1);
  });

  it('future (scheduled) posts are hidden from the listing and counts', async () => {
    const cat = await db
      .selectFrom('blogCategories')
      .select('id')
      .where('slug', '=', 'siguranta-rutiera')
      .executeTakeFirstOrThrow();
    const slug = 'e2e-articol-programat';
    await db
      .insertInto('blogs')
      .values({
        slug,
        title: 'Articol programat',
        author: 'E2E',
        excerpt: 'x',
        image: 'https://example.com/x.jpg',
        content: {
          version: 2,
          blocks: [{ type: 'paragraph', id: 'p', variant: 'body', text: 'x' }],
        },
        categoryId: cat.id,
        readTimeMinutes: 1,
        publishedAt: new Date(Date.now() + 86_400_000),
      })
      .execute();
    try {
      const body = await list('?category=siguranta-rutiera');
      expect(body.items.map((i) => i.slug)).not.toContain(slug);
      const cats = (await get('/blogs/categories').expect(200)).body as {
        items: { slug: string; postCount: number }[];
      };
      expect(
        cats.items.find((c) => c.slug === 'siguranta-rutiera')?.postCount,
      ).toBe(1);
    } finally {
      await db.deleteFrom('blogs').where('slug', '=', slug).execute();
    }
  });

  it('a second featured post is rejected by blogs_single_featured_idx', async () => {
    await expect(
      db
        .updateTable('blogs')
        .set({ isFeatured: true })
        .where('slug', '=', 'condus-defensiv-avansat-stapanirea-apexului')
        .execute(),
    ).rejects.toThrow(/blogs_single_featured_idx/);
  });

  it('seed copy is UTF-8 Romanian with comma-below ș/ț (no cedilla)', async () => {
    const rows = await db
      .selectFrom('blogs')
      .select(['title', 'excerpt', 'imageAlt'])
      .where('slug', 'in', SEED_SLUGS)
      .execute();
    expect(rows).toHaveLength(9);
    expect(JSON.stringify(rows)).not.toMatch(/[şţŞŢ]/);
    expect(JSON.stringify(rows)).toMatch(/ș/);
  });
});
