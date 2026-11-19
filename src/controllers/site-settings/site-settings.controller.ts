import { Controller, Get, Header } from '@nestjs/common';
import { SiteSettingsService } from 'src/services';

@Controller()
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('/site-settings')
  @Header('Cache-Control', 'public, max-age=300')
  getSiteSettings() {
    return this.siteSettingsService.getSiteSettings();
  }
}
