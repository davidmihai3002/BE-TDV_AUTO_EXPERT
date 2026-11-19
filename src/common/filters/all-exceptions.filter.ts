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

/** Postgres / driver error codes → HTTP (ticket 07 §6.3). Messages are fixed: SQL and driver text never leak. */
const PG_ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  // invalid text representation: an id that slipped past validation can't match any row
  '22P02': { status: HttpStatus.NOT_FOUND, message: 'Not Found' },
  '23505': { status: HttpStatus.CONFLICT, message: 'Resource already exists' },
  '23503': { status: HttpStatus.CONFLICT, message: 'Conflict' },
  // database unavailable
  '57P01': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable',
  },
  '08006': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable',
  },
  '08001': {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable',
  },
  ECONNREFUSED: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable',
  },
};

function isPgError(e: unknown): e is { code: string; message: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as { code?: unknown }).code === 'string' &&
    /^([0-9A-Z]{5}|E[A-Z]+)$/.test((e as { code: string }).code)
  );
}

/** body-parser's error for an unparseable JSON body (surfaced by Nest as a 400 or a raw SyntaxError). */
function isMalformedJson(e: unknown): boolean {
  if (e instanceof SyntaxError && 'body' in e) return true;
  if (e instanceof HttpException && e.getStatus() === 400) {
    const cause = (e as { cause?: unknown }).cause;
    return cause instanceof SyntaxError || /JSON/.test(e.message);
  }
  return false;
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

    if (isMalformedJson(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Malformed JSON body';
    } else if (exception instanceof HttpException) {
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
    } else if (isPgError(exception) && PG_ERRORS[exception.code]) {
      ({ status, message } = PG_ERRORS[exception.code]);
      const log = Number(status) >= 500 ? 'error' : 'warn';
      this.logger[log](
        `pg ${exception.code} on ${req.method} ${req.url} [${req.id ?? '-'}]: ${exception.message}`,
      );
    } else {
      const err =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        `${req.method} ${req.url} → 500 [${req.id ?? '-'}]: ${err.message}`,
        err.stack,
      );
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
