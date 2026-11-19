import { Kysely } from 'kysely';

// 04 already added image_alt, updated_at (+ trigger via 005's set_updated_at), read_time_minutes and the
// (category_id, published_at) index; this only adds what the detail page needs on top.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('blogs')
    .addColumn('image_width', 'integer')
    .addColumn('image_height', 'integer')
    .addColumn('seo_title', 'text') // ≤ 70 chars (zod)
    .addColumn('seo_description', 'text') // ≤ 160 chars (zod)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('blogs')
    .dropColumn('seo_description')
    .dropColumn('seo_title')
    .dropColumn('image_height')
    .dropColumn('image_width')
    .execute();
}
