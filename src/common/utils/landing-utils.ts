import { TransmissionType } from 'src/types';
import type {
  BodyType,
  FleetHighlightDto,
  LandingFleetHighlightsTable,
} from 'src/types';
import type { Selectable } from 'kysely';

export interface BodyTypeCount {
  bodyType: BodyType;
  transmission: TransmissionType;
  count: number | string;
}

const TRANSMISSION_ORDER: TransmissionType[] = [
  'manual',
  'automatic',
] as TransmissionType[];

/**
 * Card copy + live numbers: sums 06's active cars whose body type the highlight covers, derives the transmission
 * badge. Returns null when no car matches (never advertise a car type the school doesn't have).
 */
export function toFleetHighlightDto(
  row: Omit<
    Selectable<LandingFleetHighlightsTable>,
    'createdAt' | 'updatedAt' | 'isPublished' | 'sortOrder'
  >,
  counts: BodyTypeCount[],
): FleetHighlightDto | null {
  const matching = counts.filter((c) => row.bodyTypes.includes(c.bodyType));
  const carCount = matching.reduce((sum, c) => sum + Number(c.count), 0);
  if (carCount === 0) return null;
  const present = new Set(matching.map((c) => c.transmission));
  const transmissions = TRANSMISSION_ORDER.filter((t) => present.has(t));
  const both = transmissions.length === 2;
  const autoOnly = !both && transmissions[0] === TransmissionType.Automatic;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    bodyTypes: row.bodyTypes,
    carCount,
    transmissions,
    badgeLabel: both
      ? 'Manual și automat'
      : autoOnly
        ? 'Doar automat'
        : 'Doar manual',
    // mobile design: gold when manual is available, blue for automatic-only
    badgeVariantMobile: autoOnly ? 'secondary' : 'primary',
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    highlightIcon: row.highlightIcon,
    highlightLabel: row.highlightLabel,
    specs: row.specs,
  };
}
