import { ColumnType } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export interface BlogCategoriesTable {
  id: ImmutableGenerated<string>;
  slug: string;
  name: string;
  sortOrder: ColumnType<number, number | undefined, number>;
  createdAt: Timestamp;
}
