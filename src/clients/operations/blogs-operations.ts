import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { paginate } from 'src/common/pagination';
import type { BlogListRow } from 'src/common/utils/blogs-utils';
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

  findCategoryBySlug(slug: string) {
    return db
      .selectFrom('blogCategories')
      .select(['id', 'slug', 'name'])
      .where('slug', '=', slug)
      .executeTakeFirst();
  }
}
