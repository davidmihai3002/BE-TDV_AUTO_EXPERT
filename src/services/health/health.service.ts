import { Injectable } from '@nestjs/common';
import { HealthOperations } from 'src/clients';

const DB_TIMEOUT_MS = 2000;

export interface HealthStatus {
  status: 'ok' | 'error';
  db: 'up' | 'down';
  uptimeSeconds: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly healthOperations: HealthOperations) {}

  async check(): Promise<HealthStatus> {
    let dbUp = false;
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.healthOperations.ping(),
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('DB ping timeout')),
            DB_TIMEOUT_MS,
          );
        }),
      ]);
      dbUp = true;
    } catch {
      dbUp = false;
    } finally {
      clearTimeout(timer);
    }
    return {
      status: dbUp ? 'ok' : 'error',
      db: dbUp ? 'up' : 'down',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
