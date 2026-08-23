import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('blogs')

    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )

    .addColumn('title', 'text', (column) => column.notNull())

    .addColumn('slug', 'text', (column) => column.notNull().unique())

    .addColumn('author', 'text', (column) => column.notNull())

    .addColumn('content', 'jsonb', (column) => column.notNull())

    .addColumn('excerpt', 'text', (column) => column.notNull())

    .addColumn('image', 'text', (column) => column.notNull())

    .addColumn('published_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )

    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('blogs').execute();
}
