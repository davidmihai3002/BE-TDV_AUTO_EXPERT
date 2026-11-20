import { Kysely } from 'kysely';

const RENAMES: [from: string, to: string][] = [
  ['carName', 'car_name'],
  ['imageURL', 'image_url'],
  ['successRate', 'success_rate'],
  ['averageGrade', 'average_grade'],
  ['instructorName', 'instructor_name'],
  ['instructorPhoneNumber', 'instructor_phone_number'],
];

export async function up(db: Kysely<any>): Promise<void> {
  for (const [from, to] of RENAMES) {
    await db.schema.alterTable('fleet').renameColumn(from, to).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const [from, to] of RENAMES) {
    await db.schema.alterTable('fleet').renameColumn(to, from).execute();
  }
}
