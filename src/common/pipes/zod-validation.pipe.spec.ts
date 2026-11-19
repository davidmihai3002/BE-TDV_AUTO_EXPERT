import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
  page: z.coerce.number().int().min(1),
  phone: z
    .string()
    .refine((v) => /^07\d{8}$/.test(v), { params: { reason: 'phone' } }),
});

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(schema);

  it('returns parsed data on success', () => {
    expect(pipe.transform({ page: '2', phone: '0712345678' })).toEqual({
      page: 2,
      phone: '0712345678',
    });
  });

  it('throws 400 with issues (path, code, English message, reason)', () => {
    try {
      pipe.transform({ page: '0', phone: 'x' });
      fail('expected to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const body = (e as BadRequestException).getResponse() as {
        statusCode: number;
        message: string;
        issues: {
          path: string;
          code: string;
          message: string;
          reason?: string;
        }[];
      };
      expect(body.statusCode).toBe(400);
      expect(body.message).toBe('Validation failed');
      const page = body.issues.find((i) => i.path === 'page');
      const phone = body.issues.find((i) => i.path === 'phone');
      expect(page).toMatchObject({ code: 'too_small' });
      expect(page?.message).toEqual(expect.any(String));
      expect(page?.reason).toBeUndefined();
      expect(phone).toMatchObject({ code: 'custom', reason: 'phone' });
    }
  });
});
