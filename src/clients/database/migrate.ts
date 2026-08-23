import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { Kysely, PostgresDialect } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import { Pool } from 'pg';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function migrateToLatest(): Promise<void> {
  const port = Number(getRequiredEnv('LOCAL_DB_PORT'));

  if (Number.isNaN(port)) {
    throw new Error('LOCAL_DB_PORT must be a valid number');
  }

  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: getRequiredEnv('LOCAL_DB_HOST'),
        port,
        database: getRequiredEnv('LOCAL_DB_ENV'),
        user: getRequiredEnv('LOCAL_DB_USER'),
        password: getRequiredEnv('LOCAL_DB_PASSWORD'),
      }),
    }),
  });

  const migrator = new Migrator({
    db,

    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(
        process.cwd(),
        'src/clients/database/migrations',
      ),
    }),
  });

  try {
    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((result) => {
      if (result.status === 'Success') {
        console.log(
          `Migration "${result.migrationName}" completed successfully`,
        );
      }

      if (result.status === 'Error') {
        console.error(`Migration "${result.migrationName}" failed`);
      }
    });

    if (error) {
      throw error;
    }

    console.log('Database is up to date');
  } finally {
    await db.destroy();
  }
}

migrateToLatest().catch((error: unknown) => {
  console.error('Could not run database migrations:');

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
