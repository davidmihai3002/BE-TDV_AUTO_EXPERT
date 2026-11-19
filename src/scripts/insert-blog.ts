import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { db } from '../clients/database';
import { computeReadTimeMinutes } from '../common/utils/blogs-utils';
import { insertBlogSchema } from '../types/blogs/blogs-schemas';

/**
 * Usage: npm run insert-local:blog -- ./src/content/blogs/my-blog.json [--dry-run]
 * Content may be v2 (`{ version: 2, blocks: [...] }`) or the legacy flat format (stored as v2).
 * Reference: src/content/blogs/dinamica-avansata-in-viraje.json. Everything runs in one transaction.
 */
async function insertBlog(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filePath = args.find((a) => !a.startsWith('--'));
  if (!filePath) {
    throw new Error(
      'Usage: npm run insert-local:blog -- ./src/content/blogs/my-blog.json [--dry-run]',
    );
  }

  const json = await readFile(resolve(filePath), 'utf8');
  const parsed = insertBlogSchema.safeParse(JSON.parse(json) as unknown);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`,
    );
    throw new Error(`Invalid blog file:\n${lines.join('\n')}`);
  }
  const {
    categorySlug,
    publishedAt,
    author,
    authorSlug,
    tags,
    images,
    ...blog
  } = parsed.data;
  const readTimeMinutes = computeReadTimeMinutes(blog.content);

  if (dryRun) {
    console.log(
      `Valid: "${blog.title}" (${blog.content.blocks.length} blocks, ${images.length} images, ${tags.length} tags, ${readTimeMinutes} min read)`,
    );
    return;
  }

  const inserted = await db.transaction().execute(async (trx) => {
    const category = await trx
      .selectFrom('blogCategories')
      .select('id')
      .where('slug', '=', categorySlug)
      .executeTakeFirst();
    if (!category) throw new Error(`Unknown category "${categorySlug}"`);

    // author: object → upsert by slug; authorSlug → must exist; legacy string → name only
    let authorId: string | null = null;
    let authorName: string;
    if (author && typeof author === 'object') {
      const row = await trx
        .insertInto('authors')
        .values({
          slug: author.slug,
          name: author.name,
          role: author.role ?? null,
          avatarUrl: author.avatarUrl ?? null,
          avatarAlt: author.avatarAlt,
          bio: author.bio ?? null,
        })
        .onConflict((oc) =>
          oc.column('slug').doUpdateSet({
            name: author.name,
            role: author.role ?? null,
            avatarUrl: author.avatarUrl ?? null,
            avatarAlt: author.avatarAlt,
            bio: author.bio ?? null,
          }),
        )
        .returning(['id', 'name'])
        .executeTakeFirstOrThrow();
      authorId = row.id;
      authorName = row.name;
    } else if (authorSlug) {
      const row = await trx
        .selectFrom('authors')
        .select(['id', 'name'])
        .where('slug', '=', authorSlug)
        .executeTakeFirst();
      if (!row) throw new Error(`Unknown author "${authorSlug}"`);
      authorId = row.id;
      authorName = row.name;
    } else {
      authorName = author as string;
    }

    // only one featured post at a time (blogs_single_featured_idx)
    if (blog.isFeatured) {
      await trx
        .updateTable('blogs')
        .set({ isFeatured: false })
        .where('isFeatured', '=', true)
        .execute();
    }

    const row = await trx
      .insertInto('blogs')
      .values({
        ...blog,
        author: authorName,
        authorId,
        categoryId: category.id,
        readTimeMinutes,
        ...(publishedAt ? { publishedAt } : {}),
      })
      .returning(['id', 'title', 'readTimeMinutes'])
      .executeTakeFirstOrThrow();

    if (images.length) {
      await trx
        .insertInto('blogImages')
        .values(
          images.map((img, position) => ({
            blogId: row.id,
            key: img.key,
            url: img.url,
            alt: img.alt,
            caption: img.caption ?? null,
            width: img.width ?? null,
            height: img.height ?? null,
            position,
          })),
        )
        .execute();
    }

    for (const [position, tag] of tags.entries()) {
      const t = await trx
        .insertInto('tags')
        .values(tag)
        .onConflict((oc) => oc.column('slug').doUpdateSet({ name: tag.name }))
        .returning('id')
        .executeTakeFirstOrThrow();
      await trx
        .insertInto('blogTags')
        .values({ blogId: row.id, tagId: t.id, position })
        .execute();
    }

    return row;
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
