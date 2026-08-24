import { Module } from '@nestjs/common';
import { FleetOperations } from 'src/clients';
import { FleetController } from 'src/controllers';
import { FleetService } from 'src/services';

@Module({
  providers: [FleetService, FleetOperations],
  controllers: [FleetController],
})
export class FleetModule {}
