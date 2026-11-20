import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/common';
import { BlogsService } from 'src/services';
import { blogDetailSlugSchema, blogsListingQuerySchema } from 'src/types';
import type {
  BlogDetailDto,
  RelatedBlogDto,
  BlogCategoriesResponseDto,
  BlogsListingQuery,
  BlogsListingResponseDto,
} from 'src/types';

const relatedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(6).default(3),
});
type RelatedQuery = z.infer<typeof relatedQuerySchema>;

@Controller()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('/blogs')
  @Header('Cache-Control', 'public, max-age=60')
  getBlogs(
    @Query(new ZodValidationPipe(blogsListingQuerySchema))
    query: BlogsListingQuery,
  ): Promise<BlogsListingResponseDto> {
    return this.blogsService.getBlogsListing(query);
  }

  @Get('/blogs/categories')
  @Header('Cache-Control', 'public, max-age=60')
  getCategories(): Promise<BlogCategoriesResponseDto> {
    return this.blogsService.getBlogCategories();
  }

  @Get('/blogs/:slug')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  getBlog(
    @Param('slug', new ZodValidationPipe(blogDetailSlugSchema)) slug: string,
  ): Promise<BlogDetailDto> {
    return this.blogsService.getBlogBySlug(slug);
  }

  @Get('/blogs/:slug/related')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  getRelated(
    @Param('slug', new ZodValidationPipe(blogDetailSlugSchema)) slug: string,
    @Query(new ZodValidationPipe(relatedQuerySchema)) query: RelatedQuery,
  ): Promise<{ items: RelatedBlogDto[] }> {
    return this.blogsService.getRelatedBlogs(slug, query.limit);
  }
}
