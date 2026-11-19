import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BlogsOperations } from 'src/clients';
import { BlogsUtils } from 'src/common';
import { contentBlockSchema } from 'src/types';
import type {
  BlogDetailDto,
  ContentBlock,
  RelatedBlogDto,
  BlogCategoriesResponseDto,
  BlogsListingQuery,
  BlogsListingResponseDto,
} from 'src/types';

export const RELATED_LIMIT = 3;

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

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

  async getBlogBySlug(slug: string): Promise<BlogDetailDto> {
    const row = await this.blogsOperations.getPublishedBlogBySlug(slug);
    if (!row) throw new NotFoundException(`Blog "${slug}" not found`);

    const [tags, images] = await Promise.all([
      this.blogsOperations.getBlogTags(row.id),
      this.blogsOperations.getBlogImages(row.id),
    ]);
    const related = await this.blogsOperations.getRelatedBlogs(
      { id: row.id, categoryId: row.categoryId },
      tags.map((t) => t.id),
      RELATED_LIMIT,
    );

    return this.blogsUtils.buildBlogDetailDto({
      row,
      blocks: this.blogsUtils.hydrateFigures(
        this.parseBlocks(slug, row.content),
        images,
        slug,
      ),
      tags: tags.map(({ slug: s, name }) => ({ slug: s, name })),
      images,
      related,
    });
  }

  async getRelatedBlogs(
    slug: string,
    limit: number,
  ): Promise<{ items: RelatedBlogDto[] }> {
    const row = await this.blogsOperations.getPublishedBlogBySlug(slug);
    if (!row) throw new NotFoundException(`Blog "${slug}" not found`);
    const tags = await this.blogsOperations.getBlogTags(row.id);
    const related = await this.blogsOperations.getRelatedBlogs(
      { id: row.id, categoryId: row.categoryId },
      tags.map((t) => t.id),
      limit,
    );
    return { items: related.map(this.blogsUtils.toRelatedBlogDto) };
  }

  /** Validates each block on its own: one bad block is dropped (and logged), never a 500. */
  private parseBlocks(slug: string, content: unknown): ContentBlock[] {
    const blocks = (content as { blocks?: unknown } | null)?.blocks;
    if (!Array.isArray(blocks)) {
      this.logger.error(`Blog "${slug}": content has no blocks array`);
      throw new InternalServerErrorException();
    }
    return blocks.flatMap((block: unknown, i) => {
      const parsed = contentBlockSchema.safeParse(block);
      if (parsed.success) return [parsed.data];
      this.logger.error(
        `Blog "${slug}": dropping invalid block #${i}: ${parsed.error.issues.map((x) => `${x.path.join('.')} ${x.message}`).join('; ')}`,
      );
      return [];
    });
  }
}
