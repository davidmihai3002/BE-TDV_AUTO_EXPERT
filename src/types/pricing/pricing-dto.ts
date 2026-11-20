import { z } from 'zod';
import { FuelType, TransmissionType } from '../fleet/fleet-table-types';

export const quoteSelectionSchema = z
  .object({
    categoryCode: z.string().trim().min(1).max(8),
    vehicleId: z.uuid(),
    lessons: z.number().int(),
    transmission: z.enum(TransmissionType).optional(),
    fuel: z.enum(FuelType).optional(),
  })
  .strict();
export type QuoteSelection = z.infer<typeof quoteSelectionSchema>;

export interface LicenseCategoryDto {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  badgeLabel: string | null;
  icon: string;
  sortOrder: number;
}

export interface PricingVehicleDto {
  id: string;
  slug: string;
  carName: string;
  transmission: TransmissionType;
  fuel: FuelType;
  imageUrl: string;
  instructorName: string | null;
  successRate: number | null;
  averageGrade: number | null;
  categoryCodes: string[];
  lessonPrice: number;
  pricesByCategory: Record<string, number>;
}

export interface PricingOptionsDto {
  currency: 'RON';
  vatIncluded: boolean;
  processingFee: { amount: number; label: string };
  lessons: { min: number; max: number; default: number; step: number };
  categories: LicenseCategoryDto[];
  vehicles: PricingVehicleDto[];
}

export interface QuoteLineDto {
  code: 'lessons' | 'processing_fee';
  label: string;
  unitAmount: number;
  quantity: number;
  amount: number;
}

export interface QuoteBreakdownDto {
  currency: 'RON';
  vatIncluded: boolean;
  vehicle: {
    id: string;
    slug: string;
    carName: string;
    transmission: TransmissionType;
    fuel: FuelType;
  };
  lessons: number;
  lines: QuoteLineDto[];
  subtotal: number;
  processingFee: number;
  total: number;
  computedAt: string;
}
