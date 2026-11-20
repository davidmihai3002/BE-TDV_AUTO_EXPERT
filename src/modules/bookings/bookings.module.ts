import { Module } from '@nestjs/common';
import { BookingsOperations } from 'src/clients';
import { BookingsController } from 'src/controllers';
import { BookingsService } from 'src/services';
import { PricingModule } from '../pricing';

@Module({
  imports: [PricingModule],
  providers: [BookingsService, BookingsOperations],
  controllers: [BookingsController],
})
export class BookingsModule {}
