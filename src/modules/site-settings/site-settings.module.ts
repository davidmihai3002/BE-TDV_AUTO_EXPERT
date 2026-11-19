import { Module } from '@nestjs/common';
import { SiteSettingsOperations } from 'src/clients';
import { SiteSettingsController } from 'src/controllers';
import { SiteSettingsService } from 'src/services';

@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, SiteSettingsOperations],
})
export class SiteSettingsModule {}
