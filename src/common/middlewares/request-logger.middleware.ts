import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const INCOMING_ID = /^[\w-]{8,64}$/;

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    req.id = incoming && INCOMING_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader('x-request-id', req.id);

    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      const ua = (req.header('user-agent') ?? '').slice(0, 120);
      const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms - ${req.id}  ua="${ua}"`;
      if (req.method === 'OPTIONS') this.logger.verbose(line);
      else if (res.statusCode >= 500) this.logger.error(line);
      else if (res.statusCode >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });
    next();
  }
}
