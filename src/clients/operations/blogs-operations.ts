import { db } from '..';

export class BlogsOperations {
  async getAllBlogs() {
    return db.selectFrom('blogs').selectAll().execute();
  }
}
