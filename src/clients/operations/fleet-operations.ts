import { db } from '..';

export class FleetOperations {
  async getAllFleet() {
    return db.selectFrom('fleet').selectAll().execute();
  }
}
