import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingsOperations } from 'src/clients';
import { CreateBookingDto, CreateBookingResponseDto } from 'src/types';

/** Only license category seeded by 03; used when lessons are requested without a category. */
export const DEFAULT_LICENSE_CATEGORY = 'B';

@Injectable()
export class BookingsService {
  constructor(private readonly bookingsOperations: BookingsOperations) {}

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
    // TODO(03): wire PricingService.computeQuote — the server recomputes the price, never trusts the client.
    const quotedTotal = null;

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
