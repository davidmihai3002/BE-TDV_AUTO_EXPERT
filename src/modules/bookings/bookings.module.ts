import { Module } from '@nestjs/common';
import { BookingsOperations } from 'src/clients';
import { BookingsController } from 'src/controllers';
import { BookingsService } from 'src/services';

// 03's PR adds `imports: [PricingModule]` and injects PricingService into BookingsService.
@Module({
  providers: [BookingsService, BookingsOperations],
  controllers: [BookingsController],
})
export class BookingsModule {}
