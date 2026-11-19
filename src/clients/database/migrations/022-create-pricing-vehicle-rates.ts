import { Kysely, sql } from 'kysely';

// Per-car, per-category lesson price. Separate table so 06's `fleet` schema stays untouched.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('pricing_vehicle_rates')
    .addColumn('fleet_id', 'uuid', (c) =>
      c.notNull().references('fleet.id').onDelete('cascade'),
    )
    .addColumn('license_category_id', 'uuid', (c) =>
      c.notNull().references('license_categories.id').onDelete('restrict'),
    )
    .addColumn('lesson_price', sql`numeric(10,2)`, (c) =>
      c.notNull().check(sql`lesson_price > 0`),
    )
    .addColumn('currency', sql`char(3)`, (c) => c.notNull().defaultTo('RON'))
    .addColumn('is_active', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addPrimaryKeyConstraint('pricing_vehicle_rates_pk', [
      'fleet_id',
      'license_category_id',
    ])
    .execute();

  await sql`
    CREATE TRIGGER pricing_vehicle_rates_set_updated_at
    BEFORE UPDATE ON pricing_vehicle_rates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('pricing_vehicle_rates').execute();
}
