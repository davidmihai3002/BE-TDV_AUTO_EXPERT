import { Kysely, sql } from 'kysely';

// content.blocks[].imageKey → blog_images.key can't be an FK; the insert script and the seed enforce it.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('blog_images')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('blog_id', 'uuid', (c) =>
      c.notNull().references('blogs.id').onDelete('cascade'),
    )
    .addColumn('key', 'text', (c) => c.notNull())
    .addColumn('url', 'text', (c) => c.notNull())
    .addColumn('alt', 'text', (c) => c.notNull())
    .addColumn('caption', 'text') // default caption; a figure block's caption overrides it
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('position', 'smallint', (c) => c.notNull().defaultTo(0))
    .addUniqueConstraint('blog_images_blog_id_key_key', ['blog_id', 'key'])
    .execute();
  await db.schema
    .createIndex('blog_images_blog_id_position_idx')
    .on('blog_images')
    .columns(['blog_id', 'position'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('blog_images').execute();
}
