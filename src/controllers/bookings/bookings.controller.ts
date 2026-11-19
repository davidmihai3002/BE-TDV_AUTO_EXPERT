import {
  Body,
  Controller,
  Header,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ZodValidationPipe } from 'src/common';
import { BookingsService } from 'src/services';
import { createBookingSchema } from 'src/types';
import type { CreateBookingDto, CreateBookingResponseDto } from 'src/types';

export const BOOKINGS_THROTTLE = { limit: 5, ttl: 600_000 };

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Throttled per IP here only; GET endpoints stay unthrottled (no global guard).
  @Post('/bookings')
  @HttpCode(201)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: BOOKINGS_THROTTLE })
  @Header('Cache-Control', 'no-store')
  create(
    @Body(new ZodValidationPipe(createBookingSchema)) dto: CreateBookingDto,
  ): Promise<CreateBookingResponseDto> {
    return this.bookingsService.createBooking(dto);
  }
}
