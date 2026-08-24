import { Kysely } from 'kysely';

const fleetCarNames: string[] = [
  'Toyota Corolla Hybrid',
  'Volkswagen Golf',
  'Skoda Octavia',
  'Renault Zoe',
];

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('fleet')
    .values([
      {
        carName: 'Toyota Corolla Hybrid',
        transmission: 'automatic',
        fuel: 'hybrid',
        imageURL: 'https://images.example.com/fleet/toyota-corolla-hybrid.jpg',
        successRate: 94.2,
        averageGrade: 9.1,
        instructorName: 'Andrei Ionescu',
        instructorPhoneNumber: '+40 721 555 101',
      },
      {
        carName: 'Volkswagen Golf',
        transmission: 'manual',
        fuel: 'petrol',
        imageURL: 'https://images.example.com/fleet/volkswagen-golf.jpg',
        successRate: 91.7,
        averageGrade: 8.8,
        instructorName: 'Mihai Popescu',
        instructorPhoneNumber: '+40 722 555 202',
      },
      {
        carName: 'Skoda Octavia',
        transmission: 'manual',
        fuel: 'diesel',
        imageURL: 'https://images.example.com/fleet/skoda-octavia.jpg',
        successRate: 89.5,
        averageGrade: 8.6,
        instructorName: 'Elena Dumitrescu',
        instructorPhoneNumber: '+40 723 555 303',
      },
      {
        carName: 'Renault Zoe',
        transmission: 'automatic',
        fuel: 'electric',
        imageURL: 'https://images.example.com/fleet/renault-zoe.jpg',
        successRate: 95.1,
        averageGrade: 9.3,
        instructorName: 'Ioana Marinescu',
        instructorPhoneNumber: '+40 724 555 404',
      },
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('fleet').where('carName', 'in', fleetCarNames).execute();
}
