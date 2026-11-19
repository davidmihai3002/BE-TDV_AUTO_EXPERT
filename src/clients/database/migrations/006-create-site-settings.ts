import { Kysely, sql } from 'kysely';

// Single-row table: id is fixed to 1.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('site_settings')
    .addColumn('id', 'smallint', (c) =>
      c
        .primaryKey()
        .defaultTo(1)
        .check(sql`id = 1`),
    )
    .addColumn('brand_name', 'text', (c) => c.notNull())
    .addColumn('tagline', 'text', (c) => c.notNull())
    .addColumn('footer_description', 'text', (c) => c.notNull())
    .addColumn('copyright_text', 'text', (c) => c.notNull())
    .addColumn('contact_phone', 'text')
    .addColumn('contact_email', 'text')
    .addColumn('contact_address', 'text')
    .addColumn('contact_schedule', 'text')
    .addColumn('currency', sql`char(3)`, (c) => c.notNull().defaultTo('RON'))
    .addColumn('privacy_url', 'text')
    .addColumn('terms_url', 'text')
    .addColumn('socials', 'jsonb', (c) =>
      c.notNull().defaultTo(sql`'[]'::jsonb`),
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`
    CREATE TRIGGER site_settings_set_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('site_settings').execute();
}
