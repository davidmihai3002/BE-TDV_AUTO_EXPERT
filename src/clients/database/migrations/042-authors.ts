import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('authors')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('role', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('avatar_alt', 'text', (c) => c.notNull().defaultTo(''))
    .addColumn('bio', 'text') // not rendered by this design; returned for a future author box
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // blogs.author (text) stays for the listing; deprecated, to be dropped in a cleanup ticket
  await db.schema
    .alterTable('blogs')
    .addColumn('author_id', 'uuid', (c) =>
      c.references('authors.id').onDelete('set null'),
    )
    .execute();
  await db.schema
    .createIndex('blogs_author_id_idx')
    .on('blogs')
    .column('author_id')
    .execute();

  // one author per distinct legacy name; strip Romanian diacritics first so slugs are ASCII
  await sql`
    INSERT INTO authors (slug, name)
    SELECT DISTINCT trim(BOTH '-' FROM regexp_replace(
             translate(lower(author), 'ăâîșşțţ', 'aaisstt'), '[^a-z0-9]+', '-', 'g')), author
    FROM blogs
    ON CONFLICT (slug) DO NOTHING`.execute(db);
  await sql`UPDATE blogs b SET author_id = a.id FROM authors a WHERE a.name = b.author`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('blogs').dropColumn('author_id').execute();
  await db.schema.dropTable('authors').execute();
}
