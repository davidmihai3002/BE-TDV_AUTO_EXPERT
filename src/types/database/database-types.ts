import { ColumnType } from 'kysely';
import {
  BlogCategoriesTable,
  BlogsTable,
  BookingsTable,
  FleetTable,
  InstructorsTable,
  SiteSettingsTable,
} from '..';

// Keys are camelCase: CamelCasePlugin maps them to snake_case tables/columns (siteSettings → site_settings).
export interface Database {
  blogCategories: BlogCategoriesTable;
  blogs: BlogsTable;
  bookings: BookingsTable;
  fleet: FleetTable;
  instructors: InstructorsTable;
  siteSettings: SiteSettingsTable;
}

export type ImmutableGenerated<T> = ColumnType<T, T | undefined, never>;

/** timestamptz with a DB default: read as Date, optional on insert, not updatable by hand. */
export type Timestamp = ColumnType<Date, Date | string | undefined, never>;
