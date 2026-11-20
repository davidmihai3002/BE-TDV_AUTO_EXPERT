import { z } from 'zod';
import {
  BodyType,
  CarCategory,
  FuelType,
  TransmissionType,
} from './fleet-table-types';

const csv = <T extends z.ZodType>(item: T) =>
  z
    .preprocess(
      (v: unknown): unknown =>
        Array.isArray(v)
          ? (v as unknown[]).flatMap((s) =>
              typeof s === 'string' ? s.split(',') : [s],
            )
          : typeof v === 'string'
            ? v.split(',')
            : v,
      z
        .array(
          z.preprocess((s) => (typeof s === 'string' ? s.trim() : s), item),
        )
        .min(1),
    )
    .optional();

export const getFleetQuerySchema = z.object({
  transmission: csv(z.enum(TransmissionType)),
  fuel: csv(z.enum(FuelType)),
  category: csv(z.enum(CarCategory)),
  bodyType: csv(z.enum(BodyType)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});
export type GetFleetQuery = z.infer<typeof getFleetQuerySchema>;
export type FleetFilters = Pick<
  GetFleetQuery,
  'transmission' | 'fuel' | 'category' | 'bodyType'
>;

export const fleetIdOrSlugParamSchema = z.union([
  z.uuid(),
  z.string().regex(/^[a-z0-9-]{1,100}$/),
]);

export interface InstructorDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  photoUrl: string | null;
  photoAlt: string | null;
}

export interface FleetCarDto {
  id: string;
  slug: string;
  carName: string;
  series: string | null;
  category: CarCategory;
  badgeLabel: string | null;
  transmission: TransmissionType;
  transmissionLabel: string | null;
  fuel: FuelType;
  bodyType: BodyType | null;
  horsepower: number | null;
  zeroToHundredSeconds: number | null;
  imageUrl: string;
  imageAlt: string;
  successRate: number | null;
  averageGrade: number | null;
  displayOrder: number;
  instructor: InstructorDto | null;
}

export interface FleetFacetsDto {
  transmission: Record<TransmissionType, number>;
  fuel: Record<FuelType, number>;
  category: Record<CarCategory, number>;
}

export interface FleetListResponseDto {
  items: FleetCarDto[];
  total: number;
  page: number;
  pageSize: number;
  facets: FleetFacetsDto;
}
