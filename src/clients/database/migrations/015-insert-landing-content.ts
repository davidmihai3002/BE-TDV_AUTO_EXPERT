import { Kysely } from 'kysely';

const SECTIONS: Record<string, unknown>[] = [
  {
    key: 'hero',
    eyebrow: 'Instruire premium',
    eyebrow_icon: 'verified',
    title: 'Stăpânește volanul cu ',
    title_highlight: 'TDV Auto Expert',
    title_suffix: '.',
    subtitle:
      'Lecții de condus profesioniste, gândite pentru precizie, siguranță și promovarea examenului din prima. Devino un șofer sigur pe tine, alături de instructori cu experiență.',
    primary_cta_label: 'Programează o lecție',
    primary_cta_href: '/flota',
    secondary_cta_label: 'Nu ești sigur? Calculează prețul',
    secondary_cta_href: '/preturi',
    secondary_cta_icon: 'calculate',
    image_url: '/images/landing/hero-fleet.webp',
    image_alt: 'Mașină de școală și SUV moderne, cu dublă comandă',
    image_alt_mobile: 'Flota modernă de școlarizare TDV Auto Expert',
    extra: {
      telemetryLabel: 'Mașini cu dublă comandă disponibile',
      telemetryStatus: 'Înscrieri deschise',
    },
  },
  {
    key: 'advantage',
    eyebrow: 'Metodologie',
    eyebrow_icon: 'psychology',
    title: 'De ce TDV Auto Expert',
    subtitle:
      'Nu te învățăm doar să treci examenul. Formăm șoferi siguri și încrezători, prin tehnică precisă și reguli stricte de siguranță.',
  },
  {
    key: 'fleet',
    eyebrow: 'Mașini cu dublă comandă',
    eyebrow_icon: null,
    title: 'Cunoaște flota',
    subtitle:
      'Înveți pe mașini moderne, cu dublă comandă și cele mai noi sisteme de siguranță.',
    primary_cta_label: 'Vezi toate mașinile',
    primary_cta_href: '/flota',
  },
  {
    key: 'insights',
    eyebrow: 'Resurse utile',
    eyebrow_icon: 'menu_book',
    title: 'Din blog',
    subtitle:
      'Sfaturi practice și ghiduri de condus de la instructorii noștri.',
    primary_cta_label: 'Vezi toate articolele',
    primary_cta_href: '/blog',
  },
  {
    key: 'faq',
    eyebrow: 'Întrebări',
    eyebrow_icon: 'help',
    title: 'Întrebări frecvente',
    subtitle:
      'Tot ce trebuie să știi înainte să te înscrii la școala de șoferi.',
  },
  {
    key: 'cta',
    eyebrow: null,
    eyebrow_icon: 'sports_score',
    title: 'Ești gata să urci la volan?',
    subtitle:
      'Alătură-te celor peste 5.000 de absolvenți care au obținut permisul cu noi. Programează azi prima lecție cu un instructor autorizat.',
    primary_cta_label: 'Programează o lecție',
    primary_cta_href: '/flota',
    show_on_desktop: true,
  },
];

const STATS = [
  {
    sort_order: 1,
    value: '95',
    suffix: '%',
    short_suffix: null,
    label: 'Promovabilitate din prima',
    short_label: null,
    accent: 'primary',
    accent_mobile: 'primary',
  },
  {
    sort_order: 2,
    value: '5.000',
    suffix: '+',
    short_suffix: null,
    label: 'Cursanți pregătiți',
    short_label: null,
    accent: 'secondary',
    accent_mobile: 'secondary',
  },
  {
    sort_order: 3,
    value: '15',
    suffix: '+',
    short_suffix: null,
    label: 'Instructori autorizați',
    short_label: null,
    accent: 'tertiary',
    accent_mobile: 'secondary',
  },
  {
    sort_order: 4,
    value: '10',
    suffix: null,
    short_suffix: 'ani',
    label: 'Ani de experiență',
    short_label: 'Experiență',
    accent: 'primary',
    accent_mobile: 'primary',
  },
];

const FEATURES = [
  {
    sort_order: 1,
    title: 'Precizie tehnică',
    description:
      'Înveți să stăpânești mașina, să execuți manevre precise și să te orientezi sigur în traficul aglomerat din oraș.',
    tags: ['Feedback în timp real', 'Trafic urban'],
    icon: 'speed',
    icon_mobile: 'tune',
    accent: 'secondary',
  },
  {
    sort_order: 2,
    title: 'Siguranță pe primul loc',
    description:
      'Exersezi tehnici de condus defensiv și reacții în situații de urgență, ca să știi ce ai de făcut în orice context.',
    tags: ['Anticiparea pericolelor', 'Frânare de urgență'],
    icon: 'health_and_safety',
    icon_mobile: 'shield',
    accent: 'tertiary',
  },
  {
    sort_order: 3,
    title: 'Promovare din prima',
    description:
      'Simulări de examen pe traseele folosite la proba practică și respectarea strictă a baremului, ca să ajungi la examen mai mult decât pregătit.',
    tags: ['Simulări pe traseu', 'Baremul de examinare'],
    icon: 'model_training',
    icon_mobile: 'military_tech',
    accent: 'primary',
  },
];

