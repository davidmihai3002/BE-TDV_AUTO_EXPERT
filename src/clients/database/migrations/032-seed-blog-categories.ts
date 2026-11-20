import { Kysely } from 'kysely';
import { BLOG_CATEGORIES_SEED } from '../seeds/blogs-seed-data';

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('blog_categories')
    .values(
      BLOG_CATEGORIES_SEED.map((c) => ({
        slug: c.slug,
        name: c.name,
        sort_order: c.sortOrder,
      })),
    )
    .onConflict((oc) => oc.column('slug').doNothing())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  const slugs = BLOG_CATEGORIES_SEED.map((c) => c.slug);
  await db
    .updateTable('blogs')
    .set({ category_id: null })
    .where(
      'category_id',
      'in',
      db.selectFrom('blog_categories').select('id').where('slug', 'in', slugs),
    )
    .execute();
  await db.deleteFrom('blog_categories').where('slug', 'in', slugs).execute();
}
