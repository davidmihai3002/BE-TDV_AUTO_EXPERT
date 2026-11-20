import { Injectable } from '@nestjs/common';
import { db } from '../database';
import type { BodyTypeCount } from 'src/common/utils/landing-utils';
import type { GetFaqsQueryDto } from 'src/types';

@Injectable()
export class LandingOperations {
  getSections() {
    return db
      .selectFrom('landingSections')
      .select([
        'key',
        'eyebrow',
        'eyebrowIcon',
        'title',
        'titleHighlight',
        'titleSuffix',
        'subtitle',
        'primaryCtaLabel',
        'primaryCtaHref',
        'secondaryCtaLabel',
        'secondaryCtaHref',
        'secondaryCtaIcon',
        'imageUrl',
        'imageAlt',
        'imageAltMobile',
        'extra',
        'showOnDesktop',
        'showOnMobile',
      ])
      .execute();
  }

  getStats() {
    return db
      .selectFrom('landingStats')
      .select([
        'id',
        'value',
        'suffix',
        'shortSuffix',
        'label',
        'shortLabel',
        'accent',
        'accentMobile',
      ])
      .where('isPublished', '=', true)
      .orderBy('sortOrder')
      .orderBy('createdAt')
      .execute();
  }

  getFeatures() {
    return db
      .selectFrom('landingFeatures')
      .select([
        'id',
        'title',
        'description',
        'icon',
        'iconMobile',
        'accent',
        'tags',
      ])
      .where('isPublished', '=', true)
      .orderBy('sortOrder')
      .orderBy('createdAt')
      .execute();
  }

  getFleetHighlights() {
    return db
      .selectFrom('landingFleetHighlights')
      .select([
        'id',
        'slug',
        'name',
        'tagline',
        'description',
        'bodyTypes',
        'imageUrl',
        'imageAlt',
        'highlightIcon',
        'highlightLabel',
        'specs',
      ])
      .where('isPublished', '=', true)
      .orderBy('sortOrder')
      .orderBy('createdAt')
      .execute();
  }

  getFleetBodyTypeCounts(): Promise<BodyTypeCount[]> {
    return db
      .selectFrom('fleet')
      .select((eb) => [
        'bodyType',
        'transmission',
        eb.fn.countAll<string>().as('count'),
      ])
      .where('isActive', '=', true)
      .where('bodyType', 'is not', null)
      .groupBy(['bodyType', 'transmission'])
      .execute() as Promise<BodyTypeCount[]>;
  }

  getFaqs({ page, limit }: GetFaqsQueryDto) {
    return db
      .selectFrom('faqs')
      .select(['id', 'question', 'answer'])
      .where('page', '=', page)
      .where('isPublished', '=', true)
      .orderBy('sortOrder')
      .orderBy('createdAt')
      .limit(limit)
      .execute();
  }

  async countFaqs(page: string): Promise<number> {
    const row = await db
      .selectFrom('faqs')
      .select((eb) => eb.fn.countAll<string>().as('total'))
      .where('page', '=', page)
      .where('isPublished', '=', true)
      .executeTakeFirstOrThrow();
    return Number(row.total);
  }
}