const FLEET_HIGHLIGHTS = [
  {
    sort_order: 1,
    slug: 'compacte-si-sedanuri',
    body_types: ['compact', 'hatchback', 'sedan'],
    name: 'Compacte și sedanuri',
    tagline: 'Ideale pentru condusul în oraș',
    description:
      'Perfecte pentru manevrele din oraș, controlul fin al ambreiajului și parcarea laterală fără emoții.',
    image_url: '/images/landing/fleet-compact-sedan.webp',
    image_alt:
      'Mașină de școală compactă, albă, cu sigla TDV Auto Expert, parcată noaptea într-o parcare urbană iluminată',
    highlight_icon: 'sensors',
    highlight_label: 'Cameră 360°',
    specs: [
      {
        icon: 'speed',
        label: 'Răspuns precis',
        accent: 'secondary',
      },
      {
        icon: 'sports_score',
        label: 'Dublă comandă',
        accent: 'primary',
      },
    ],
  },
  {
    sort_order: 2,
    slug: 'suv-uri',
    body_types: ['suv'],
    name: 'SUV-uri compacte',
    tagline: 'Vizibilitate și control superioare',
    description:
      'Poziție de condus înaltă și control sporit, cu frânare automată de urgență și monitorizarea unghiului mort.',
    image_url: '/images/landing/fleet-compact-suv.webp',
    image_alt:
      'SUV compact gri închis, mașină de școală, pe o pistă de antrenament, în lumină de studio',
    highlight_icon: 'visibility',
    highlight_label: 'Vizibilitate sporită',
    specs: [
      {
        icon: 'health_and_safety',
        label: 'ADAS nivel 2',
        accent: 'secondary',
      },
      {
        icon: 'sports_score',
        label: 'Dublă comandă',
        accent: 'primary',
      },
    ],
  },
];

const FAQS = [
  {
    sort_order: 1,
    question: 'Ce vârstă trebuie să am ca să mă înscriu?',
    answer:
      'Pentru categoria B poți începe cursurile înainte de 18 ani, dar examenul îl susții doar după ce împlinești 18 ani. Te ajutăm să-ți planifici înscrierea astfel încât să fii gata de examen imediat după ziua ta.',
  },
  {
    sort_order: 2,
    question: 'Ce acte îmi trebuie pentru înscriere?',
    answer:
      'Ai nevoie de cartea de identitate, avizul medical (fișa medicală „apt pentru conducere auto”) și avizul psihologic. După finalizarea cursurilor primești fișa de școlarizare, cu care te programezi la examen.',
  },
  {
    sort_order: 3,
    question: 'Câte ore de pregătire sunt obligatorii?',
    answer:
      'Pentru categoria B, legea prevede un număr minim de ore de legislație rutieră și cel puțin 30 de ore de conducere practică. Dacă simți nevoia, poți face oricând ore suplimentare înainte de examen.',
  },
  {
    sort_order: 4,
    question: 'Cum se desfășoară examenul auto?',
    answer:
      'Examenul are două etape, susținute la serviciul de permise auto (DRPCIV): proba teoretică, un chestionar pe calculator despre Codul rutier, și proba practică, în trafic, cu un examinator. Proba practică se susține doar după promovarea celei teoretice.',
  },
  {
    sort_order: 5,
    question: 'Pot susține proba practică cu mașina școlii?',
    answer:
      'Da. Toate mașinile din flota noastră au dublă comandă și le poți folosi la proba practică, alături de instructorul tău.',
  },
  {
    sort_order: 6,
    question: 'Pot alege între cutie manuală și cutie automată?',
    answer:
      'Da, poți face lecțiile pe oricare dintre ele și poți schimba pe parcurs. Reține: dacă susții examenul pe o mașină cu cutie automată, permisul va avea codul 78 și vei putea conduce doar mașini automate.',
  },
];

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('landing_sections')
    .values(
      SECTIONS.map((s) => ({ ...s, extra: JSON.stringify(s.extra ?? {}) })),
    )
    .onConflict((oc) => oc.column('key').doNothing())
    .execute();
  await db.insertInto('landing_stats').values(STATS).execute();
  await db.insertInto('landing_features').values(FEATURES).execute();
  await db
    .insertInto('landing_fleet_highlights')
    .values(
      FLEET_HIGHLIGHTS.map((h) => ({ ...h, specs: JSON.stringify(h.specs) })),
    )
    .onConflict((oc) => oc.column('slug').doNothing())
    .execute();
  await db
    .insertInto('faqs')
    .values(FAQS.map((f) => ({ ...f, page: 'landing' })))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('faqs')
    .where(
      'question',
      'in',
      FAQS.map((f) => f.question),
    )
    .execute();
  await db
    .deleteFrom('landing_fleet_highlights')
    .where(
      'slug',
      'in',
      FLEET_HIGHLIGHTS.map((h) => h.slug),
    )
    .execute();
  await db
    .deleteFrom('landing_features')
    .where(
      'title',
      'in',
      FEATURES.map((f) => f.title),
    )
    .execute();
  await db
    .deleteFrom('landing_stats')
    .where(
      'label',
      'in',
      STATS.map((s) => s.label),
    )
    .execute();
  await db
    .deleteFrom('landing_sections')
    .where(
      'key',
      'in',
      SECTIONS.map((s) => s.key as string),
    )
    .execute();
}
