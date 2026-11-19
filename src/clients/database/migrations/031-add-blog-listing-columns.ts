import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('blogs')
    // nullable until 033 backfills existing rows
    .addColumn('category_id', 'uuid', (c) =>
      c.references('blog_categories.id').onDelete('restrict'),
    )
    .addColumn('is_featured', 'boolean', (c) => c.notNull().defaultTo(false))
    .addColumn('read_time_minutes', 'integer', (c) => c.notNull().defaultTo(1))
    .addColumn('image_alt', 'text', (c) => c.notNull().defaultTo(''))
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`ALTER TABLE blogs ADD CONSTRAINT blogs_read_time_positive CHECK (read_time_minutes > 0)`.execute(
    db,
  );

  await db.schema
    .createIndex('blogs_published_at_idx')
    .on('blogs')
    .expression(sql`published_at DESC, id DESC`)
    .execute();
  await db.schema
    .createIndex('blogs_category_published_at_idx')
    .on('blogs')
    .expression(sql`category_id, published_at DESC`)
    .execute();

  // at most one featured post at a time
  await sql`CREATE UNIQUE INDEX blogs_single_featured_idx ON blogs (is_featured) WHERE is_featured`.execute(
    db,
  );

  await sql`
    CREATE TRIGGER blogs_set_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS blogs_set_updated_at ON blogs`.execute(db);
  await sql`DROP INDEX IF EXISTS blogs_single_featured_idx`.execute(db);
  await db.schema
    .dropIndex('blogs_category_published_at_idx')
    .ifExists()
    .execute();
  await db.schema.dropIndex('blogs_published_at_idx').ifExists().execute();
  await db.schema
    .alterTable('blogs')
    .dropConstraint('blogs_read_time_positive')
    .execute();
  await db.schema
    .alterTable('blogs')
    .dropColumn('updated_at')
    .dropColumn('image_alt')
    .dropColumn('read_time_minutes')
    .dropColumn('is_featured')
    .dropColumn('category_id')
    .execute();
}
