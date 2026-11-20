import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('site_settings')
    .values({
      id: 1,
      brand_name: 'TDV Auto Expert',
      tagline: 'Precizie la volan.',
      footer_description:
        'Precizie la volan. Pregătim noua generație de șoferi cu abilitățile, încrederea și cunoștințele tehnice necesare pentru a conduce în siguranță pe orice drum.',
      copyright_text: 'TDV Auto Expert. Toate drepturile rezervate.',
      contact_phone: '+40 700 000 000',
      contact_email: 'contact@tdvautoexpert.ro',
      contact_address: 'Str. Exemplu nr. 1, București',
      contact_schedule: 'Luni – Vineri: 08:00 – 20:00, Sâmbătă: 09:00 – 14:00',
      currency: 'RON',
      privacy_url: null,
      terms_url: null,
      socials: JSON.stringify([
        { platform: 'facebook', url: 'https://facebook.com/tdvautoexpert' },
        { platform: 'instagram', url: 'https://instagram.com/tdvautoexpert' },
      ]),
    })
    .onConflict((oc) => oc.column('id').doNothing())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('site_settings').where('id', '=', 1).execute();
}
