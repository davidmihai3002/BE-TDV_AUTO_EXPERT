import { ImmutableGenerated } from '../database';

export enum TransmissionType {
  Manual = 'manual',
  Automatic = 'automatic',
}

export enum FuelType {
  Hybrid = 'hybrid',
  Petrol = 'petrol',
  Diesel = 'diesel',
  Electric = 'electric',
}

export interface FleetTable {
  id: ImmutableGenerated<string>;
  carName: string;
  transmission: TransmissionType;
  fuel: FuelType;
  imageURL: string;
  successRate: number;
  averageGrade: number;
  instructorName: string;
  instructorPhoneNumber: string;
}
