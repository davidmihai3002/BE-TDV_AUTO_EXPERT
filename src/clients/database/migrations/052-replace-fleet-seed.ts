import { Kysely, sql } from 'kysely';

const PLACEHOLDER_SLUGS = [
  'toyota-corolla-hybrid',
  'volkswagen-golf',
  'skoda-octavia',
  'renault-zoe',
];

const INSTRUCTORS = [
  { full_name: 'Andrei Ionescu', phone_number: '+40721555101' },
  { full_name: 'Mihai Popescu', phone_number: '+40722555202' },
  { full_name: 'Elena Dumitrescu', phone_number: '+40723555303' },
  { full_name: 'Ioana Marinescu', phone_number: '+40724555404' },
];

interface SeedCar {
  display_order: number;
  slug: string;
  car_name: string;
  series: string | null;
  category: 'beginner' | 'fundamentals' | 'advanced' | 'mastery';
  badge_label: string | null;
  transmission: 'manual' | 'automatic';
  transmission_label: string | null;
  fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  body_type: 'compact' | 'hatchback' | 'sedan' | 'coupe' | 'suv';
  horsepower: number | null;
  zero_to_hundred_seconds: number | null;
  image_url: string;
  image_alt: string;
  success_rate: number | null;
  average_grade: number | null;
  instructor_phone: string;
}

const CARS: SeedCar[] = [
  {
    display_order: 10,
    slug: 'audi-r8-lms',
    car_name: 'Audi R8 LMS',
    series: 'Seria Precizie',
    category: 'mastery',
    badge_label: null,
    transmission: 'automatic',
    transmission_label: 'Automată, dublu ambreiaj',
    fuel: 'petrol',
    body_type: 'coupe',
    horsepower: 602,
    zero_to_hundred_seconds: 3.2,
    image_url: '/images/fleet/audi-r8-lms.webp',
    image_alt:
      'Mașina de școală Audi R8 LMS, văzută din față, din unghi lateral',
    success_rate: 96.0,
    average_grade: 9.4,
    instructor_phone: '+40721555101',
  },
  {
    display_order: 20,
    slug: 'volkswagen-golf-r',
    car_name: 'Volkswagen Golf R',
    series: 'Seria Măiestrie',
    category: 'advanced',
    badge_label: null,
    transmission: 'manual',
    transmission_label: 'Manuală, 6 trepte',
    fuel: 'petrol',
    body_type: 'hatchback',
    horsepower: 315,
    zero_to_hundred_seconds: 4.7,
    image_url: '/images/fleet/volkswagen-golf-r.webp',
    image_alt:
      'Volkswagen Golf R gri închis, parcat pe o stradă udă din oraș, noaptea',
    success_rate: 93.5,
    average_grade: 9.0,
    instructor_phone: '+40722555202',
  },
  {
    display_order: 30,
    slug: 'honda-civic-si',
    car_name: 'Honda Civic Si',
    series: 'Seria Fundamente',
    category: 'fundamentals',
    badge_label: null,
    transmission: 'automatic',
    transmission_label: 'Automată CVT',
    fuel: 'petrol',
    body_type: 'sedan',
    horsepower: 200,
    zero_to_hundred_seconds: 6.8,
    image_url: '/images/fleet/honda-civic-si.webp',
    image_alt: 'Sedan Honda Civic Si alb pe un fundal gri închis',
    success_rate: 91.7,
    average_grade: 8.8,
    instructor_phone: '+40723555303',
  },
  {
    display_order: 40,
    slug: 'vw-golf-8',
    car_name: 'VW Golf 8',
    series: null,
    category: 'beginner',
    badge_label: 'Pentru începători',
    transmission: 'automatic',
    transmission_label: null,
    fuel: 'petrol',
    body_type: 'compact',
    horsepower: null,
    zero_to_hundred_seconds: null,
    image_url: '/images/fleet/vw-golf-8.webp',
    image_alt:
      'VW Golf 8 compact, de culoare închisă, în fața unui centru de pregătire, la apus',
    success_rate: 94.2,
    average_grade: 9.1,
    instructor_phone: '+40721555101',
  },
  {
    display_order: 50,
    slug: 'audi-a4-s-line',
    car_name: 'Audi A4 S-Line',
    series: null,
    category: 'advanced',
    badge_label: null,
    transmission: 'manual',
    transmission_label: null,
    fuel: 'petrol',
    body_type: 'sedan',
    horsepower: null,
    zero_to_hundred_seconds: null,
    image_url: '/images/fleet/audi-a4-s-line.webp',
    image_alt:
      'Sedan Audi A4 S-Line albastru metalizat închis, într-un garaj puternic luminat',
    success_rate: 89.5,
    average_grade: 8.6,
    instructor_phone: '+40723555303',
  },
  {
    display_order: 60,
    slug: 'tesla-model-3',
    car_name: 'Tesla Model 3',
    series: null,
    category: 'mastery',
    badge_label: 'Masterclass EV',
    transmission: 'automatic',
    transmission_label: null,
    fuel: 'electric',
    body_type: 'sedan',
    horsepower: null,
    zero_to_hundred_seconds: null,
    image_url: '/images/fleet/tesla-model-3.webp',
    image_alt: 'Tesla Model 3 la încărcat, într-o stație de încărcare, noaptea',
    success_rate: 95.1,
    average_grade: 9.3,
    instructor_phone: '+40724555404',
  },
];

