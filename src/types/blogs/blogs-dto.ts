import { Paginated } from '../common';

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
