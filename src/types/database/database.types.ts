import { ColumnType } from 'kysely';
import { BlogsTable } from '..';

export interface Database {
  blogs: BlogsTable;
}

export type ImmutableGenerated<T> = ColumnType<T, T | undefined, never>;
