import { Controller, Get, Header, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common';
import { LandingService } from 'src/services';
import { getFaqsQuerySchema } from 'src/types';
import type {
  FaqDto,
  GetFaqsQueryDto,
  LandingResponseDto,
  Paginated,
} from 'src/types';

@Controller()
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get('/landing')
  @Header('Cache-Control', 'public, max-age=300')
  getLanding(): Promise<LandingResponseDto> {
    return this.landingService.getLanding();
  }

  @Get('/faqs')
  @Header('Cache-Control', 'public, max-age=300')
  getFaqs(
    @Query(new ZodValidationPipe(getFaqsQuerySchema)) query: GetFaqsQueryDto,
  ): Promise<Paginated<FaqDto>> {
    return this.landingService.getFaqs(query);
  }
}
