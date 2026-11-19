import { Body, Controller, Get, Header, HttpCode, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common';
import { PricingService } from 'src/services';
import { quoteSelectionSchema } from 'src/types';
import type {
  PricingOptionsDto,
  QuoteBreakdownDto,
  QuoteSelection,
} from 'src/types';

@Controller()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('/pricing/options')
  @Header('Cache-Control', 'public, max-age=300')
  getOptions(): Promise<PricingOptionsDto> {
    return this.pricingService.getOptions();
  }

  /** Stateless, authoritative estimate; the FE calls it debounced after selection changes. */
  @Post('/pricing/quote')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  quote(
    @Body(new ZodValidationPipe(quoteSelectionSchema)) body: QuoteSelection,
  ): Promise<QuoteBreakdownDto> {
    return this.pricingService.computeQuote(body);
  }
}
