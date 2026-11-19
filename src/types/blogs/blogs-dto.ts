import { Paginated } from '../common';
import type { ContentBlock, FigureBlock } from './blog-content-schema';

export interface BlogCategoryRefDto {
  slug: string;
  name: string;
}

/** Listing projection: never includes `content`. */
export interface BlogListItemDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  isFeatured: boolean;
  category: BlogCategoryRefDto;
}

export interface BlogCategoryDto {
  id: string;
  slug: string;
  name: string;
  postCount: number;
}

export type BlogsListingResponseDto = Paginated<BlogListItemDto>;

export interface BlogCategoriesResponseDto {
  items: BlogCategoryDto[];
}

export interface BlogAuthorDto {
  slug: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
  avatarAlt: string;
  bio: string | null;
}

export interface BlogImageRefDto {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface BlogImageDto extends BlogImageRefDto {
  key: string;
  caption: string | null;
  position: number;
}

/** Figure blocks carry the resolved image so the FE never has to join. */
export type HydratedContentBlock =
  | Exclude<ContentBlock, { type: 'figure' }>
  | (FigureBlock & { image: BlogImageRefDto });

export interface RelatedBlogDto {
  id: string;
  slug: string;
  title: string;
  category: BlogCategoryRefDto | null;
  image: { url: string; alt: string };
  readTimeMinutes: number;
  publishedAt: string;
}

/** GET /blogs/:slug. Never contains a top-level `excerpt` (it's only an SEO fallback). */
export interface BlogDetailDto {
  id: string;
  slug: string;
  title: string;
  category: BlogCategoryRefDto | null;
  tags: BlogCategoryRefDto[];
  author: BlogAuthorDto;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  coverImage: BlogImageRefDto;
  content: { version: 2; blocks: HydratedContentBlock[] };
  images: BlogImageDto[];
  related: RelatedBlogDto[];
  seo: { title: string; description: string; ogImage: string };
}
