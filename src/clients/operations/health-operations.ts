import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { db } from '../database';

@Injectable()
export class HealthOperations {
  async ping(): Promise<void> {
    await sql`select 1`.execute(db);
  }
}
