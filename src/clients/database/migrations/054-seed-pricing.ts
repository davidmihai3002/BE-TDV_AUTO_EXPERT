import { Kysely } from 'kysely';

const CATEGORY_B = {
  code: 'B',
  name: 'Categoria B – Autoturism',
  short_name: 'Categoria B (Auto)',
  description: 'Permis standard pentru autoturisme și autoutilitare ușoare.',
  badge_label: 'Standard',
  icon: 'directions_car',
  sort_order: 0,
};

const SETTINGS = {
  id: 1,
  currency: 'RON',
  vat_included: true,
  processing_fee: '25.00',
  processing_fee_label: 'Taxă de procesare',
  min_lessons: 15,
  max_lessons: 60,
  default_lessons: 15,
  lesson_step: 1,
};

const RATE_BY_TRANSMISSION: Record<string, string> = {
  manual: '35.00',
  automatic: '38.00',
};
const SLUGS = [
  'volkswagen-golf-r',
  'audi-a4-s-line',
  'audi-r8-lms',
  'honda-civic-si',
  'vw-golf-8',
  'tesla-model-3',
];

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('license_categories')
    .values(CATEGORY_B)
    .onConflict((oc) => oc.column('code').doNothing())
    .execute();
  await db
    .insertInto('pricing_settings')
    .values(SETTINGS)
    .onConflict((oc) => oc.column('id').doNothing())
    .execute();

  const cat = await db
    .selectFrom('license_categories')
    .select('id')
    .where('code', '=', 'B')
    .$castTo<{ id: string }>()
    .executeTakeFirstOrThrow();
  const cars = await db
    .selectFrom('fleet')
    .select(['id', 'slug', 'transmission'])
    .where('slug', 'in', SLUGS)
    .$castTo<{ id: string; slug: string; transmission: string }>()
    .execute();
  if (cars.length !== SLUGS.length) {
    const missing = SLUGS.filter((s) => !cars.some((c) => c.slug === s));
    throw new Error(
      `054-seed-pricing: expected the 6 fleet cars from 06 (052); missing: ${missing.join(', ')}`,
    );
  }
  await db
    .insertInto('pricing_vehicle_rates')
    .values(
      cars.map((c) => ({
        fleet_id: c.id,
        license_category_id: cat.id,
        lesson_price: RATE_BY_TRANSMISSION[c.transmission],
        currency: 'RON',
      })),
    )
    .onConflict((oc) =>
      oc.columns(['fleet_id', 'license_category_id']).doNothing(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('pricing_vehicle_rates')
    .where(
      'license_category_id',
      'in',
      db.selectFrom('license_categories').select('id').where('code', '=', 'B'),
    )
    .where(
      'fleet_id',
      'in',
      db.selectFrom('fleet').select('id').where('slug', 'in', SLUGS),
    )
    .execute();
  await db.deleteFrom('pricing_settings').where('id', '=', 1).execute();
  await db.deleteFrom('license_categories').where('code', '=', 'B').execute();
}
