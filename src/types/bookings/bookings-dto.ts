import { z } from 'zod';
import { addDaysIso, bucharestTodayIso } from 'src/common/utils/date-utils';
import { BookingStatus, BookingTimeSlot } from './bookings-table-types';

export const BOOKING_MAX_DAYS_AHEAD = 90;

const stripPhone = (v: unknown) =>
  typeof v === 'string' ? v.replace(/[\s.\-()]/g, '') : v;
const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const createBookingSchema = z
  .object({
    fleetId: z.uuid(),
    fullName: z.string().trim().min(3).max(100),
    phone: z
      .preprocess(
        stripPhone,
        z.string().refine((p) => /^(\+40|0)7\d{8}$/.test(p), {
          message: 'Invalid Romanian mobile number',
          params: { reason: 'phone' },
        }),
      )
      .transform((p) => (p.startsWith('0') ? `+4${p}` : p)),
    email: z.preprocess(
      emptyToUndefined,
      z
        .email()
        .max(254)
        .transform((e) => e.toLowerCase())
        .optional(),
    ),
    preferredDate: z.iso
      .date()
      .refine((d) => d >= addDaysIso(bucharestTodayIso(), 1), {
        message: 'Date must be tomorrow or later (Europe/Bucharest)',
        params: { reason: 'dateMin' },
      })
      .refine(
        (d) => d <= addDaysIso(bucharestTodayIso(), BOOKING_MAX_DAYS_AHEAD),
        {
          message: `Date must be within ${BOOKING_MAX_DAYS_AHEAD} days`,
          params: { reason: 'dateMax' },
        },
      ),
    preferredTimeSlot: z.enum(BookingTimeSlot),
    licenseCategory: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z0-9]{1,8}$/)
        .optional(),
    ),
    lessonsCount: z.number().int().min(1).max(200).optional(),
    message: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(1000).optional(),
    ),
    gdprConsent: z.literal(true, {
      error: 'Consent is required',
    }),
    website: z.string().max(0, 'Bot detected').optional(),
  })
  .strict();

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export interface CreateBookingResponseDto {
  id: string;
  status: BookingStatus;
}
