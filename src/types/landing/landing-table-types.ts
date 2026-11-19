import { Generated, JSONColumnType } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';
import { BodyType } from '../fleet/fleet-table-types';

export type Accent = 'primary' | 'secondary' | 'tertiary';
export type LandingSectionKey =
  'hero' | 'advantage' | 'fleet' | 'insights' | 'faq' | 'cta';

export interface LandingSectionsTable {
  id: ImmutableGenerated<string>;
  key: LandingSectionKey;
  eyebrow: string | null;
  eyebrowIcon: string | null;
  title: string;
  titleHighlight: string | null;
  titleSuffix: string | null;
  subtitle: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  secondaryCtaIcon: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageAltMobile: string | null;
  extra: JSONColumnType<Record<string, unknown>>;
  showOnDesktop: Generated<boolean>;
  showOnMobile: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LandingStatsTable {
  id: ImmutableGenerated<string>;
  value: string;
  suffix: string | null;
  shortSuffix: string | null;
  label: string;
  shortLabel: string | null;
  accent: Accent;
  accentMobile: Accent | null;
  sortOrder: Generated<number>;
  isPublished: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LandingFeaturesTable {
  id: ImmutableGenerated<string>;
  title: string;
  description: string;
  icon: string;
  iconMobile: string | null;
  accent: Accent;
  tags: string[];
  sortOrder: Generated<number>;
  isPublished: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FleetSpec {
  icon: string;
  label: string;
  accent: Accent;
}

export interface LandingFleetHighlightsTable {
  id: ImmutableGenerated<string>;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bodyTypes: BodyType[];
  imageUrl: string;
  imageAlt: string;
  highlightIcon: string | null;
  highlightLabel: string | null;
  specs: JSONColumnType<FleetSpec[]>;
  sortOrder: Generated<number>;
  isPublished: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FaqsTable {
  id: ImmutableGenerated<string>;
  question: string;
  answer: string;
  page: Generated<string>;
  sortOrder: Generated<number>;
  isPublished: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
