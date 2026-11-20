import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PricingOperations } from 'src/clients';
import {
  calculateQuoteAmounts,
  isValidLessonCount,
} from 'src/common/utils/pricing-utils';
import type {
  PricingOptionsDto,
  PricingVehicleDto,
  QuoteBreakdownDto,
  QuoteSelection,
} from 'src/types';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly pricingOperations: PricingOperations) {}

  private async settings() {
    const s = await this.pricingOperations.getSettings();
    if (!s) {
      this.logger.error('pricing_settings row (id = 1) is missing');
      throw new InternalServerErrorException();
    }
    return s;
  }

  async getOptions(): Promise<PricingOptionsDto> {
    const [s, categories, rates] = await Promise.all([
      this.settings(),
      this.pricingOperations.getActiveCategories(),
      this.pricingOperations.getOptionVehicleRates(),
    ]);

    const byId = new Map<string, PricingVehicleDto>();
    for (const r of rates) {
      const price = Number(r.lessonPrice);
      let v = byId.get(r.id);
      if (!v) {
        v = {
          id: r.id,
          slug: r.slug,
          carName: r.carName,
          transmission: r.transmission,
          fuel: r.fuel,
          imageUrl: r.imageUrl,
          instructorName: r.instructorName,
          successRate: r.successRate === null ? null : Number(r.successRate),
          averageGrade: r.averageGrade === null ? null : Number(r.averageGrade),
          categoryCodes: [],
          lessonPrice: price,
          pricesByCategory: {},
        };
        byId.set(r.id, v);
      }
      v.categoryCodes.push(r.categoryCode);
      v.pricesByCategory[r.categoryCode] = price;
    }

    return {
      currency: 'RON',
      vatIncluded: s.vatIncluded,
      processingFee: {
        amount: Number(s.processingFee),
        label: s.processingFeeLabel,
      },
      lessons: {
        min: s.minLessons,
        max: s.maxLessons,
        default: s.defaultLessons,
        step: s.lessonStep,
      },
      categories: categories.map((c) => ({
        ...c,
        sortOrder: Number(c.sortOrder),
      })),
      vehicles: [...byId.values()],
    };
  }

  async computeQuote(input: QuoteSelection): Promise<QuoteBreakdownDto> {
    const s = await this.settings();
    if (!isValidLessonCount(input.lessons, s)) {
      throw new BadRequestException(
        `Numărul de lecții trebuie să fie între ${s.minLessons} și ${s.maxLessons}`,
      );
    }

    const category = await this.pricingOperations.getActiveCategoryByCode(
      input.categoryCode.toUpperCase(),
    );
    if (!category) throw new BadRequestException('Categorie necunoscută');

    const vehicle = await this.pricingOperations.getVehicleWithRate(
      input.vehicleId,
      category.id,
    );
    if (!vehicle) {
      const pricedElsewhere = await this.pricingOperations.hasAnyActiveRate(
        input.vehicleId,
      );
      if (pricedElsewhere) {
        throw new BadRequestException(
          `Mașina nu este disponibilă pentru categoria ${category.code}`,
        );
      }
      throw new NotFoundException('Mașina nu a fost găsită');
    }
    if (
      (input.transmission && input.transmission !== vehicle.transmission) ||
      (input.fuel && input.fuel !== vehicle.fuel)
    ) {
      throw new BadRequestException(
        'Cutia de viteze sau combustibilul selectat nu corespunde mașinii',
      );
    }

    const rate = Number(vehicle.lessonPrice);
    const fee = Number(s.processingFee);
    const amounts = calculateQuoteAmounts({
      rate,
      lessons: input.lessons,
      fee,
    });

    return {
      currency: 'RON',
      vatIncluded: s.vatIncluded,
      vehicle: {
        id: vehicle.id,
        slug: vehicle.slug,
        carName: vehicle.carName,
        transmission: vehicle.transmission,
        fuel: vehicle.fuel,
      },
      lessons: input.lessons,
      lines: [
        {
          code: 'lessons',
          label: `Tarif mașină (${vehicle.carName})`,
          unitAmount: rate,
          quantity: input.lessons,
          amount: amounts.subtotal,
        },
        ...(amounts.processingFee > 0
          ? [
              {
                code: 'processing_fee' as const,
                label: s.processingFeeLabel,
                unitAmount: amounts.processingFee,
                quantity: 1,
                amount: amounts.processingFee,
              },
            ]
          : []),
      ],
      subtotal: amounts.subtotal,
      processingFee: amounts.processingFee,
      total: amounts.total,
      computedAt: new Date().toISOString(),
    };
  }
}
