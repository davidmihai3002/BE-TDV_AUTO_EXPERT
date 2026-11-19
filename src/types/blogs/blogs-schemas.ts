import { z } from 'zod';
import { blockIdSchema, blogContentInputSchema } from './blog-content-schema';

export const blogSlugSchema = z
  .string()
  .max(64)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Words that are static routes under /blogs/* (must be declared before /blogs/:slug); never valid post slugs. */
export const RESERVED_BLOG_SLUGS = [
  'categories',
  'featured',
  'related',
] as const;

export const blogDetailSlugSchema = z
  .string()
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const tagRefSchema = z.object({
  slug: blogSlugSchema,
  name: z.string().trim().min(1).max(60),
});

const authorInputSchema = z.object({
  slug: blogSlugSchema,
  name: z.string().trim().min(1),
  role: z.string().trim().min(1).nullish(),
  avatarUrl: z.string().min(1).nullish(),
  avatarAlt: z.string().default(''),
  bio: z.string().nullish(),
});

const imageInputSchema = z.object({
  key: blockIdSchema,
  url: z.string().min(1),
  alt: z.string().trim().min(1),
  caption: z.string().max(200).nullish(),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
});

/**
 * JSON accepted by `npm run insert-local:blog`. `content` may be v2 or legacy (converted to v2).
 * Author: `authorSlug` (existing author) or an `author` object (upserted by slug); plain-string `author` is legacy.
 */
export const insertBlogSchema = z
  .object({
    title: z.string().trim().min(1),
    slug: blogDetailSlugSchema,
    author: z.union([z.string().trim().min(1), authorInputSchema]).optional(),
    authorSlug: blogSlugSchema.optional(),
    content: blogContentInputSchema,
    excerpt: z.string().trim().min(1),
    // root-relative (FE public/) or absolute
    image: z
      .string()
      .regex(/^(https?:\/\/|\/)\S+$/, 'Expected an absolute URL or a /path'),
    imageAlt: z.string().trim().min(1),
    imageWidth: z.number().int().positive().nullish(),
    imageHeight: z.number().int().positive().nullish(),
    seoTitle: z.string().trim().max(70).nullish(),
    seoDescription: z.string().trim().max(160).nullish(),
    categorySlug: blogSlugSchema,
    tags: z.array(tagRefSchema).max(12).default([]),
    images: z.array(imageInputSchema).max(50).default([]),
    isFeatured: z.boolean().default(false),
    publishedAt: z.iso.datetime({ offset: true }).optional(),
  })
  .superRefine((blog, ctx) => {
    if ((RESERVED_BLOG_SLUGS as readonly string[]).includes(blog.slug)) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: `"${blog.slug}" is a reserved route word`,
      });
    }
    if (!blog.author && !blog.authorSlug) {
      ctx.addIssue({
        code: 'custom',
        path: ['author'],
        message: 'Provide `authorSlug` or `author`',
      });
    }
    const keys = new Set(blog.images.map((i) => i.key));
    if (keys.size !== blog.images.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['images'],
        message: 'Duplicate image key',
      });
    }
    blog.content.blocks.forEach((b, i) => {
      if (b.type === 'figure' && !keys.has(b.imageKey)) {
        ctx.addIssue({
          code: 'custom',
          path: ['content', 'blocks', i, 'imageKey'],
          message: `Figure references unknown image key "${b.imageKey}"`,
        });
      }
    });
  });
export type InsertBlogInput = z.infer<typeof insertBlogSchema>;

const pageSize = z.coerce.number().int().min(1).max(24);

/** GET /blogs query. `limit` is an alias for `pageSize` (ticket 02); `pageSize` wins when both are sent. */
export const blogsListingQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: pageSize.optional(),
    limit: pageSize.optional(),
    category: blogSlugSchema.optional(),
    search: z.string().trim().min(2).max(100).optional(),
    featured: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  })
  .transform(({ limit, pageSize: size, ...rest }) => ({
    ...rest,
    pageSize: size ?? limit ?? 6,
  }));
export type BlogsListingQuery = z.output<typeof blogsListingQuerySchema>;
