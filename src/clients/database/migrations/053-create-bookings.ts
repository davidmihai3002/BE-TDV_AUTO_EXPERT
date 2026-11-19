import { Kysely, sql } from 'kysely';

// Booking requests (plan §9 D3). quoted_total stays NULL until 03 wires PricingService.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bookings')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('fleet_id', 'uuid', (c) =>
      c.notNull().references('fleet.id').onDelete('restrict'),
    )
    .addColumn('instructor_id', 'uuid', (c) =>
      c.references('instructors.id').onDelete('set null'),
    )
    .addColumn('full_name', 'text', (c) =>
      c.notNull().check(sql`char_length(full_name) BETWEEN 3 AND 100`),
    )
    .addColumn('phone', 'text', (c) =>
      c.notNull().check(sql`phone ~ '^\\+407[0-9]{8}$'`),
    )
    .addColumn('email', 'text')
    .addColumn('preferred_date', 'date', (c) => c.notNull())
    .addColumn('preferred_time_slot', 'text', (c) =>
      c
        .notNull()
        .check(sql`preferred_time_slot IN ('dimineata','pranz','seara')`),
    )
    .addColumn('license_category', 'text')
    .addColumn('lessons_count', 'integer', (c) =>
      c.check(sql`lessons_count IS NULL OR lessons_count > 0`),
    )
    .addColumn('quoted_total', sql`numeric(10,2)`, (c) =>
      c.check(sql`quoted_total IS NULL OR quoted_total >= 0`),
    )
    .addColumn('currency', sql`char(3)`, (c) => c.notNull().defaultTo('RON'))
    .addColumn('message', 'text', (c) =>
      c.check(sql`message IS NULL OR char_length(message) <= 1000`),
    )
    .addColumn('gdpr_consent_at', 'timestamptz', (c) => c.notNull())
    .addColumn('status', 'text', (c) =>
      c
        .notNull()
        .defaultTo('noua')
        .check(sql`status IN ('noua','confirmata','anulata')`),
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('bookings_fleet_id_idx')
    .on('bookings')
    .column('fleet_id')
    .execute();
  await db.schema
    .createIndex('bookings_created_at_idx')
    .on('bookings')
    .expression(sql`created_at DESC`)
    .execute();
  await db.schema
    .createIndex('bookings_status_idx')
    .on('bookings')
    .column('status')
    .execute();

  await sql`
    CREATE TRIGGER bookings_set_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('bookings').execute(); // drops its indexes and trigger
}
