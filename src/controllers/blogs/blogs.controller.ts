import { Controller, Get } from '@nestjs/common';
import { BlogsService } from 'src/services';

// TODO: create insert blogs script, run it, verify it works by running docker image

@Controller()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @Get('/blogs')
  async getAll() {
    return this.blogsService.getAllBlogs();
  }
}
