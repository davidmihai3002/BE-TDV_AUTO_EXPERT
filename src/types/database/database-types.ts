import { ColumnType } from 'kysely';
import {
  AuthorsTable,
  BlogCategoriesTable,
  BlogImagesTable,
  BlogTagsTable,
  BlogsTable,
  BookingsTable,
  FaqsTable,
  FleetTable,
  InstructorsTable,
  LandingFeaturesTable,
  LandingFleetHighlightsTable,
  LandingSectionsTable,
  LandingStatsTable,
  LicenseCategoriesTable,
  PricingSettingsTable,
  PricingVehicleRatesTable,
  SiteSettingsTable,
  TagsTable,
} from '..';

// Keys are camelCase: CamelCasePlugin maps them to snake_case tables/columns (siteSettings → site_settings).
export interface Database {
  authors: AuthorsTable;
  blogImages: BlogImagesTable;
  blogTags: BlogTagsTable;
  blogCategories: BlogCategoriesTable;
  blogs: BlogsTable;
  bookings: BookingsTable;
  faqs: FaqsTable;
  fleet: FleetTable;
  instructors: InstructorsTable;
  landingFeatures: LandingFeaturesTable;
  landingFleetHighlights: LandingFleetHighlightsTable;
  landingSections: LandingSectionsTable;
  landingStats: LandingStatsTable;
  licenseCategories: LicenseCategoriesTable;
  pricingSettings: PricingSettingsTable;
  pricingVehicleRates: PricingVehicleRatesTable;
  siteSettings: SiteSettingsTable;
  tags: TagsTable;
}

export type ImmutableGenerated<T> = ColumnType<T, T | undefined, never>;

/** timestamptz with a DB default: read as Date, optional on insert, not updatable by hand. */
export type Timestamp = ColumnType<Date, Date | string | undefined, never>;
