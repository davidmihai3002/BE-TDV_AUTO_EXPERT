import {
  Global,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { destroyDb } from 'src/clients';

@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await destroyDb();
  }
}

/** Closes the pg pool on shutdown (requires app.enableShutdownHooks()). */
@Global()
@Module({ providers: [DatabaseLifecycle] })
export class DatabaseModule {}
