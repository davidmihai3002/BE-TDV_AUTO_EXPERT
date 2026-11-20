import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('pricing_settings')
    .addColumn('id', 'smallint', (c) =>
      c
        .primaryKey()
        .defaultTo(1)
        .check(sql`id = 1`),
    )
    .addColumn('currency', sql`char(3)`, (c) => c.notNull().defaultTo('RON'))
    .addColumn('vat_included', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('processing_fee', sql`numeric(10,2)`, (c) =>
      c
        .notNull()
        .defaultTo(0)
        .check(sql`processing_fee >= 0`),
    )
    .addColumn('processing_fee_label', 'text', (c) => c.notNull())
    .addColumn('min_lessons', 'integer', (c) =>
      c.notNull().check(sql`min_lessons >= 1`),
    )
    .addColumn('max_lessons', 'integer', (c) => c.notNull())
    .addColumn('default_lessons', 'integer', (c) => c.notNull())
    .addColumn('lesson_step', 'integer', (c) =>
      c
        .notNull()
        .defaultTo(1)
        .check(sql`lesson_step >= 1`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addCheckConstraint(
      'pricing_settings_lessons_range',
      sql`min_lessons <= default_lessons AND default_lessons <= max_lessons`,
    )
    .execute();

  await sql`
    CREATE TRIGGER pricing_settings_set_updated_at
    BEFORE UPDATE ON pricing_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('pricing_settings').execute();
}
