import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('fleet')
    .addColumn('slug', 'text')
    .addColumn('series', 'text')
    .addColumn('category', 'text', (c) => c.notNull().defaultTo('fundamentals'))
    .addColumn('badge_label', 'text')
    .addColumn('transmission_label', 'text')
    .addColumn('body_type', 'text')
    .addColumn('horsepower', 'integer')
    .addColumn('zero_to_hundred_seconds', sql`numeric(4,1)`)
    .addColumn('image_alt', 'text', (c) => c.notNull().defaultTo(''))
    .addColumn('instructor_id', 'uuid', (c) =>
      c.references('instructors.id').onDelete('set null'),
    )
    .addColumn('display_order', 'integer', (c) => c.notNull().defaultTo(0))
    .addColumn('is_active', 'boolean', (c) => c.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await sql`UPDATE fleet SET slug = trim(both '-' from regexp_replace(lower(car_name), '[^a-z0-9]+', '-', 'g'))`.execute(
    db,
  );
  await sql`ALTER TABLE fleet ALTER COLUMN slug SET NOT NULL`.execute(db);
  await sql`ALTER TABLE fleet ADD CONSTRAINT fleet_slug_key UNIQUE (slug)`.execute(
    db,
  );

  await sql`
    INSERT INTO instructors (full_name, phone_number)
    SELECT DISTINCT ON (regexp_replace(instructor_phone_number, '\\s', '', 'g'))
           instructor_name, regexp_replace(instructor_phone_number, '\\s', '', 'g')
    FROM fleet
    ON CONFLICT (phone_number) DO NOTHING`.execute(db);
  await sql`
    UPDATE fleet f SET instructor_id = i.id
    FROM instructors i
    WHERE i.phone_number = regexp_replace(f.instructor_phone_number, '\\s', '', 'g')`.execute(
    db,
  );
  await db.schema
    .alterTable('fleet')
    .dropColumn('instructor_name')
    .dropColumn('instructor_phone_number')
    .execute();

  await sql`ALTER TABLE fleet
    ALTER COLUMN success_rate TYPE numeric(5,2), ALTER COLUMN success_rate DROP NOT NULL,
    ALTER COLUMN average_grade TYPE numeric(4,2), ALTER COLUMN average_grade DROP NOT NULL,
    ADD CONSTRAINT fleet_category_check CHECK (category IN ('beginner','fundamentals','advanced','mastery')),
    ADD CONSTRAINT fleet_transmission_check CHECK (transmission IN ('manual','automatic')),
    ADD CONSTRAINT fleet_fuel_check CHECK (fuel IN ('petrol','diesel','hybrid','electric')),
    ADD CONSTRAINT fleet_body_type_check CHECK (body_type IS NULL OR body_type IN ('compact','hatchback','sedan','coupe','suv')),
    ADD CONSTRAINT fleet_horsepower_check CHECK (horsepower IS NULL OR horsepower > 0),
    ADD CONSTRAINT fleet_zero_to_hundred_check CHECK (zero_to_hundred_seconds IS NULL OR zero_to_hundred_seconds > 0),
    ADD CONSTRAINT fleet_success_rate_check CHECK (success_rate IS NULL OR success_rate BETWEEN 0 AND 100),
    ADD CONSTRAINT fleet_average_grade_check CHECK (average_grade IS NULL OR average_grade BETWEEN 1 AND 10)`.execute(
    db,
  );
  await sql`ALTER TABLE fleet ALTER COLUMN category DROP DEFAULT`.execute(db);

  await db.schema
    .createIndex('fleet_active_order_idx')
    .on('fleet')
    .columns(['is_active', 'display_order'])
    .execute();
  await db.schema
    .createIndex('fleet_instructor_id_idx')
    .on('fleet')
    .column('instructor_id')
    .execute();

  await sql`
    CREATE TRIGGER fleet_set_updated_at
    BEFORE UPDATE ON fleet
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS fleet_set_updated_at ON fleet`.execute(db);

  await db.schema
    .alterTable('fleet')
    .addColumn('instructor_name', 'text')
    .addColumn('instructor_phone_number', 'text')
    .execute();
  await sql`UPDATE fleet f SET instructor_name = i.full_name, instructor_phone_number = i.phone_number
            FROM instructors i WHERE i.id = f.instructor_id`.execute(db);
  await sql`UPDATE fleet SET instructor_name = coalesce(instructor_name, ''), instructor_phone_number = coalesce(instructor_phone_number, ''),
            success_rate = coalesce(success_rate, 0), average_grade = coalesce(average_grade, 0)`.execute(
    db,
  );
  await sql`ALTER TABLE fleet
    ALTER COLUMN instructor_name SET NOT NULL, ALTER COLUMN instructor_phone_number SET NOT NULL,
    DROP CONSTRAINT fleet_category_check, DROP CONSTRAINT fleet_transmission_check, DROP CONSTRAINT fleet_fuel_check,
    DROP CONSTRAINT fleet_body_type_check, DROP CONSTRAINT fleet_horsepower_check, DROP CONSTRAINT fleet_zero_to_hundred_check,
    DROP CONSTRAINT fleet_success_rate_check, DROP CONSTRAINT fleet_average_grade_check,
    ALTER COLUMN success_rate TYPE numeric, ALTER COLUMN success_rate SET NOT NULL,
    ALTER COLUMN average_grade TYPE numeric, ALTER COLUMN average_grade SET NOT NULL`.execute(
    db,
  );
  await db.schema.dropIndex('fleet_active_order_idx').execute();
  await db.schema.dropIndex('fleet_instructor_id_idx').execute();
  await db.schema
    .alterTable('fleet')
    .dropColumn('slug')
    .dropColumn('series')
    .dropColumn('category')
    .dropColumn('badge_label')
    .dropColumn('transmission_label')
    .dropColumn('body_type')
    .dropColumn('horsepower')
    .dropColumn('zero_to_hundred_seconds')
    .dropColumn('image_alt')
    .dropColumn('instructor_id')
    .dropColumn('display_order')
    .dropColumn('is_active')
    .dropColumn('created_at')
    .dropColumn('updated_at')
    .execute();
}
