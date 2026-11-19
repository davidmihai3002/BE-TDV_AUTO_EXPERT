import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** x-request-id (set by RequestLoggerMiddleware) */
    id: string;
  }
}
