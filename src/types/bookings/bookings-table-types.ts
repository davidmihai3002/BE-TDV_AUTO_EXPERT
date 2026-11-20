import { Generated } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export enum BookingTimeSlot {
  Dimineata = 'dimineata',
  Pranz = 'pranz',
  Seara = 'seara',
}

export enum BookingStatus {
  Noua = 'noua',
  Confirmata = 'confirmata',
  Anulata = 'anulata',
}

export interface BookingsTable {
  id: ImmutableGenerated<string>;
  fleetId: string;
  instructorId: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTimeSlot: BookingTimeSlot;
  licenseCategory: string | null;
  lessonsCount: number | null;
  quotedTotal: number | null;
  currency: Generated<string>;
  message: string | null;
  gdprConsentAt: Date;
  status: Generated<BookingStatus>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
