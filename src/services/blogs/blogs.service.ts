import { Injectable } from '@nestjs/common';
import { BlogsOperations } from 'src/clients';
import { BlogsUtils } from 'src/common';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsOperations: BlogsOperations,
    private readonly blogsUtils: BlogsUtils,
  ) {}
  async getAllBlogs() {
    const allBlogs = await this.blogsOperations.getAllBlogs();
    const blogsDto = this.blogsUtils.buildBlogsDto(allBlogs);
    return blogsDto;
  }
}
