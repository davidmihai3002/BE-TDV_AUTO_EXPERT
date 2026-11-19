import { Injectable, NotFoundException } from '@nestjs/common';
import { FleetOperations } from 'src/clients';
import { isUuid, toFacetsDto, toFleetCarDto } from 'src/common/utils';
import { FleetCarDto, FleetListResponseDto, GetFleetQuery } from 'src/types';

@Injectable()
export class FleetService {
  constructor(private readonly fleetOperations: FleetOperations) {}

  async getFleet(query: GetFleetQuery): Promise<FleetListResponseDto> {
    const { page, pageSize, ...filters } = query;
    const [rows, total, facetRows] = await Promise.all([
      this.fleetOperations.getFleet(filters, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      this.fleetOperations.countFleet(filters),
      this.fleetOperations.getFleetFacets(),
    ]);
    return {
      items: rows.map(toFleetCarDto),
      total,
      page,
      pageSize,
      facets: toFacetsDto(facetRows),
    };
  }

  async getFleetCar(idOrSlug: string): Promise<FleetCarDto> {
    const row = isUuid(idOrSlug)
      ? await this.fleetOperations.getFleetCarById(idOrSlug)
      : await this.fleetOperations.getFleetCarBySlug(idOrSlug);
    if (!row) throw new NotFoundException(`Fleet car "${idOrSlug}" not found`);
    return toFleetCarDto(row);
  }
}
