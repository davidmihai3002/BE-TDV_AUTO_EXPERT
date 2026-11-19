import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common';

const DEFAULT_CORS_ORIGINS = 'http://localhost:5173';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind a reverse proxy the throttler must key on the client IP, not the proxy's.
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    // POST for 03's POST /pricing/quote and 06's POST /bookings
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
