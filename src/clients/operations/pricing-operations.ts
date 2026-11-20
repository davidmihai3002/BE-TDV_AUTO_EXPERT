import { Injectable } from '@nestjs/common';
import { db } from '../database';

@Injectable()
export class PricingOperations {
  getSettings() {
    return db
      .selectFrom('pricingSettings')
      .select([
        'currency',
        'vatIncluded',
        'processingFee',
        'processingFeeLabel',
        'minLessons',
        'maxLessons',
        'defaultLessons',
        'lessonStep',
      ])
      .where('id', '=', 1)
      .executeTakeFirst();
  }

  getActiveCategories() {
    return db
      .selectFrom('licenseCategories')
      .select([
        'id',
        'code',
        'name',
        'shortName',
        'description',
        'badgeLabel',
        'icon',
        'sortOrder',
      ])
      .where('isActive', '=', true)
      .orderBy('sortOrder')
      .orderBy('code')
      .execute();
  }

  getActiveCategoryByCode(code: string) {
    return db
      .selectFrom('licenseCategories')
      .select(['id', 'code'])
      .where('code', '=', code)
      .where('isActive', '=', true)
      .executeTakeFirst();
  }

  getOptionVehicleRates() {
    return db
      .selectFrom('pricingVehicleRates as r')
      .innerJoin('fleet as f', 'f.id', 'r.fleetId')
      .innerJoin('licenseCategories as c', 'c.id', 'r.licenseCategoryId')
      .leftJoin('instructors as i', (j) =>
        j.onRef('i.id', '=', 'f.instructorId').on('i.isActive', '=', true),
      )
      .select([
        'f.id',
        'f.slug',
        'f.carName',
        'f.transmission',
        'f.fuel',
        'f.imageUrl',
        'f.successRate',
        'f.averageGrade',
        'f.displayOrder',
        'i.fullName as instructorName',
        'c.code as categoryCode',
        'c.sortOrder as categorySortOrder',
        'r.lessonPrice',
      ])
      .where('r.isActive', '=', true)
      .where('f.isActive', '=', true)
      .where('c.isActive', '=', true)
      .orderBy('f.displayOrder')
      .orderBy('f.carName')
      .orderBy('c.sortOrder')
      .execute();
  }

  getVehicleWithRate(vehicleId: string, categoryId: string) {
    return db
      .selectFrom('fleet as f')
      .innerJoin('pricingVehicleRates as r', 'r.fleetId', 'f.id')
      .select([
        'f.id',
        'f.slug',
        'f.carName',
        'f.transmission',
        'f.fuel',
        'r.lessonPrice',
      ])
      .where('f.id', '=', vehicleId)
      .where('f.isActive', '=', true)
      .where('r.licenseCategoryId', '=', categoryId)
      .where('r.isActive', '=', true)
      .executeTakeFirst();
  }

  hasAnyActiveRate(vehicleId: string) {
    return db
      .selectFrom('pricingVehicleRates as r')
      .innerJoin('fleet as f', 'f.id', 'r.fleetId')
      .select('r.fleetId')
      .where('r.fleetId', '=', vehicleId)
      .where('r.isActive', '=', true)
      .where('f.isActive', '=', true)
      .executeTakeFirst();
  }
}