const PLACEHOLDERS = [
  {
    slug: 'toyota-corolla-hybrid',
    car_name: 'Toyota Corolla Hybrid',
    transmission: 'automatic',
    fuel: 'hybrid',
    image_url: 'https://images.example.com/fleet/toyota-corolla-hybrid.jpg',
    success_rate: 94.2,
    average_grade: 9.1,
    instructor_phone: '+40721555101',
  },
  {
    slug: 'volkswagen-golf',
    car_name: 'Volkswagen Golf',
    transmission: 'manual',
    fuel: 'petrol',
    image_url: 'https://images.example.com/fleet/volkswagen-golf.jpg',
    success_rate: 91.7,
    average_grade: 8.8,
    instructor_phone: '+40722555202',
  },
  {
    slug: 'skoda-octavia',
    car_name: 'Skoda Octavia',
    transmission: 'manual',
    fuel: 'diesel',
    image_url: 'https://images.example.com/fleet/skoda-octavia.jpg',
    success_rate: 89.5,
    average_grade: 8.6,
    instructor_phone: '+40723555303',
  },
  {
    slug: 'renault-zoe',
    car_name: 'Renault Zoe',
    transmission: 'automatic',
    fuel: 'electric',
    image_url: 'https://images.example.com/fleet/renault-zoe.jpg',
    success_rate: 95.1,
    average_grade: 9.3,
    instructor_phone: '+40724555404',
  },
];

const instructorIdByPhone = (phone: string) =>
  sql<string>`(SELECT id FROM instructors WHERE phone_number = ${phone})`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('fleet').where('slug', 'in', PLACEHOLDER_SLUGS).execute();

  await db
    .insertInto('instructors')
    .values(INSTRUCTORS)
    .onConflict((oc) =>
      oc
        .column('phone_number')
        .doUpdateSet({ full_name: sql`excluded.full_name` }),
    )
    .execute();

  await db
    .insertInto('fleet')
    .values(
      CARS.map(({ instructor_phone, ...car }) => ({
        ...car,
        instructor_id: instructorIdByPhone(instructor_phone),
      })),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('fleet')
    .where(
      'slug',
      'in',
      CARS.map((c) => c.slug),
    )
    .execute();

  await db
    .insertInto('fleet')
    .values(
      PLACEHOLDERS.map(({ instructor_phone, ...car }) => ({
        ...car,
        category: 'fundamentals',
        instructor_id: instructorIdByPhone(instructor_phone),
      })),
    )
    .execute();
}
