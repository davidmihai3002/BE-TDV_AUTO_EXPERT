import { ColumnType, JSONColumnType } from 'kysely';

export interface Database {
  blogs: BlogsTable;
}

// TODO: define the Article Text JSON

type ImmutableGenerated<T> = ColumnType<T, T | undefined, never>;
interface BlogContent {}

export interface BlogsTable {
  id: ImmutableGenerated<string>;
  title: string;
  slug: string;
  author: string;
  content: JSONColumnType<BlogContent>;
  excerpt: string;
  image: string;
  publishedAt: ImmutableGenerated<Date>;
}
