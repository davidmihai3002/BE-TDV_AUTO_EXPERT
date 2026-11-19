import { Kysely, sql } from 'kysely';

// Diacritics-insensitive blog search (ă/â→a, î→i, ș/ş→s, ț/ţ→t). Needs CREATE on the database.
export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS unaccent`.execute(db);
  // unaccent() is STABLE; an IMMUTABLE wrapper with an explicit dictionary keeps it usable in future indexes.
  await sql`CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP FUNCTION IF EXISTS immutable_unaccent(text)`.execute(db);
  // the extension is left installed (harmless; other tickets may rely on it)
}
