import { Module } from '@nestjs/common';
import {
  BlogsModule,
  DatabaseModule,
  FleetModule,
  HealthModule,
  SiteSettingsModule,
} from './modules';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    SiteSettingsModule,
    BlogsModule,
    FleetModule,
  ],
})
export class AppModule {}
