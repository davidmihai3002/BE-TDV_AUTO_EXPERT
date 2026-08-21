import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from 'src/types/database/database-types';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.LOCAL_DB_ENV,
    host: process.env.LOCAL_DB_HOST,
    user: process.env.LOCAL_DB_USER,
    port: process.env.LOCAL_DB_PORT,
    max: 10,
    password: process.env.LOCAL_DB_PASSWORD,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
