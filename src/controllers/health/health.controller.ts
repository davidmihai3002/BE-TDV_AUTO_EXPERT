import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from 'src/services';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('/health')
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const health = await this.healthService.check();
    res.status(
      health.db === 'up' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    );
    res.setHeader('Cache-Control', 'no-store');
    return health;
  }
}
