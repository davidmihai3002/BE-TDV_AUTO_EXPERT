import { ColumnType, Generated, JSONColumnType } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';
import type { BlogContentV2, LegacyBlogContent } from './blog-content-schema';

/** Stored content is always v2 (migration 040 + blogs_content_v2_chk). */
export type BlogContent = BlogContentV2;
/** Original flat format; only used by 04's seed snapshot and the insert script's v1 input. */
export type { LegacyBlogContent };

export interface BlogsTable {
  id: ImmutableGenerated<string>;
  title: string;
  slug: string;
  /** Deprecated legacy text (kept for the listing); detail reads `authors` via authorId. */
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
  /** Word-based, computed on insert (computeReadTimeMinutes) */
  readTimeMinutes: number;
  // settable on insert so seeds/scripts can backdate
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
  /** referenced by figure blocks (imageKey) */
  key: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  position: Generated<number>;
}
