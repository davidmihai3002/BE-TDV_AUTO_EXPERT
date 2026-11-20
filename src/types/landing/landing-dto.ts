import { z } from 'zod';
import { BodyType, TransmissionType } from '../fleet/fleet-table-types';

export const accentSchema = z.enum(['primary', 'secondary', 'tertiary']);
export const badgeVariantSchema = z.enum(['primary', 'secondary']);
export const sectionKeySchema = z.enum([
  'hero',
  'advantage',
  'fleet',
  'insights',
  'faq',
  'cta',
]);
export const FLEET_BADGE_LABELS = [
  'Manual și automat',
  'Doar automat',
  'Doar manual',
] as const;

export const landingSectionSchema = z.object({
  key: sectionKeySchema,
  eyebrow: z.string().nullable(),
  eyebrowIcon: z.string().nullable(),
  title: z.string(),
  titleHighlight: z.string().nullable(),
  titleSuffix: z.string().nullable(),
  subtitle: z.string().nullable(),
  primaryCtaLabel: z.string().nullable(),
  primaryCtaHref: z.string().nullable(),
  secondaryCtaLabel: z.string().nullable(),
  secondaryCtaHref: z.string().nullable(),
  secondaryCtaIcon: z.string().nullable(),
  imageUrl: z.string().nullable(),
  imageAlt: z.string().nullable(),
  imageAltMobile: z.string().nullable(),
  extra: z.record(z.string(), z.unknown()),
  showOnDesktop: z.boolean(),
  showOnMobile: z.boolean(),
});

export const statSchema = z.object({
  id: z.uuid(),
  value: z.string(),
  suffix: z.string().nullable(),
  shortSuffix: z.string().nullable(),
  label: z.string(),
  shortLabel: z.string().nullable(),
  accent: accentSchema,
  accentMobile: accentSchema.nullable(),
});

export const featureSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  iconMobile: z.string().nullable(),
  accent: accentSchema,
  tags: z.array(z.string()),
});

export const fleetSpecSchema = z.object({
  icon: z.string(),
  label: z.string(),
  accent: accentSchema,
});

export const fleetHighlightSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  bodyTypes: z.array(z.enum(BodyType)).min(1),
  carCount: z.number().int().positive(),
  transmissions: z.array(z.enum(TransmissionType)).min(1),
  badgeLabel: z.enum(FLEET_BADGE_LABELS),
  badgeVariantMobile: badgeVariantSchema,
  imageUrl: z.string(),
  imageAlt: z.string(),
  highlightIcon: z.string().nullable(),
  highlightLabel: z.string().nullable(),
  specs: z.array(fleetSpecSchema),
});

export const faqSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answer: z.string(),
});

export const landingResponseSchema = z.object({
  sections: z.partialRecord(sectionKeySchema, landingSectionSchema),
  stats: z.array(statSchema),
  features: z.array(featureSchema),
  fleetHighlights: z.array(fleetHighlightSchema),
  faqs: z.array(faqSchema),
});
export type LandingResponseDto = z.infer<typeof landingResponseSchema>;
export type FleetHighlightDto = z.infer<typeof fleetHighlightSchema>;
export type FaqDto = z.infer<typeof faqSchema>;

export const getFaqsQuerySchema = z.object({
  page: z.enum(['landing', 'pricing']).default('landing'),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});
export type GetFaqsQueryDto = z.infer<typeof getFaqsQuerySchema>;
