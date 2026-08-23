// npm run insert:blog -- src/content/blogs/article.json

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';

import { db } from '../clients/database';

const blogContentBlockSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  headingIconName: z.string().min(1),
  body: z.string().min(1),
});

const blogContentSchema = z.object({
  blocks: z.array(blogContentBlockSchema).min(1),
});

const insertBlogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  author: z.string().min(1),
  content: blogContentSchema,
  excerpt: z.string().min(1),
  image: z.string(),
});

async function insertBlog(): Promise<void> {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error('Usage: npm run insert:blog -- ./articles/my-blog.json');
  }

  const json = await readFile(resolve(filePath), 'utf8');
  const unknownData: unknown = JSON.parse(json);

  // Validates the runtime JSON and gives it a TypeScript type.
  const blog = insertBlogSchema.parse(unknownData);

  const insertedBlog = await db
    .insertInto('blogs')
    .values(blog)
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log(`Inserted "${insertedBlog.title}" with ID ${insertedBlog.id}`);
}

insertBlog()
  .catch((error: unknown) => {
    console.error('Could not insert blog:');

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
