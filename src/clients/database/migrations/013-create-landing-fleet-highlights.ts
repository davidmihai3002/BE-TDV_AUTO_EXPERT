import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('landing_fleet_highlights')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('tagline', 'text', (c) => c.notNull())
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('body_types', sql`text[]`, (c) =>
      c
        .notNull()
        .check(
          sql`cardinality(body_types) > 0 and body_types <@ array['compact','hatchback','sedan','coupe','suv']::text[]`,
        ),
    )
    .addColumn('image_url', 'text', (c) => c.notNull())
    .addColumn('image_alt', 'text', (c) => c.notNull())
    .addColumn('highlight_icon', 'text')
    .addColumn('highlight_label', 'text')
    .addColumn('specs', 'jsonb', (c) => c.notNull().defaultTo(sql`'[]'::jsonb`))
    .addColumn('sort_order', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('is_published', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`
    CREATE TRIGGER landing_fleet_highlights_set_updated_at
    BEFORE UPDATE ON landing_fleet_highlights
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('landing_fleet_highlights').execute();
}
