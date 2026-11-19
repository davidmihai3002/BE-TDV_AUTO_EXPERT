import { Kysely, sql } from 'kysely';

// Marketing figures stored as ro-RO display text ('5.000'), not metrics.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('landing_stats')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('value', 'text', (c) => c.notNull())
    .addColumn('suffix', 'text')
    .addColumn('short_suffix', 'text') // mobile override
    .addColumn('label', 'text', (c) => c.notNull())
    .addColumn('short_label', 'text') // mobile override
    .addColumn('accent', 'text', (c) =>
      c.notNull().check(sql`accent in ('primary','secondary','tertiary')`),
    )
    .addColumn('accent_mobile', 'text', (c) =>
      c.check(
        sql`accent_mobile is null or accent_mobile in ('primary','secondary','tertiary')`,
      ),
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
  await db.schema
    .createIndex('landing_stats_sort_idx')
    .on('landing_stats')
    .column('sort_order')
    .execute();

  await sql`
    CREATE TRIGGER landing_stats_set_updated_at
    BEFORE UPDATE ON landing_stats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('landing_stats').execute();
}
