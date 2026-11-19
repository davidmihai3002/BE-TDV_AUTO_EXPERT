import { z } from 'zod';

const databaseEnvSchema = z.object({
  LOCAL_DB_HOST: z.string().min(1),
  LOCAL_DB_PORT: z.coerce.number().int().positive(),
  LOCAL_DB_ENV: z.string().min(1),
  LOCAL_DB_USER: z.string().min(1),
  LOCAL_DB_PASSWORD: z.string().min(1),
});

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/** Reads and validates the LOCAL_DB_* variables. Shared by the runtime client and the migration script. */
export function getDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConfig {
  const result = databaseEnvSchema.safeParse(env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid database environment variables: ${missing}`);
  }
  const e = result.data;
  return {
    host: e.LOCAL_DB_HOST,
    port: e.LOCAL_DB_PORT,
    database: e.LOCAL_DB_ENV,
    user: e.LOCAL_DB_USER,
    password: e.LOCAL_DB_PASSWORD,
  };
}
