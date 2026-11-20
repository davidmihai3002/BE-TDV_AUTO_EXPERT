import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { ApiIssue } from 'src/types';

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
