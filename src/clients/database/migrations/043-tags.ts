import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tags')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('name', 'text', (c) => c.notNull())
    .execute();

  await db.schema
    .createTable('blog_tags')
    .addColumn('blog_id', 'uuid', (c) =>
      c.notNull().references('blogs.id').onDelete('cascade'),
    )
    .addColumn('tag_id', 'uuid', (c) =>
      c.notNull().references('tags.id').onDelete('cascade'),
    )
    .addColumn('position', 'smallint', (c) => c.notNull().defaultTo(0))
    .addPrimaryKeyConstraint('blog_tags_pkey', ['blog_id', 'tag_id'])
    .execute();
  await db.schema
    .createIndex('blog_tags_tag_id_idx')
    .on('blog_tags')
    .column('tag_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('blog_tags').execute();
  await db.schema.dropTable('tags').execute();
}
