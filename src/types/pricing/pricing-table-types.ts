import { ColumnType, Generated } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

/** numeric(10,2) columns: read as number (pg type parser), written as number or string. */
type Money = ColumnType<number, number | string, number | string>;

export interface LicenseCategoriesTable {
  id: ImmutableGenerated<string>;
  code: string;
  name: string;
  shortName: string;
  description: string;
  badgeLabel: string | null;
  icon: Generated<string>;
  sortOrder: Generated<number>;
  isActive: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PricingSettingsTable {
  id: ColumnType<number, 1 | undefined, never>;
  currency: Generated<string>;
  vatIncluded: Generated<boolean>;
  processingFee: Money;
  processingFeeLabel: string;
  minLessons: number;
  maxLessons: number;
  defaultLessons: number;
  lessonStep: Generated<number>;
  updatedAt: Timestamp;
}

export interface PricingVehicleRatesTable {
  fleetId: string;
  licenseCategoryId: string;
  lessonPrice: Money;
  currency: Generated<string>;
  isActive: Generated<boolean>;
  updatedAt: Timestamp;
}
