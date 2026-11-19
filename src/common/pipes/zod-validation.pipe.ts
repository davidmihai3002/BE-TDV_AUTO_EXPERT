import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { ApiIssue } from 'src/types';

/**
 * Validates and parses @Query / @Param / @Body input with a zod schema.
 * Issue `message`s stay English (developer-facing); the FE maps `reason` / `code` to Romanian copy.
 * Custom refinements can set `params: { reason: 'phone' | 'dateMin' | ... }`, forwarded as `issues[].reason`.
 *
 * Usage: @Query(new ZodValidationPipe(schema)) query: z.infer<typeof schema>
 */
@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const issues: ApiIssue[] = result.error.issues.map((issue) => {
        const reason =
          issue.code === 'custom' && typeof issue.params?.reason === 'string'
            ? issue.params.reason
            : undefined;
        return {
          path: issue.path.join('.'),
          code: issue.code,
          message: issue.message,
          ...(reason ? { reason } : {}),
        };
      });
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        issues,
      });
    }
    return result.data;
  }
}
