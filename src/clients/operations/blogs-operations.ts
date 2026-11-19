import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { paginate } from 'src/common/pagination';
import type {
  BlogDetailRow,
  BlogImageRow,
  BlogListRow,
  RelatedBlogRow,
} from 'src/common/utils/blogs-utils';
import type { BlogsListingQuery, Paginated } from 'src/types';
import { db } from '../database';

/** `%`, `_` and `\` are LIKE wildcards/escape (Postgres' default escape char is `\`). */
const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

@Injectable()
export class BlogsOperations {
  /** Listing projection only: `content` is never selected. Scheduled posts (future published_at) are hidden. */
  listBlogs(query: BlogsListingQuery): Promise<Paginated<BlogListRow>> {
    let qb = db
      .selectFrom('blogs')
      .innerJoin('blogCategories as c', 'c.id', 'blogs.categoryId')
      .where('blogs.publishedAt', '<=', sql<Date>`now()`);

    if (query.category) qb = qb.where('c.slug', '=', query.category);
    if (query.featured !== undefined)
      qb = qb.where('blogs.isFeatured', '=', query.featured);
    if (query.search) {
      const pattern = `%${escapeLike(query.search)}%`;
      qb = qb.where((eb) =>
        eb.or([
          eb(
            eb.fn('immutable_unaccent', ['blogs.title']),
            'ilike',
            eb.fn('immutable_unaccent', [eb.val(pattern)]),
          ),
          eb(
            eb.fn('immutable_unaccent', ['blogs.excerpt']),
            'ilike',
            eb.fn('immutable_unaccent', [eb.val(pattern)]),
          ),
        ]),
      );
    }

    const direction = query.sort === 'oldest' ? 'asc' : 'desc';
    const page = qb
      .select([
        'blogs.id',
        'blogs.slug',
        'blogs.title',
        'blogs.excerpt',
        'blogs.image',
        'blogs.imageAlt',
        'blogs.author',
        'blogs.publishedAt',
        'blogs.readTimeMinutes',
        'blogs.isFeatured',
        'c.slug as categorySlug',
        'c.name as categoryName',
      ])
      .orderBy('blogs.publishedAt', direction)
      .orderBy('blogs.id', direction);

    return paginate(page, { page: query.page, pageSize: query.pageSize });
  }

  /** All categories in sort order with their published post counts (zero-count categories included). */
  listCategoriesWithCounts() {
    return db
      .selectFrom('blogCategories as c')
      .leftJoin('blogs as b', (join) =>
        join
          .onRef('b.categoryId', '=', 'c.id')
          .on('b.publishedAt', '<=', sql<Date>`now()`),
      )
      .select((eb) => [
        'c.id',
        'c.slug',
        'c.name',
        eb.fn.count<number>('b.id').as('postCount'),
      ])
      .groupBy('c.id')
      .orderBy('c.sortOrder')
      .orderBy('c.name')
      .execute();
  }

  /** Published post by slug with author + category. Never selects `excerpt` (only as the SEO fallback). */
  getPublishedBlogBySlug(
    slug: string,
  ): Promise<
    | (BlogDetailRow & { content: unknown; categoryId: string | null })
    | undefined
  > {
    return db
      .selectFrom('blogs as b')
      .leftJoin('blogCategories as c', 'c.id', 'b.categoryId')
      .leftJoin('authors as a', 'a.id', 'b.authorId')
      .select((eb) => [
        'b.id',
        'b.slug',
        'b.title',
        'b.content',
        'b.categoryId',
        'b.image',
        'b.imageAlt',
        'b.imageWidth',
        'b.imageHeight',
        'b.publishedAt',
        'b.updatedAt',
        'b.readTimeMinutes',
        'b.seoTitle',
        eb.fn.coalesce('b.seoDescription', 'b.excerpt').as('seoDescription'),
        'b.author as legacyAuthor',
        'c.slug as categorySlug',
        'c.name as categoryName',
        'a.slug as authorSlug',
        'a.name as authorName',
        'a.role as authorRole',
        'a.avatarUrl as authorAvatarUrl',
        'a.avatarAlt as authorAvatarAlt',
        'a.bio as authorBio',
      ])
      .where('b.slug', '=', slug)
      .where('b.publishedAt', '<=', sql<Date>`now()`)
      .executeTakeFirst();
  }

  getBlogTags(blogId: string) {
    return db
      .selectFrom('blogTags as bt')
      .innerJoin('tags as t', 't.id', 'bt.tagId')
      .select(['t.id', 't.slug', 't.name'])
      .where('bt.blogId', '=', blogId)
      .orderBy('bt.position')
      .orderBy('t.name')
      .execute();
  }

  getBlogImages(blogId: string): Promise<BlogImageRow[]> {
    return db
      .selectFrom('blogImages')
      .select(['key', 'url', 'alt', 'caption', 'width', 'height', 'position'])
      .where('blogId', '=', blogId)
      .orderBy('position')
      .execute();
  }

  /** Same category first, then most shared tags, then newest; excludes self and scheduled posts. */
  getRelatedBlogs(
    current: { id: string; categoryId: string | null },
    tagIds: string[],
    limit: number,
  ): Promise<RelatedBlogRow[]> {
    // never matches: keeps the join valid when the current post has no tags
    const ids = tagIds.length
      ? tagIds
      : ['00000000-0000-0000-0000-000000000000'];
    return db
      .selectFrom('blogs as b')
      .leftJoin('blogTags as bt', (join) =>
        join.onRef('bt.blogId', '=', 'b.id').on('bt.tagId', 'in', ids),
      )
      .leftJoin('blogCategories as c', 'c.id', 'b.categoryId')
      .select((eb) => [
        'b.id',
        'b.slug',
        'b.title',
        'b.image',
        'b.imageAlt',
        'b.readTimeMinutes',
        'b.publishedAt',
        'c.slug as categorySlug',
        'c.name as categoryName',
        eb.fn.count<number>('bt.tagId').as('sharedTags'),
      ])
      .where('b.id', '!=', current.id)
      .where('b.publishedAt', '<=', sql<Date>`now()`)
      .groupBy(['b.id', 'c.slug', 'c.name'])
      .orderBy(
        sql`(${sql.ref('b.categoryId')} IS NOT DISTINCT FROM ${current.categoryId})`,
        'desc',
      )
      .orderBy('sharedTags', 'desc')
      .orderBy('b.publishedAt', 'desc')
      .orderBy('b.id')
      .limit(limit)
      .execute();
  }

  findCategoryBySlug(slug: string) {
    return db
      .selectFrom('blogCategories')
      .select(['id', 'slug', 'name'])
      .where('slug', '=', slug)
      .executeTakeFirst();
  }
}
