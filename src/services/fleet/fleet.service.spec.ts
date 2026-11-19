// Unit tests: no DB. Operations are mocked; the real module would open a pg pool (and kysely is ESM-only).
jest.mock('src/clients', () => ({}));

import { NotFoundException } from '@nestjs/common';
import { FleetCarRow, toFacetsDto, toFleetCarDto } from 'src/common/utils';
import { CarCategory, FuelType, TransmissionType } from 'src/types';
import { FleetService } from './fleet.service';

const row = (over: Partial<FleetCarRow> = {}): FleetCarRow => ({
  id: '6f1c1c1e-6d0b-4a51-9b4e-1f3c1a2b3c4d',
  slug: 'vw-golf-8',
  carName: 'VW Golf 8',
  series: null,
  category: CarCategory.Beginner,
  badgeLabel: 'Pentru începători',
  transmission: TransmissionType.Automatic,
  transmissionLabel: null,
  fuel: FuelType.Petrol,
  bodyType: null,
  horsepower: null,
  zeroToHundredSeconds: '3.2',
  imageUrl: '/images/fleet/vw-golf-8.webp',
  imageAlt: 'alt',
  successRate: '94.20',
  averageGrade: '9.10',
  displayOrder: 40,
  instructorRefId: 'i-1',
  instructorFullName: 'Andrei Ionescu',
  instructorPhoneNumber: '+40721555101',
  instructorPhotoUrl: null,
  instructorPhotoAlt: null,
  ...over,
});

describe('toFleetCarDto', () => {
  it('converts numeric strings to numbers and nests the instructor', () => {
    const dto = toFleetCarDto(row());
    expect(typeof dto.successRate).toBe('number');
    expect(dto.successRate).toBe(94.2);
    expect(dto.averageGrade).toBe(9.1);
    expect(dto.zeroToHundredSeconds).toBe(3.2);
    expect(dto.horsepower).toBeNull();
    expect(dto.instructor).toEqual({
      id: 'i-1',
      fullName: 'Andrei Ionescu',
      phoneNumber: '+40721555101',
      photoUrl: null,
      photoAlt: null,
    });
    expect(dto).not.toHaveProperty('instructorFullName');
  });

  it('returns instructor null when the join found nothing (inactive/missing)', () => {
    const dto = toFleetCarDto(
      row({
        instructorRefId: null,
        instructorFullName: null,
        instructorPhoneNumber: null,
        successRate: null,
      }),
    );
    expect(dto.instructor).toBeNull();
    expect(dto.successRate).toBeNull();
  });
});

describe('toFacetsDto', () => {
  it('fills missing values with 0 and converts counts', () => {
    const facets = toFacetsDto({
      transmission: [{ value: TransmissionType.Manual, count: '2' }],
      fuel: [{ value: FuelType.Electric, count: 1 }],
      category: [],
    });
    expect(facets.transmission).toEqual({ manual: 2, automatic: 0 });
    expect(facets.fuel).toEqual({
      petrol: 0,
      diesel: 0,
      hybrid: 0,
      electric: 1,
    });
    expect(facets.category).toEqual({
      beginner: 0,
      fundamentals: 0,
      advanced: 0,
      mastery: 0,
    });
  });
});

describe('FleetService', () => {
  const ops = {
    getFleet: jest.fn(),
    countFleet: jest.fn(),
    getFleetFacets: jest.fn(),
    getFleetCarById: jest.fn(),
    getFleetCarBySlug: jest.fn(),
  };
  const service = new FleetService(ops);

  beforeEach(() => jest.resetAllMocks());

  it('getFleet passes filters + offset and builds the envelope', async () => {
    ops.getFleet.mockResolvedValue([row()]);
    ops.countFleet.mockResolvedValue(7);
    ops.getFleetFacets.mockResolvedValue({
      transmission: [],
      fuel: [],
      category: [],
    });
    const res = await service.getFleet({
      transmission: [TransmissionType.Manual],
      page: 2,
      pageSize: 5,
    });
    expect(ops.getFleet).toHaveBeenCalledWith(
      { transmission: ['manual'] },
      { limit: 5, offset: 5 },
    );
    expect(res).toMatchObject({ total: 7, page: 2, pageSize: 5 });
    expect(res.items).toHaveLength(1);
    expect(res.facets.transmission).toEqual({ manual: 0, automatic: 0 });
  });

  it('getFleetCar looks up by id for UUIDs, by slug otherwise', async () => {
    ops.getFleetCarById.mockResolvedValue(row());
    ops.getFleetCarBySlug.mockResolvedValue(row());
    await service.getFleetCar('6f1c1c1e-6d0b-4a51-9b4e-1f3c1a2b3c4d');
    expect(ops.getFleetCarById).toHaveBeenCalled();
    await service.getFleetCar('vw-golf-8');
    expect(ops.getFleetCarBySlug).toHaveBeenCalledWith('vw-golf-8');
  });

  it('getFleetCar throws 404 when not found', async () => {
    ops.getFleetCarBySlug.mockResolvedValue(undefined);
    await expect(service.getFleetCar('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
