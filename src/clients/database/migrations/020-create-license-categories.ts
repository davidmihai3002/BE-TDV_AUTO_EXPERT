import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('license_categories')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('code', 'text', (c) => c.notNull().unique()) // 'B'
    .addColumn('name', 'text', (c) => c.notNull()) // desktop title
    .addColumn('short_name', 'text', (c) => c.notNull()) // mobile label
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('badge_label', 'text')
    .addColumn('icon', 'text', (c) => c.notNull().defaultTo('directions_car'))
    .addColumn('sort_order', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('is_active', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`
    CREATE TRIGGER license_categories_set_updated_at
    BEFORE UPDATE ON license_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('license_categories').execute();
}
