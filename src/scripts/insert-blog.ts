import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { db } from '../clients/database';
import { computeReadTimeMinutes } from '../common/utils/blogs-utils';
import { insertBlogSchema } from '../types/blogs/blogs-schemas';

/**
 * Usage: npm run insert-local:blog -- ./src/content/blogs/my-blog.json
 * JSON fields: title, slug, author, excerpt, image (URL), imageAlt, categorySlug, content.blocks[],
 * optional isFeatured (default false) and publishedAt (ISO datetime, default now).
 */
async function insertBlog(): Promise<void> {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error(
      'Usage: npm run insert-local:blog -- ./src/content/blogs/my-blog.json',
    );
  }

  const json = await readFile(resolve(filePath), 'utf8');
  const { categorySlug, publishedAt, ...blog } = insertBlogSchema.parse(
    JSON.parse(json) as unknown,
  );

  const inserted = await db.transaction().execute(async (trx) => {
    const category = await trx
      .selectFrom('blogCategories')
      .select('id')
      .where('slug', '=', categorySlug)
      .executeTakeFirst();
    if (!category) throw new Error(`Unknown category "${categorySlug}"`);

    // only one featured post at a time (blogs_single_featured_idx)
    if (blog.isFeatured) {
      await trx
        .updateTable('blogs')
        .set({ isFeatured: false })
        .where('isFeatured', '=', true)
        .execute();
    }

    return trx
      .insertInto('blogs')
      .values({
        ...blog,
        categoryId: category.id,
        readTimeMinutes: computeReadTimeMinutes(blog.content),
        ...(publishedAt ? { publishedAt } : {}),
      })
      .returning(['id', 'title', 'readTimeMinutes'])
      .executeTakeFirstOrThrow();
  });

  console.log(
    `Inserted "${inserted.title}" with ID ${inserted.id} (${inserted.readTimeMinutes} min read)`,
  );
}

insertBlog()
  .catch((error: unknown) => {
    console.error('Could not insert blog:');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
