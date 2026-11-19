import { Module } from '@nestjs/common';
import { LandingOperations } from 'src/clients';
import { LandingController } from 'src/controllers';
import { LandingService } from 'src/services';

@Module({
  providers: [LandingService, LandingOperations],
  controllers: [LandingController],
})
export class LandingModule {}
