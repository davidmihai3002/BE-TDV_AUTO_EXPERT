import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiErrorBody, ApiIssue } from 'src/types';

const PG_STATUS: Record<string, HttpStatus> = {
  '22P02': HttpStatus.BAD_REQUEST, // invalid text representation (e.g. malformed uuid)
  '23505': HttpStatus.CONFLICT, // unique violation
  '23503': HttpStatus.CONFLICT, // foreign key violation
};

function isPgError(e: unknown): e is { code: string; message: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as { code?: unknown }).code === 'string' &&
    /^[0-9A-Z]{5}$/.test((e as { code: string }).code)
  );
}

/** Normalises every error to `{ statusCode, message, error, path, timestamp, issues? }`. Never leaks SQL or stacks. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let issues: ApiIssue[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as { message?: unknown; issues?: ApiIssue[] };
        message = Array.isArray(b.message)
          ? b.message.join('; ')
          : typeof b.message === 'string'
            ? b.message
            : exception.message;
        issues = b.issues;
      }
    } else if (isPgError(exception) && PG_STATUS[exception.code]) {
      status = PG_STATUS[exception.code];
      message =
        status === HttpStatus.BAD_REQUEST ? 'Invalid input' : 'Conflict';
      this.logger.warn(
        `pg ${exception.code} on ${req.method} ${req.url}: ${exception.message}`,
      );
    } else {
      const err =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(`${req.method} ${req.url}: ${err.message}`, err.stack);
    }

    const payload: ApiErrorBody = {
      statusCode: status,
      message,
      error: (HttpStatus[status] ?? 'Error')
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      path: req.url,
      timestamp: new Date().toISOString(),
      ...(issues ? { issues } : {}),
    };

    res.status(status).json(payload);
  }
}
