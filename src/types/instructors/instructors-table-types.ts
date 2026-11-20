import { Generated } from 'kysely';
import { ImmutableGenerated, Timestamp } from '../database';

export interface InstructorsTable {
  id: ImmutableGenerated<string>;
  fullName: string;
  phoneNumber: string;
  photoUrl: string | null;
  photoAlt: string | null;
  isActive: Generated<boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
