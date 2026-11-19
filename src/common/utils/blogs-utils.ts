import { Injectable, Logger } from '@nestjs/common';
import type {
  BlogAuthorDto,
  BlogCategoryRefDto,
  BlogContentV2,
  BlogDetailDto,
  BlogImageDto,
  BlogListItemDto,
  ContentBlock,
  HydratedContentBlock,
  RelatedBlogDto,
} from 'src/types';

/**
 * Silent-reading speed used for read times. Romanian words are longer on average than English ones (inflection,
 * enclitic articles), so ~200 wpm is the conservative end. Single source: ticket 05 imports it.
 */
export const WORDS_PER_MINUTE = 200;

/** Whitespace word count; hyphenated clitics ("într-o", "s-a") count as one word. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Every piece of reader-visible text in a block. */
export function extractBlockText(block: ContentBlock): string[] {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return [block.text];
    case 'checklist':
      return [block.title, ...block.items];
    case 'callout':
      return [block.title ?? '', block.text];
    case 'figure':
      return [block.caption ?? ''];
    case 'steps':
      return block.items.flatMap((i) => [i.title, i.text]);
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function countContentWords(content: BlogContentV2): number {
  return countWords(content.blocks.flatMap(extractBlockText).join(' '));
}

/** All block text at 200 wpm, rounded up, minimum 1 minute. Returns a number. */
export function computeReadTimeMinutes(content: BlogContentV2): number {
  return Math.max(1, Math.ceil(countContentWords(content) / WORDS_PER_MINUTE));
}

export interface BlogImageRow {
  key: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  position: number;
}

const logger = new Logger('BlogsUtils');

/** Embeds `image` into figure blocks; drops figures whose key has no image (logged). */
export function hydrateFigures(
  blocks: ContentBlock[],
  images: BlogImageRow[],
  slug = '',
): HydratedContentBlock[] {
  const byKey = new Map(images.map((i) => [i.key, i]));
  return blocks.flatMap((block): HydratedContentBlock[] => {
    if (block.type !== 'figure') return [block];
    const img = byKey.get(block.imageKey);
    if (!img) {
      logger.warn(
        `Blog "${slug}": figure "${block.id}" references missing image "${block.imageKey}"`,
      );
      return [];
    }
    return [
      {
        ...block,
        caption: block.caption ?? img.caption,
        image: {
          url: img.url,
          alt: img.alt,
          width: img.width,
          height: img.height,
        },
      },
    ];
  });
}

export interface BlogDetailRow {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  imageWidth: number | null;
  imageHeight: number | null;
  publishedAt: Date;
  updatedAt: Date;
  readTimeMinutes: number;
  seoTitle: string | null;
  /** coalesce(seo_description, excerpt), resolved in SQL */
  seoDescription: string;
  legacyAuthor: string;
  categorySlug: string | null;
  categoryName: string | null;
  authorSlug: string | null;
  authorName: string | null;
  authorRole: string | null;
  authorAvatarUrl: string | null;
  authorAvatarAlt: string | null;
  authorBio: string | null;
}

export interface RelatedBlogRow {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  readTimeMinutes: number;
  publishedAt: Date;
  categorySlug: string | null;
  categoryName: string | null;
}

const categoryRef = (
  slug: string | null,
  name: string | null,
): BlogCategoryRefDto | null => (slug && name ? { slug, name } : null);

export function toRelatedBlogDto(row: RelatedBlogRow): RelatedBlogDto {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: categoryRef(row.categorySlug, row.categoryName),
    image: { url: row.image, alt: row.imageAlt },
    readTimeMinutes: Number(row.readTimeMinutes),
    publishedAt: new Date(row.publishedAt).toISOString(),
  };
}

export function buildBlogDetailDto(args: {
  row: BlogDetailRow;
  blocks: HydratedContentBlock[];
  tags: BlogCategoryRefDto[];
  images: BlogImageRow[];
  related: RelatedBlogRow[];
}): BlogDetailDto {
  const { row } = args;
  const author: BlogAuthorDto =
    row.authorSlug && row.authorName
      ? {
          slug: row.authorSlug,
          name: row.authorName,
          role: row.authorRole,
          avatarUrl: row.authorAvatarUrl,
          avatarAlt: row.authorAvatarAlt ?? '',
          bio: row.authorBio,
        }
      : // legacy row without an authors entry
        {
          slug: '',
          name: row.legacyAuthor,
          role: null,
          avatarUrl: null,
          avatarAlt: '',
          bio: null,
        };
  const images: BlogImageDto[] = args.images.map((i) => ({
    ...i,
    position: Number(i.position),
  }));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: categoryRef(row.categorySlug, row.categoryName),
    tags: args.tags,
    author,
    publishedAt: new Date(row.publishedAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    readTimeMinutes: Number(row.readTimeMinutes),
    coverImage: {
      url: row.image,
      alt: row.imageAlt,
      width: row.imageWidth,
      height: row.imageHeight,
    },
    content: { version: 2, blocks: args.blocks },
    images,
    related: args.related.map(toRelatedBlogDto),
    seo: {
      title: row.seoTitle ?? row.title,
      description: row.seoDescription,
      ogImage: row.image,
    },
  };
}

/** Flat row from BlogsOperations.listBlogs (category columns aliased). */
export interface BlogListRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  author: string;
  publishedAt: Date;
  readTimeMinutes: number;
  isFeatured: boolean;
  categorySlug: string;
  categoryName: string;
}

export function toBlogListItemDto(row: BlogListRow): BlogListItemDto {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    imageAlt: row.imageAlt,
    author: row.author,
    publishedAt: new Date(row.publishedAt).toISOString(),
    readTimeMinutes: Number(row.readTimeMinutes),
    isFeatured: row.isFeatured,
    category: { slug: row.categorySlug, name: row.categoryName },
  };
}

@Injectable()
export class BlogsUtils {
  computeReadTimeMinutes = computeReadTimeMinutes;
  toBlogListItemDto = toBlogListItemDto;
  hydrateFigures = hydrateFigures;
  buildBlogDetailDto = buildBlogDetailDto;
  toRelatedBlogDto = toRelatedBlogDto;
}
