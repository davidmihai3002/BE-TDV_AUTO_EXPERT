import { z } from 'zod';

export const blogSlugSchema = z
  .string()
  .max(64)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const blogContentBlockSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  headingIconName: z.string().min(1),
  body: z.string().min(1),
});

export const blogContentSchema = z.object({
  blocks: z.array(blogContentBlockSchema).min(1),
});

/** JSON accepted by `npm run insert-local:blog`. */
export const insertBlogSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  author: z.string().min(1),
  content: blogContentSchema,
  excerpt: z.string().min(1),
  image: z.url(),
  imageAlt: z.string().min(1),
  categorySlug: blogSlugSchema,
  isFeatured: z.boolean().default(false),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
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
