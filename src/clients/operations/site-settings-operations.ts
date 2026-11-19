import { Injectable } from '@nestjs/common';
import { db } from '../database';

@Injectable()
export class SiteSettingsOperations {
  getSiteSettings() {
    return db
      .selectFrom('siteSettings')
      .selectAll()
      .where('id', '=', 1)
      .executeTakeFirst();
  }
}
