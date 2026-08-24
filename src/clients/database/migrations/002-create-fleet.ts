import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('fleet')
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('carName', 'text', (column) => column.notNull())
    .addColumn('transmission', 'text', (column) => column.notNull())
    .addColumn('fuel', 'text', (column) => column.notNull())
    .addColumn('imageURL', 'text', (column) => column.notNull())
    .addColumn('successRate', 'numeric', (column) => column.notNull())
    .addColumn('averageGrade', 'numeric', (column) => column.notNull())
    .addColumn('instructorName', 'text', (column) => column.notNull())
    .addColumn('instructorPhoneNumber', 'text', (column) => column.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('fleet').execute();
}
