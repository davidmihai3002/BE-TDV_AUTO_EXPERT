import { ColumnType, Generated, JSONColumnType } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';
import type { BlogContentV2, LegacyBlogContent } from './blog-content-schema';

export type BlogContent = BlogContentV2;
export type { LegacyBlogContent };

export interface BlogsTable {
  id: ImmutableGenerated<string>;
  title: string;
  slug: string;
  author: string;
  authorId: string | null;
  content: JSONColumnType<BlogContent, BlogContent, BlogContent>;
  excerpt: string;
  image: string;
  imageAlt: ColumnType<string, string | undefined, string>;
  imageWidth: number | null;
  imageHeight: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
  isFeatured: ColumnType<boolean, boolean | undefined, boolean>;
  readTimeMinutes: number;
  publishedAt: ColumnType<Date, Date | string | undefined, never>;
  updatedAt: Timestamp;
}

export interface AuthorsTable {
  id: ImmutableGenerated<string>;
  slug: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
  avatarAlt: ColumnType<string, string | undefined, string>;
  bio: string | null;
  createdAt: Timestamp;
}

export interface TagsTable {
  id: ImmutableGenerated<string>;
  slug: string;
  name: string;
}

export interface BlogTagsTable {
  blogId: string;
  tagId: string;
  position: Generated<number>;
}

export interface BlogImagesTable {
  id: ImmutableGenerated<string>;
  blogId: string;
  key: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  position: Generated<number>;
}
