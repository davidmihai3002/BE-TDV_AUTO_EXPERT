import { Generated } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export interface InstructorsTable {
  id: ImmutableGenerated<string>;
  fullName: string;
  /** E.164, no spaces (e.g. +40721555101); the FE formats it for display. */
  phoneNumber: string;
  photoUrl: string | null;
  photoAlt: string | null;
  isActive: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
