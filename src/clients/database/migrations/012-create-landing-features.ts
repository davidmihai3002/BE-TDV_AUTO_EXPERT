import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('landing_features')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('icon', 'text', (c) => c.notNull())
    .addColumn('icon_mobile', 'text')
    .addColumn('accent', 'text', (c) =>
      c.notNull().check(sql`accent in ('primary','secondary','tertiary')`),
    )
    .addColumn('tags', sql`text[]`, (c) =>
      c.notNull().defaultTo(sql`'{}'::text[]`),
    )
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
    CREATE TRIGGER landing_features_set_updated_at
    BEFORE UPDATE ON landing_features
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('landing_features').execute();
}
