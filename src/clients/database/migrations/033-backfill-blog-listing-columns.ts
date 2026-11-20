import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    UPDATE blogs b SET read_time_minutes = GREATEST(1, CEIL(words.cnt / 200.0))::int
    FROM (
      SELECT id,
             COALESCE(SUM(array_length(regexp_split_to_array(
               trim((blk->>'heading') || ' ' || (blk->>'body')), '\\s+'), 1)), 0) AS cnt
      FROM blogs, jsonb_array_elements(content->'blocks') blk
      GROUP BY id
    ) words
    WHERE words.id = b.id`.execute(db);

  await sql`
    UPDATE blogs
    SET category_id = (SELECT id FROM blog_categories WHERE slug = 'perspectiva-instructorilor')
    WHERE category_id IS NULL`.execute(db);

  await sql`ALTER TABLE blogs ALTER COLUMN category_id SET NOT NULL`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE blogs ALTER COLUMN category_id DROP NOT NULL`.execute(
    db,
  );
}
