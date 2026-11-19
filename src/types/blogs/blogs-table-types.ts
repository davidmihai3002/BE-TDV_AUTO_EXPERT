import { ColumnType, JSONColumnType } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export interface BlogContentBlock {
  id: string;
  heading: string;
  headingIconName: string;
  body: string;
}

export interface BlogContent {
  blocks: BlogContentBlock[];
}

export interface BlogsTable {
  id: ImmutableGenerated<string>;
  title: string;
  slug: string;
  author: string;
  content: JSONColumnType<BlogContent, BlogContent, never>;
  excerpt: string;
  image: string;
  imageAlt: ColumnType<string, string | undefined, string>;
  categoryId: string;
  isFeatured: ColumnType<boolean, boolean | undefined, boolean>;
  /** Word-based, computed on insert (BlogsUtils.computeReadTimeMinutes) */
  readTimeMinutes: number;
  // column published_at, mapped by CamelCasePlugin; settable on insert so seeds/scripts can backdate
  publishedAt: ColumnType<Date, Date | string | undefined, never>;
  updatedAt: Timestamp;
}
