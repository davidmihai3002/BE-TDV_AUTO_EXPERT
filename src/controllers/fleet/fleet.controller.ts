import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common';
import { FleetService } from 'src/services';
import { fleetIdOrSlugParamSchema, getFleetQuerySchema } from 'src/types';
import type {
  FleetCarDto,
  FleetListResponseDto,
  GetFleetQuery,
} from 'src/types';

@Controller()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('/fleet')
  @Header('Cache-Control', 'public, max-age=300')
  getFleet(
    @Query(new ZodValidationPipe(getFleetQuerySchema)) query: GetFleetQuery,
  ): Promise<FleetListResponseDto> {
    return this.fleetService.getFleet(query);
  }

  @Get('/fleet/:idOrSlug')
  @Header('Cache-Control', 'public, max-age=300')
  getFleetCar(
    @Param('idOrSlug', new ZodValidationPipe(fleetIdOrSlugParamSchema))
    idOrSlug: string,
  ): Promise<FleetCarDto> {
    return this.fleetService.getFleetCar(idOrSlug);
  }
}
