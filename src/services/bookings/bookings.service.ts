import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingsOperations } from 'src/clients';
import { CreateBookingDto, CreateBookingResponseDto } from 'src/types';
import { PricingService } from '../pricing';

export const DEFAULT_LICENSE_CATEGORY = 'B';

function withIssuePath(
  e: BadRequestException,
  path: string,
): BadRequestException {
  const body = e.getResponse();
  const message =
    typeof body === 'object' && body && 'message' in body
      ? String(body.message)
      : e.message;
  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message,
    issues: [{ path, code: 'custom', message }],
  });
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly bookingsOperations: BookingsOperations,
    private readonly pricingService: PricingService,
  ) {}

  async createBooking(
    dto: CreateBookingDto,
    now: Date = new Date(),
  ): Promise<CreateBookingResponseDto> {
    const car = await this.bookingsOperations.getBookableCar(dto.fleetId);
    if (!car)
      throw new NotFoundException(`Fleet car "${dto.fleetId}" not found`);

    const licenseCategory =
      dto.licenseCategory ??
      (dto.lessonsCount != null ? DEFAULT_LICENSE_CATEGORY : undefined);

    let quotedTotal: number | null = null;
    if (dto.lessonsCount != null) {
      try {
        const quote = await this.pricingService.computeQuote({
          categoryCode: licenseCategory ?? DEFAULT_LICENSE_CATEGORY,
          vehicleId: car.id,
          lessons: dto.lessonsCount,
        });
        quotedTotal = quote.total;
      } catch (e) {
        if (e instanceof BadRequestException)
          throw withIssuePath(e, 'lessonsCount');
        if (e instanceof NotFoundException) {
          this.logger.warn(
            `No active pricing rate for fleet car ${car.id}; booking stored without a quote`,
          );
        } else {
          throw e;
        }
      }
    }

    return this.bookingsOperations.insertBooking({
      fleetId: car.id,
      instructorId: car.instructorId,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email ?? null,
      preferredDate: dto.preferredDate,
      preferredTimeSlot: dto.preferredTimeSlot,
      licenseCategory: licenseCategory ?? null,
      lessonsCount: dto.lessonsCount ?? null,
      quotedTotal,
      currency: 'RON',
      message: dto.message ?? null,
      gdprConsentAt: now,
    });
  }
}
