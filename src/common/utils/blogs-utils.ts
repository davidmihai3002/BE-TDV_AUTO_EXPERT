import { Injectable } from '@nestjs/common';
import type { BlogContent, BlogListItemDto } from 'src/types';

/**
 * Silent-reading speed used for read times. Romanian words are longer on average than English ones (inflection,
 * enclitic articles), so ~200 wpm is the conservative end. Single source: ticket 05 imports it.
 */
export const WORDS_PER_MINUTE = 200;

/** Whitespace word count; hyphenated clitics ("într-o", "s-a") count as one word. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Words in headings + bodies at 200 wpm, rounded up, minimum 1 minute. */
export function computeReadTimeMinutes(content: BlogContent): number {
  const words = content.blocks.reduce(
    (sum, block) => sum + countWords(`${block.heading} ${block.body}`),
    0,
  );
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
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
}
