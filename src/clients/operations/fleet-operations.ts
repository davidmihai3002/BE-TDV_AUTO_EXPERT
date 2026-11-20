import { Injectable } from '@nestjs/common';
import { db } from '../database';
import {
  CarCategory,
  FleetFilters,
  FuelType,
  TransmissionType,
} from 'src/types';
import type { FacetCountRow, FleetCarRow } from 'src/common/utils/fleet-utils';

function baseQuery() {
  return db
    .selectFrom('fleet')
    .leftJoin('instructors', (join) =>
      join
        .onRef('instructors.id', '=', 'fleet.instructorId')
        .on('instructors.isActive', '=', true),
    )
    .where('fleet.isActive', '=', true);
}

type BaseQuery = ReturnType<typeof baseQuery>;

function applyFilters(qb: BaseQuery, filters: FleetFilters): BaseQuery {
  if (filters.transmission)
    qb = qb.where('fleet.transmission', 'in', filters.transmission);
  if (filters.fuel) qb = qb.where('fleet.fuel', 'in', filters.fuel);
  if (filters.category) qb = qb.where('fleet.category', 'in', filters.category);
  if (filters.bodyType) qb = qb.where('fleet.bodyType', 'in', filters.bodyType);
  return qb;
}

function selectCar(qb: BaseQuery) {
  return qb.select([
    'fleet.id',
    'fleet.slug',
    'fleet.carName',
    'fleet.series',
    'fleet.category',
    'fleet.badgeLabel',
    'fleet.transmission',
    'fleet.transmissionLabel',
    'fleet.fuel',
    'fleet.bodyType',
    'fleet.horsepower',
    'fleet.zeroToHundredSeconds',
    'fleet.imageUrl',
    'fleet.imageAlt',
    'fleet.successRate',
    'fleet.averageGrade',
    'fleet.displayOrder',
    'instructors.id as instructorRefId',
    'instructors.fullName as instructorFullName',
    'instructors.phoneNumber as instructorPhoneNumber',
    'instructors.photoUrl as instructorPhotoUrl',
    'instructors.photoAlt as instructorPhotoAlt',
  ]);
}

@Injectable()
export class FleetOperations {
  getFleet(
    filters: FleetFilters,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<FleetCarRow[]> {
    return selectCar(applyFilters(baseQuery(), filters))
      .orderBy('fleet.displayOrder', 'asc')
      .orderBy('fleet.carName', 'asc')
      .limit(limit)
      .offset(offset)
      .execute();
  }

  async countFleet(filters: FleetFilters): Promise<number> {
    const row = await applyFilters(baseQuery(), filters)
      .select((eb) => eb.fn.countAll<string>().as('total'))
      .executeTakeFirstOrThrow();
    return Number(row.total);
  }

  async getFleetFacets(): Promise<{
    transmission: FacetCountRow<TransmissionType>[];
    fuel: FacetCountRow<FuelType>[];
    category: FacetCountRow<CarCategory>[];
  }> {
    const active = () =>
      db.selectFrom('fleet').where('fleet.isActive', '=', true);
    const [transmission, fuel, category] = await Promise.all([
      active()
        .select((eb) => [
          'transmission as value',
          eb.fn.countAll<string>().as('count'),
        ])
        .groupBy('transmission')
        .execute(),
      active()
        .select((eb) => ['fuel as value', eb.fn.countAll<string>().as('count')])
        .groupBy('fuel')
        .execute(),
      active()
        .select((eb) => [
          'category as value',
          eb.fn.countAll<string>().as('count'),
        ])
        .groupBy('category')
        .execute(),
    ]);
    return { transmission, fuel, category };
  }

  getFleetCarById(id: string): Promise<FleetCarRow | undefined> {
    return selectCar(baseQuery()).where('fleet.id', '=', id).executeTakeFirst();
  }

  getFleetCarBySlug(slug: string): Promise<FleetCarRow | undefined> {
    return selectCar(baseQuery())
      .where('fleet.slug', '=', slug)
      .executeTakeFirst();
  }
}
