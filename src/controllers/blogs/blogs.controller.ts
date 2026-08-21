import { Controller, Get } from '@nestjs/common';
import { BlogsService } from 'src/services';

@Controller()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @Get('/blogs')
  async getAll() {
    return this.blogsService.getAllBlogs();
  }
}
