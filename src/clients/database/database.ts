import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';
import { Database } from 'src/types';
import { getDatabaseConfig } from './database-config';

// pg returns numeric (1700) and int8/count (20) as strings by default; the API exposes them as numbers.
types.setTypeParser(1700, (value) => parseFloat(value));
types.setTypeParser(20, (value) => Number(value));

const dialect = new PostgresDialect({
  pool: new Pool({ ...getDatabaseConfig(), max: 10 }),
});

/**
 * Runtime client. CamelCasePlugin maps snake_case columns to camelCase keys.
 * `maintainNestedObjectKeys` keeps JSONB contents (blog content, socials) untouched.
 */
export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
});

export function destroyDb(): Promise<void> {
  return db.destroy();
}
