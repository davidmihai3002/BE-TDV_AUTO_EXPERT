import { Injectable } from '@nestjs/common';
import { BlogsOperations } from 'src/clients';
import { BlogsUtils } from 'src/common';
import type {
  BlogCategoriesResponseDto,
  BlogsListingQuery,
  BlogsListingResponseDto,
} from 'src/types';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsOperations: BlogsOperations,
    private readonly blogsUtils: BlogsUtils,
  ) {}

  async getBlogsListing(
    query: BlogsListingQuery,
  ): Promise<BlogsListingResponseDto> {
    const { items, ...meta } = await this.blogsOperations.listBlogs(query);
    return { items: items.map(this.blogsUtils.toBlogListItemDto), ...meta };
  }

  async getBlogCategories(): Promise<BlogCategoriesResponseDto> {
    const rows = await this.blogsOperations.listCategoriesWithCounts();
    return {
      items: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        postCount: Number(r.postCount),
      })),
    };
  }
}
