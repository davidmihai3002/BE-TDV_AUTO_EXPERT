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
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('{*splat}');
  }
}
