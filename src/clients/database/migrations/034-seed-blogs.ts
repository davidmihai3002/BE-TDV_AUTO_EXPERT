// MOCK DATA — to be replaced (plan §9 D4). Rows live in ../seeds/blogs-seed-data.ts so ticket 05 can extend them.
import { Kysely, sql } from 'kysely';
import { BLOGS_SEED } from '../seeds/blogs-seed-data';

export async function up(db: Kysely<any>): Promise<void> {
  // The Migrator runs each migration in a transaction, so un-featuring + insert is atomic.
  if (BLOGS_SEED.some((b) => b.isFeatured)) {
    await db
      .updateTable('blogs')
      .set({ is_featured: false })
      .where('is_featured', '=', true)
      .where(
        'slug',
        'not in',
        BLOGS_SEED.map((b) => b.slug),
      )
      .execute();
  }

  await db
    .insertInto('blogs')
    .values(
      BLOGS_SEED.map((b) => ({
        slug: b.slug,
        title: b.title,
        author: b.author,
        excerpt: b.excerpt,
        image: b.image,
        image_alt: b.imageAlt,
        content: JSON.stringify(b.content),
        is_featured: b.isFeatured,
        read_time_minutes: b.readTimeMinutes,
        published_at: b.publishedAt,
        category_id: sql<string>`(SELECT id FROM blog_categories WHERE slug = ${b.categorySlug})`,
      })),
    )
    .onConflict((oc) => oc.column('slug').doNothing())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('blogs')
    .where(
      'slug',
      'in',
      BLOGS_SEED.map((b) => b.slug),
    )
    .execute();
}
