import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';
import { Database } from 'src/types';
import { getDatabaseConfig } from './database-config';

types.setTypeParser(1700, (value) => parseFloat(value));
types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1082, (value) => value);

const dialect = new PostgresDialect({
  pool: new Pool({ ...getDatabaseConfig(), max: 10 }),
});

export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
});

export function destroyDb(): Promise<void> {
  return db.destroy();
}
