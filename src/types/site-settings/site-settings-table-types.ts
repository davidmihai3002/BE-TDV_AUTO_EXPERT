import { ColumnType, JSONColumnType } from 'kysely';
import { Timestamp } from '../database';

export type SocialPlatform =
  'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'whatsapp';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface SiteSettingsTable {
  id: ColumnType<number, 1 | undefined, never>;
  brandName: string;
  tagline: string;
  footerDescription: string;
  copyrightText: string;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  contactSchedule: string | null;
  currency: ColumnType<string, string | undefined, string>;
  privacyUrl: string | null;
  termsUrl: string | null;
  socials: JSONColumnType<SocialLink[]>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
