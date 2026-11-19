import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteSettingsOperations } from 'src/clients';
import { SiteSettingsDto } from 'src/types';

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly siteSettingsOperations: SiteSettingsOperations,
  ) {}

  async getSiteSettings(): Promise<SiteSettingsDto> {
    const row = await this.siteSettingsOperations.getSiteSettings();
    if (!row) throw new NotFoundException('Site settings not found');
    return {
      brandName: row.brandName,
      tagline: row.tagline,
      footerDescription: row.footerDescription,
      copyrightText: row.copyrightText,
      contact: {
        phone: row.contactPhone,
        email: row.contactEmail,
        address: row.contactAddress,
        schedule: row.contactSchedule,
      },
      currency: row.currency.trim() as 'RON',
      privacyUrl: row.privacyUrl,
      termsUrl: row.termsUrl,
      socials: row.socials,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
