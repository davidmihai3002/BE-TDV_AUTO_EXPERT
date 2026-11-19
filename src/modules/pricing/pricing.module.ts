import { Module } from '@nestjs/common';
import { PricingOperations } from 'src/clients';
import { PricingController } from 'src/controllers';
import { PricingService } from 'src/services';

@Module({
  providers: [PricingService, PricingOperations],
  controllers: [PricingController],
  // 06's BookingsModule computes `quoted_total` with it
  exports: [PricingService],
})
export class PricingModule {}
