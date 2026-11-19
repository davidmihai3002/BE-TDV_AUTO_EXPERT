import { db } from '../clients/database';
import { computeReadTimeMinutes } from '../common/utils/blogs-utils';

/** Recomputes read_time_minutes for every blog from its content (e.g. after content is enriched). */
async function recompute(): Promise<void> {
  const blogs = await db
    .selectFrom('blogs')
    .select(['id', 'slug', 'content', 'readTimeMinutes'])
    .execute();

  let changed = 0;
  for (const blog of blogs) {
    const next = computeReadTimeMinutes(blog.content);
    if (next === blog.readTimeMinutes) continue;
    await db
      .updateTable('blogs')
      .set({ readTimeMinutes: next })
      .where('id', '=', blog.id)
      .execute();
    console.log(`${blog.slug}: ${blog.readTimeMinutes} → ${next} min`);
    changed += 1;
  }
  console.log(`Updated ${changed} of ${blogs.length} blogs`);
}

recompute()
  .catch((error: unknown) => {
    console.error('Could not recompute read times:');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
