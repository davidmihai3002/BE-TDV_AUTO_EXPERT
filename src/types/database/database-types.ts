import { ColumnType } from 'kysely';
import { BlogsTable, FleetTable } from '..';

export interface Database {
  blogs: BlogsTable;
  fleet: FleetTable;
}

export type ImmutableGenerated<T> = ColumnType<T, T | undefined, never>;
