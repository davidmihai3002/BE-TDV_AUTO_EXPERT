import { Controller, Get } from '@nestjs/common';
import { FleetService } from 'src/services';

@Controller()
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}
  @Get('/fleet')
  async getFleet() {
    return this.fleetService.getAllFleet();
  }
}
