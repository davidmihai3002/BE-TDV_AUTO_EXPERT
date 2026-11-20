import {
  CarCategory,
  FleetCarDto,
  FleetFacetsDto,
  FuelType,
  TransmissionType,
} from 'src/types';

export interface FleetCarRow {
  id: string;
  slug: string;
  carName: string;
  series: string | null;
  category: FleetCarDto['category'];
  badgeLabel: string | null;
  transmission: FleetCarDto['transmission'];
  transmissionLabel: string | null;
  fuel: FleetCarDto['fuel'];
  bodyType: FleetCarDto['bodyType'];
  horsepower: number | string | null;
  zeroToHundredSeconds: number | string | null;
  imageUrl: string;
  imageAlt: string;
  successRate: number | string | null;
  averageGrade: number | string | null;
  displayOrder: number;
  instructorRefId: string | null;
  instructorFullName: string | null;
  instructorPhoneNumber: string | null;
  instructorPhotoUrl: string | null;
  instructorPhotoAlt: string | null;
}

export interface FacetCountRow<V extends string> {
  value: V;
  count: number | string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

const toNumberOrNull = (v: number | string | null): number | null =>
  v === null ? null : Number(v);

export function toFleetCarDto(row: FleetCarRow): FleetCarDto {
  return {
    id: row.id,
    slug: row.slug,
    carName: row.carName,
    series: row.series,
    category: row.category,
    badgeLabel: row.badgeLabel,
    transmission: row.transmission,
    transmissionLabel: row.transmissionLabel,
    fuel: row.fuel,
    bodyType: row.bodyType,
    horsepower: toNumberOrNull(row.horsepower),
    zeroToHundredSeconds: toNumberOrNull(row.zeroToHundredSeconds),
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    successRate: toNumberOrNull(row.successRate),
    averageGrade: toNumberOrNull(row.averageGrade),
    displayOrder: row.displayOrder,
    instructor:
      row.instructorRefId && row.instructorFullName && row.instructorPhoneNumber
        ? {
            id: row.instructorRefId,
            fullName: row.instructorFullName,
            phoneNumber: row.instructorPhoneNumber,
            photoUrl: row.instructorPhotoUrl,
            photoAlt: row.instructorPhotoAlt,
          }
        : null,
  };
}

function toCounts<V extends string>(
  values: readonly V[],
  rows: FacetCountRow<V>[],
): Record<V, number> {
  const out = Object.fromEntries(values.map((v) => [v, 0])) as Record<
    V,
    number
  >;
  for (const row of rows) {
    if (row.value in out) out[row.value] = Number(row.count);
  }
  return out;
}

export function toFacetsDto(rows: {
  transmission: FacetCountRow<TransmissionType>[];
  fuel: FacetCountRow<FuelType>[];
  category: FacetCountRow<CarCategory>[];
}): FleetFacetsDto {
  return {
    transmission: toCounts(Object.values(TransmissionType), rows.transmission),
    fuel: toCounts(Object.values(FuelType), rows.fuel),
    category: toCounts(Object.values(CarCategory), rows.category),
  };
}
