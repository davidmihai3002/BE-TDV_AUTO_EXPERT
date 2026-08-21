import { JSONColumnType } from 'kysely';
import { ImmutableGenerated } from '..';

interface BlogContentBlock {
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
  publishedAt: ImmutableGenerated<Date>;
}
