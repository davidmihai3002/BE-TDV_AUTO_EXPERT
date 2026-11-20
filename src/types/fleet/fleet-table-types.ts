import { Generated } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export enum TransmissionType {
  Manual = 'manual',
  Automatic = 'automatic',
}

export enum FuelType {
  Petrol = 'petrol',
  Diesel = 'diesel',
  Hybrid = 'hybrid',
  Electric = 'electric',
}

export enum CarCategory {
  Beginner = 'beginner',
  Fundamentals = 'fundamentals',
  Advanced = 'advanced',
  Mastery = 'mastery',
}

export enum BodyType {
  Compact = 'compact',
  Hatchback = 'hatchback',
  Sedan = 'sedan',
  Coupe = 'coupe',
  Suv = 'suv',
}

export interface FleetTable {
  id: ImmutableGenerated<string>;
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
  imageAlt: Generated<string>;
  successRate: number | null;
  averageGrade: number | null;
  instructorId: string | null;
  displayOrder: Generated<number>;
  isActive: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
