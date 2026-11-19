import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { Kysely, PostgresDialect } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import { Pool } from 'pg';

import { getDatabaseConfig } from './database-config';

/** `--down` rolls back exactly one migration; otherwise migrates to latest. */
async function migrate(direction: 'up' | 'down'): Promise<void> {
  // No CamelCasePlugin here: migrations use snake_case identifiers.
  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool: new Pool(getDatabaseConfig()) }),
  });

  const migrator = new Migrator({
    db,
    // Tickets merge in dependency order (01 → 04 → 05 → 06 → 03 → 02 → 07), not numeric order (plan §8).
    allowUnorderedMigrations: true,

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
    const { error, results } =
      direction === 'down'
        ? await migrator.migrateDown()
        : await migrator.migrateToLatest();

    results?.forEach((result) => {
      if (result.status === 'Success') {
        console.log(
          `Migration "${result.migrationName}" ${result.direction === 'Down' ? 'rolled back' : 'completed'} successfully`,
        );
      }

      if (result.status === 'Error') {
        console.error(`Migration "${result.migrationName}" failed`);
      }
    });

    if (error) {
      throw error instanceof Error
        ? error
        : new Error('Migration failed', { cause: error });
    }

    if (direction === 'up') console.log('Database is up to date');
  } finally {
    await db.destroy();
  }
}

migrate(process.argv.includes('--down') ? 'down' : 'up').catch(
  (error: unknown) => {
    console.error('Could not run database migrations:');

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  },
);
