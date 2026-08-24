import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule, FleetModule } from './modules';

@Module({
  imports: [BlogsModule, FleetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
