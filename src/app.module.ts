import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  BlogsModule,
  BookingsModule,
  DatabaseModule,
  FleetModule,
  HealthModule,
  SiteSettingsModule,
} from './modules';

@Module({
  imports: [
    // Not a global guard: only routes with @UseGuards(ThrottlerGuard) are limited (POST /bookings).
    // In-memory storage — switch to Redis if the API is scaled horizontally (ticket 06 Q12).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 600_000, limit: 5 }]),
    DatabaseModule,
    HealthModule,
    SiteSettingsModule,
    BlogsModule,
    FleetModule,
    BookingsModule,
  ],
})
export class AppModule {}
