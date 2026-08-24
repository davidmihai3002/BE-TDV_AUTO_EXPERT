import { Injectable } from '@nestjs/common';
import { FleetOperations } from 'src/clients';

@Injectable()
export class FleetService {
  constructor(private readonly fleetOperations: FleetOperations) {}
  async getAllFleet() {
    return this.fleetOperations.getAllFleet();
  }
}
