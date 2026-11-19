import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { db } from 'src/clients';
import { createE2eApp } from './e2e-app';

interface Detail {
  slug: string;
  title: string;
  category: { slug: string; name: string } | null;
  tags: { slug: string; name: string }[];
  author: { name: string; role: string | null; slug: string };
  readTimeMinutes: number;
  coverImage: { url: string; alt: string; width: number | null };
  content: {
    version: number;
    blocks: { type: string; id: string; image?: { url: string } }[];
  };
  images: { key: string }[];
  related: {
    slug: string;
    category: { slug: string } | null;
    image: { url: string };
  }[];
  seo: { title: string; description: string; ogImage: string };
  [key: string]: unknown;
}

const SLUG = 'dinamica-avansata-in-viraje';

// Needs the local DB with migrations 040–045 applied: npm run test:e2e:local
describe('Blog article detail (e2e)', () => {
  let app: NestExpressApplication;
  const get = (url: string) => request(app.getHttpServer()).get(url);

  beforeAll(async () => {
    app = await createE2eApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /blogs/:slug → full article, hydrated figure, no excerpt, cache header', async () => {
    const res = await get(`/blogs/${SLUG}`).expect(200);
    expect(res.headers['cache-control']).toBe(
      'public, max-age=300, stale-while-revalidate=600',
    );
    const body = res.body as Detail;
    expect(body).not.toHaveProperty('excerpt');
    expect(body.title).toMatch(/ă/);
    expect(body.title).toMatch(/î/);
    expect(body.category).toEqual({
      slug: 'maiestrie-tehnica',
      name: 'Măiestrie tehnică',
    });
    expect(body.tags.map((t) => t.slug)).toEqual([
      'avansat',
      'tehnica',
      'viraje',
      'franare',
    ]);
    expect(body.author).toMatchObject({
      slug: 'marcus-vance',
      name: 'Marcus Vance',
      role: 'Instructor tehnic principal',
    });
    expect(
      Number.isInteger(body.readTimeMinutes) && body.readTimeMinutes >= 1,
    ).toBe(true);
    expect(body.coverImage).toMatchObject({
      url: '/images/blogs/dinamica-avansata-in-viraje/cover.jpg',
      width: 512,
    });

    expect(body.content.version).toBe(2);
    expect(body.content.blocks).toHaveLength(14);
    expect(body.content.blocks.map((b) => b.type)).toEqual([
      'paragraph',
      'heading',
      'paragraph',
      'checklist',
      'callout',
      'heading',
      'figure',
      'paragraph',
      'heading',
      'paragraph',
      'steps',
      'heading',
      'paragraph',
      'callout',
    ]);
    const figure = body.content.blocks.find((b) => b.type === 'figure');
    expect(figure?.image?.url).toBe(
      '/images/blogs/dinamica-avansata-in-viraje/diagrama-transfer-greutate.jpg',
    );
    expect(body.images.map((i) => i.key)).toEqual([
      'diagrama-transfer-greutate',
    ]);

    expect(body.related.map((r) => r.slug)).toEqual([
      'oboseala-termica-a-franelor',
      'stapanirea-franarii-la-limita',
      'antrenamentul-privirii-dincolo-de-apex',
    ]);
    expect(body.seo).toEqual({
      title: 'Dinamica avansată în viraje: fizică și precizie',
      description: expect.stringContaining('Cercul de aderență') as string,
      ogImage: '/images/blogs/dinamica-avansata-in-viraje/cover.jpg',
    });
  });

  it('seo.description falls back to the excerpt for posts without one', async () => {
    const body = (
      await get('/blogs/strategii-de-prevenire-a-acvaplanarii').expect(200)
    ).body as Detail;
    expect(body.seo.description).toMatch(/^Adâncimea profilului/);
    expect(body).not.toHaveProperty('excerpt');
    expect(body.content.version).toBe(2);
  });

  it('unknown slug → 404 with the Nest shape; malformed slug → 400', async () => {
    const res = await get('/blogs/does-not-exist').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      message: 'Blog "does-not-exist" not found',
      error: 'Not Found',
    });
    await get('/blogs/Bad_Slug!').expect(400);
  });

  it('static routes keep their own handlers', async () => {
    const res = await get('/blogs/categories').expect(200);
    expect(res.body).toHaveProperty('items');
    expect(
      (res.body as { items: { postCount: number }[] }).items[0],
    ).toHaveProperty('postCount');
  });

  it('a scheduled (future) post → 404', async () => {
    const cat = await db
      .selectFrom('blogCategories')
      .select('id')
      .where('slug', '=', 'maiestrie-tehnica')
      .executeTakeFirstOrThrow();
    const slug = 'e2e-articol-viitor';
    await db
      .insertInto('blogs')
      .values({
        slug,
        title: 'Viitor',
        author: 'E2E',
        excerpt: 'x',
        image: '/x.jpg',
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
      await get(`/blogs/${slug}`).expect(404);
      // and it never shows up as related
      const body = (await get(`/blogs/${SLUG}/related?limit=6`).expect(200))
        .body as {
        items: { slug: string }[];
      };
      expect(body.items.map((i) => i.slug)).not.toContain(slug);
    } finally {
      await db.deleteFrom('blogs').where('slug', '=', slug).execute();
    }
  });

  it('GET /blogs/:slug/related honours limit and 404s for unknown slugs', async () => {
    const body = (await get(`/blogs/${SLUG}/related?limit=2`).expect(200))
      .body as {
      items: { slug: string }[];
    };
    expect(body.items.map((i) => i.slug)).toEqual([
      'oboseala-termica-a-franelor',
      'stapanirea-franarii-la-limita',
    ]);
    await get(`/blogs/${SLUG}/related?limit=7`).expect(400);
    await get('/blogs/does-not-exist/related').expect(404);
  });

  it('an invalid stored block is dropped, not a 500', async () => {
    const row = await db
      .selectFrom('blogs')
      .select(['content'])
      .where('slug', '=', 'traiectoria-ideala-in-viraj')
      .executeTakeFirstOrThrow();
    const broken = {
      version: 2 as const,
      blocks: [
        ...row.content.blocks,
        { type: 'video', id: 'clip' },
      ] as typeof row.content.blocks,
    };
    await db
      .updateTable('blogs')
      .set({ content: broken })
      .where('slug', '=', 'traiectoria-ideala-in-viraj')
      .execute();
    try {
      const body = (await get('/blogs/traiectoria-ideala-in-viraj').expect(200))
        .body as Detail;
      expect(body.content.blocks.map((b) => b.id)).not.toContain('clip');
      expect(body.content.blocks).toHaveLength(row.content.blocks.length);
    } finally {
      await db
        .updateTable('blogs')
        .set({ content: row.content })
        .where('slug', '=', 'traiectoria-ideala-in-viraj')
        .execute();
    }
  });

  it('seed is Romanian with comma-below ș/ț only', async () => {
    const rows = await db
      .selectFrom('blogs')
      .select(['title', 'content', 'imageAlt'])
      .where('author', '=', 'Marcus Vance')
      .execute();
    expect(rows).toHaveLength(5);
    expect(JSON.stringify(rows)).not.toMatch(/[şţŞŢ]/);
  });
});
