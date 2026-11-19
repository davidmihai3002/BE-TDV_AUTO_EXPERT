import { Module } from '@nestjs/common';
import { HealthOperations } from 'src/clients';
import { HealthController } from 'src/controllers';
import { HealthService } from 'src/services';

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthOperations],
})
export class HealthModule {}
