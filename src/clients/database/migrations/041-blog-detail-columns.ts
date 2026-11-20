import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('blogs')
    .addColumn('image_width', 'integer')
    .addColumn('image_height', 'integer')
    .addColumn('seo_title', 'text')
    .addColumn('seo_description', 'text')
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
