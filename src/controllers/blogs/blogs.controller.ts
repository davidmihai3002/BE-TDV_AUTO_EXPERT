import { Controller, Get, Header, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common';
import { BlogsService } from 'src/services';
import { blogsListingQuerySchema } from 'src/types';
import type {
  BlogCategoriesResponseDto,
  BlogsListingQuery,
  BlogsListingResponseDto,
} from 'src/types';

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

  // Must stay declared before ticket 05's `@Get('/blogs/:slug')`, or "categories" is matched as a slug.
  @Get('/blogs/categories')
  @Header('Cache-Control', 'public, max-age=60')
  getCategories(): Promise<BlogCategoriesResponseDto> {
    return this.blogsService.getBlogCategories();
  }
}
