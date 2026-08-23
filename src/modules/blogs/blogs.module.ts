import { Module } from '@nestjs/common';
import { BlogsOperations } from 'src/clients';
import { BlogsUtils } from 'src/common';
import { BlogsController } from 'src/controllers';
import { BlogsService } from 'src/services';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, BlogsOperations, BlogsUtils],
})
export class BlogsModule {}
