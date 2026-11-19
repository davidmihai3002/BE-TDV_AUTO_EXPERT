import { Kysely, sql } from 'kysely';

// Landing page copy blocks (hero, advantage, fleet, insights, faq, cta), keyed by `key`.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('landing_sections')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('key', 'text', (c) =>
      c
        .notNull()
        .unique()
        .check(sql`key in ('hero','advantage','fleet','insights','faq','cta')`),
    )
    .addColumn('eyebrow', 'text')
    .addColumn('eyebrow_icon', 'text')
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('title_highlight', 'text')
    .addColumn('title_suffix', 'text')
    .addColumn('subtitle', 'text')
    .addColumn('primary_cta_label', 'text')
    .addColumn('primary_cta_href', 'text')
    .addColumn('secondary_cta_label', 'text')
    .addColumn('secondary_cta_href', 'text')
    .addColumn('secondary_cta_icon', 'text')
    .addColumn('image_url', 'text')
    .addColumn('image_alt', 'text')
    .addColumn('image_alt_mobile', 'text')
    .addColumn('extra', 'jsonb', (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('show_on_desktop', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('show_on_mobile', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`
    CREATE TRIGGER landing_sections_set_updated_at
    BEFORE UPDATE ON landing_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('landing_sections').execute();
}
