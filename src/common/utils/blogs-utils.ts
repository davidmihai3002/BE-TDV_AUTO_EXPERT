import { Selectable } from 'kysely';
import { BlogContent, BlogsTable } from 'src/types';

const WORDS_PER_MINUTE = 250;

export class BlogsUtils {
  getBlogReadTimeInMinutes(blogContent: BlogContent) {
    const blogWordCount = blogContent.blocks.reduce(
      (sum, block) => sum + block.body.length,
      0,
    );
    const totalReadMinutes = (blogWordCount / WORDS_PER_MINUTE).toFixed();
    return totalReadMinutes;
  }
  buildBlogsDto(blogs: Selectable<BlogsTable>[]) {
    return blogs.map((blog) => ({
      ...blog,
      readTimeInMinutes: this.getBlogReadTimeInMinutes(blog.content),
    }));
  }
}
