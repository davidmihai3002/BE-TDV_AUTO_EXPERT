import { Injectable } from '@nestjs/common';
import { LandingOperations } from 'src/clients';
import { toFleetHighlightDto } from 'src/common/utils/landing-utils';
import type {
  FaqDto,
  GetFaqsQueryDto,
  LandingResponseDto,
  Paginated,
} from 'src/types';

@Injectable()
export class LandingService {
  constructor(private readonly landingOperations: LandingOperations) {}

  async getLanding(): Promise<LandingResponseDto> {
    const [sections, stats, features, highlights, counts, faqs] =
      await Promise.all([
        this.landingOperations.getSections(),
        this.landingOperations.getStats(),
        this.landingOperations.getFeatures(),
        this.landingOperations.getFleetHighlights(),
        this.landingOperations.getFleetBodyTypeCounts(),
        this.landingOperations.getFaqs({ page: 'landing', limit: 50 }),
      ]);
    return {
      sections: Object.fromEntries(sections.map((s) => [s.key, s])),
      stats,
      features,
      fleetHighlights: highlights
        .map((h) => toFleetHighlightDto(h, counts))
        .filter((h): h is NonNullable<typeof h> => h !== null),
      faqs,
    };
  }

  async getFaqs(query: GetFaqsQueryDto): Promise<Paginated<FaqDto>> {
    const [items, total] = await Promise.all([
      this.landingOperations.getFaqs(query),
      this.landingOperations.countFaqs(query.page),
    ]);
    return { items, total, page: 1, pageSize: query.limit };
  }
}
