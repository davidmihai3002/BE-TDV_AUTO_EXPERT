import { Injectable } from '@nestjs/common';
import { Insertable } from 'kysely';
import { db } from '../database';
import { BookingStatus, BookingsTable } from 'src/types';

@Injectable()
export class BookingsOperations {
  /** Active car + its instructor id if that instructor is active (snapshotted on the booking). */
  getBookableCar(
    fleetId: string,
  ): Promise<{ id: string; instructorId: string | null } | undefined> {
    return db
      .selectFrom('fleet')
      .leftJoin('instructors', (join) =>
        join
          .onRef('instructors.id', '=', 'fleet.instructorId')
          .on('instructors.isActive', '=', true),
      )
      .select(['fleet.id', 'instructors.id as instructorId'])
      .where('fleet.id', '=', fleetId)
      .where('fleet.isActive', '=', true)
      .executeTakeFirst();
  }

  insertBooking(
    row: Insertable<BookingsTable>,
  ): Promise<{ id: string; status: BookingStatus }> {
    return db
      .insertInto('bookings')
      .values(row)
      .returning(['id', 'status'])
      .executeTakeFirstOrThrow();
  }
}
