import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  BlogsModule,
  BookingsModule,
  DatabaseModule,
  FleetModule,
  HealthModule,
  LandingModule,
  PricingModule,
  SiteSettingsModule,
} from './modules';
import { AllExceptionsFilter, RequestLoggerMiddleware } from './common';

@Module({
  imports: [
    // Not a global guard: only routes with @UseGuards(ThrottlerGuard) are limited (POST /bookings).
    // In-memory storage — switch to Redis if the API is scaled horizontally (ticket 06 Q12).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 600_000, limit: 5 }]),
    DatabaseModule,
    HealthModule,
    SiteSettingsModule,
    LandingModule,
    BlogsModule,
    FleetModule,
    PricingModule,
    BookingsModule,
  ],
  // APP_FILTER (not useGlobalFilters) so every app built from this module, incl. e2e tests, gets the same envelope
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('{*splat}');
  }
}
