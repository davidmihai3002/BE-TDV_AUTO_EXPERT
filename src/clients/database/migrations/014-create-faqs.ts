import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('faqs')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('question', 'text', (c) => c.notNull())
    .addColumn('answer', 'text', (c) => c.notNull()) // plain text, no HTML
    .addColumn('page', 'text', (c) => c.notNull().defaultTo('landing')) // future reuse: 'pricing', ...
    .addColumn('sort_order', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('is_published', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();
  await db.schema
    .createIndex('faqs_page_sort_idx')
    .on('faqs')
    .columns(['page', 'sort_order'])
    .execute();

  await sql`
    CREATE TRIGGER faqs_set_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('faqs').execute();
}
