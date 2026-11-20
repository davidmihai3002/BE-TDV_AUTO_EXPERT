import { Kysely, sql } from 'kysely';
import { BLOGS_SEED } from '../seeds/blogs-seed-data';

const AUTHOR = {
  slug: 'marcus-vance',
  name: 'Marcus Vance',
  role: 'Instructor tehnic principal',
  avatar_url: '/images/authors/marcus-vance.jpg',
  avatar_alt: 'Marcus Vance, instructor tehnic principal',
  bio: 'Marcus coordonează programele avansate și zilele pe circuit ale TDV Auto Expert, unde îi pregătește pe cursanți în dinamica autovehiculului, tehnica de frânare și alegerea traiectoriei.',
};

const TAGS = [
  {
    slug: 'avansat',
    name: 'Avansat',
  },
  {
    slug: 'tehnica',
    name: 'Tehnică',
  },
  {
    slug: 'franare',
    name: 'Frânare',
  },
  {
    slug: 'viraje',
    name: 'Viraje',
  },
];

interface SnapshotBlock {
  type: string;
  id: string;
  text?: string;
  title?: string | null;
  caption?: string | null;
  items?: (string | { title: string; text: string })[];
  [key: string]: unknown;
}

interface SeedBlog {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  publishedAt: string;
  tags: string[];
  content: { version: 2; blocks: SnapshotBlock[] };
  seoTitle?: string;
  seoDescription?: string;
}

const MAIN: SeedBlog & { images: Record<string, unknown>[] } = {
  slug: 'dinamica-avansata-in-viraje',
  title: 'Dinamica avansată în viraje: fizica întâlnește precizia pe circuit',
  excerpt:
    'Viteza se naște din stabilitate. Află cum cercul de aderență, transferul de greutate, frânarea în viraj și disciplina accelerației te ajută să treci mai repede prin fiecare viraj.',
  categorySlug: 'maiestrie-tehnica',
  image: '/images/blogs/dinamica-avansata-in-viraje/cover.jpg',
  imageWidth: 512,
  imageHeight: 286,
  imageAlt:
    'Mașină sport de culoare închisă, de înaltă performanță, care virează cu viteză pe un circuit la apus, cu fundalul estompat de mișcare.',
  seoTitle: 'Dinamica avansată în viraje: fizică și precizie',
  seoDescription:
    'Cercul de aderență, transferul de greutate, frânarea în viraj și accelerația dozată, explicate de instructorul principal TDV Auto Expert.',
  publishedAt: '2024-11-12T09:00:00Z',
  tags: ['avansat', 'tehnica', 'viraje', 'franare'],
  content: {
    version: 2,
    blocks: [
      {
        type: 'paragraph',
        id: 'introducere',
        variant: 'lead',
        text: 'Să stăpânești un viraj nu înseamnă doar să rotești volanul; este o negociere complexă cu legile fizicii. Piloții de elită știu că viteza se naște din stabilitate, iar stabilitatea depinde de cât de bine gestionezi distribuția dinamică a greutății mașinii. În acest modul analizăm fazele critice ale virajului, ca să-ți duci performanța pe circuit la nivelul următor.',
      },
      {
        type: 'heading',
        id: 'fizica-aderentei',
        level: 2,
        text: 'Fizica aderenței',
        iconName: 'speed',
      },
      {
        type: 'paragraph',
        id: 'fizica-aderentei-p1',
        variant: 'body',
        text: 'Cercul de aderență stabilește limita absolută de aderență pe care o are un pneu în orice moment. Un pneu poate oferi 100% din aderența sa fie pentru viraj (accelerație laterală), fie pentru accelerare sau frânare (accelerație longitudinală). Combinarea celor două presupune un compromis.',
      },
      {
        type: 'checklist',
        id: 'principiu-cercul-aderentei',
        title: 'Principiu de bază: cercul de aderență',
        watermarkIconName: 'analytics',
        items: [
          'Frânarea maximă folosește 100% din aderența longitudinală și lasă 0% pentru viraj.',
          'Frânarea în viraj face tranziția treptat: eliberezi frâna ca să faci loc aderenței necesare pentru virare.',
        ],
      },
      {
        type: 'callout',
        id: 'observatie-aderenta',
        variant: 'insight',
        title: 'Observația expertului',
        iconName: 'lightbulb',
        text: 'Dacă folosești 100% din aderența pneului pentru frânare, îți rămâne 0% pentru virare. Tranziția trebuie să fie perfect fluidă.',
      },
      {
        type: 'heading',
        id: 'transferul-de-greutate',
        level: 2,
        text: 'Mecanica transferului de greutate',
        iconName: 'balance',
      },
      {
        type: 'figure',
        id: 'fig-transfer-greutate',
        imageKey: 'diagrama-transfer-greutate',
        caption:
          'Fig. 1.1: Deplasarea dinamică a sarcinii în faza de frânare în viraj.',
      },
      {
        type: 'paragraph',
        id: 'transferul-de-greutate-p1',
        variant: 'body',
        text: 'Centrul de greutate al unei mașini nu este static; se deplasează brusc sub sarcină. Frânarea mută greutatea în față, mărește suprafața de contact a pneurilor din față și îți oferă control maxim asupra direcției. Accelerarea o mută în spate și așază roțile din spate pentru tracțiune la ieșirea din apex.',
      },
      {
        type: 'heading',
        id: 'franarea-in-viraj',
        level: 2,
        text: 'Frânarea în viraj, pe înțeles',
        iconName: 'trending_down',
      },
      {
        type: 'paragraph',
        id: 'franarea-in-viraj-p1',
        variant: 'body',
        text: 'Frânarea în viraj (trail braking) este tehnica prin care reduci treptat presiunea pe frână pe măsură ce intri în viraj. Menține aderența pe puntea față și ajută mașina să se rotească, ceea ce permite viteze de intrare mai mari.',
      },
      {
        type: 'steps',
        id: 'pasi-franare-in-viraj',
        items: [
          {
            title: 'Apăsarea inițială',
            text: 'Presiune fermă, în linie dreaptă, ca să reduci viteza eficient.',
          },
          {
            title: 'Tranziția',
            text: 'Pe măsură ce unghiul de bracaj crește, presiunea pe frână trebuie să scadă proporțional.',
          },
        ],
      },
      {
        type: 'heading',
        id: 'disciplina-acceleratiei',
        level: 2,
        text: 'Disciplina accelerației',
        iconName: 'settings_input_component',
      },
      {
        type: 'paragraph',
        id: 'disciplina-acceleratiei-p1',
        variant: 'body',
        text: 'Răbdarea este semnul unui maestru. Pedala de accelerație nu este un întrerupător pornit/oprit; este un reostat care dictează aderența punții spate și traiectoria de ieșire. Dacă accelerezi înainte de apex, muți prea devreme greutatea în spate, provoci subvirare și lărgești linia de ieșire.',
      },
      {
        type: 'callout',
        id: 'sfat-acceleratie',
        variant: 'tip',
        title: 'Sfatul expertului',
        iconName: 'warning',
        quote: true,
        text: 'Așteaptă ca mașina să se rotească. Nu atinge accelerația până nu poți începe să îndrepți volanul. Pe măsură ce deschizi volanul, deschizi și accelerația, în proporție directă.',
      },
    ],
  },
  images: [
    {
      key: 'diagrama-transfer-greutate',
      url: '/images/blogs/dinamica-avansata-in-viraje/diagrama-transfer-greutate.jpg',
      alt: 'Model 3D tehnic, în linii de contur, al unui șasiu de mașină care arată cum sarcina se mută pe pneul din față exterior la frânare și în viraj.',
      caption:
        'Fig. 1.1: Deplasarea dinamică a sarcinii în faza de frânare în viraj.',
      width: 512,
      height: 279,
      position: 0,
    },
  ],
};

const STUBS: SeedBlog[] = [
  {
    slug: 'oboseala-termica-a-franelor',
    title: 'Oboseala termică a frânelor în condiții de solicitare extremă',
    categorySlug: 'maiestrie-tehnica',
    tags: ['avansat', 'franare'],
    image: '/images/blogs/oboseala-termica-a-franelor/cover.jpg',
    imageWidth: 512,
    imageHeight: 286,
    imageAlt:
      'Disc de frână incandescent, roșu de căldură, după o frânare puternică pe circuit.',
    excerpt:
      'De ce frânele își pierd eficiența după opriri repetate de la viteză mare și cum le menții în temperatura optimă de lucru.',
    publishedAt: '2024-10-28T09:00:00Z',
    content: {
      version: 2,
      blocks: [
        {
          type: 'paragraph',
          id: 'introducere',
          variant: 'lead',
          text: 'Fiecare frânare transformă energia cinetică în căldură. Când discurile și plăcuțele depășesc temperatura de lucru, frecarea scade, iar pedala devine moale și lungă.',
        },
        {
          type: 'heading',
          id: 'semnele-oboselii-termice',
          level: 2,
          text: 'Semnele oboselii termice',
          iconName: 'thermostat',
        },
        {
          type: 'paragraph',
          id: 'semnele-oboselii-termice-p1',
          variant: 'body',
          text: 'Distanțe de frânare tot mai mari, miros de plăcuțe încinse și o pedală care coboară mai mult decât de obicei. Când le observi, fă un tur mai lent și lasă frânele să se răcească.',
        },
      ],
    },
  },
  {
    slug: 'stapanirea-franarii-la-limita',
    title: 'Stăpânirea frânării la limită',
    categorySlug: 'maiestrie-tehnica',
    tags: ['franare', 'tehnica'],
    image: '/images/blogs/stapanirea-franarii-la-limita/cover.jpg',
    imageWidth: 286,
    imageHeight: 512,
    imageAlt:
      'Etrier și disc de frână încinse la roșu, văzute de aproape pe o mașină de performanță.',
    excerpt:
      'Cum aplici forța maximă de frânare fără să blochezi roțile și fără să te bazezi doar pe ABS.',
    publishedAt: '2024-10-15T09:00:00Z',
    content: {
      version: 2,
      blocks: [
        {
          type: 'paragraph',
          id: 'introducere',
          variant: 'lead',
          text: 'Frânarea la limită înseamnă să ții pneurile chiar sub pragul de blocare, acolo unde aderența longitudinală este maximă.',
        },
        {
          type: 'heading',
          id: 'apasare-ferma-apoi-dozata',
          level: 2,
          text: 'Apăsare fermă, apoi dozată',
          iconName: 'speed',
        },
        {
          type: 'paragraph',
          id: 'apasare-ferma-apoi-dozata-p1',
          variant: 'body',
          text: 'Apasă ferm în prima fracțiune de secundă, cât timp greutatea se mută pe puntea față, apoi dozează presiunea după senzația din pedală și sunetul pneurilor.',
        },
      ],
    },
  },
  {
    slug: 'antrenamentul-privirii-dincolo-de-apex',
    title: 'Antrenamentul privirii: privește dincolo de apex',
    categorySlug: 'condus-defensiv',
    tags: ['avansat', 'tehnica', 'viraje'],
    image: '/images/blogs/antrenamentul-privirii/cover.jpg',
    imageWidth: 512,
    imageHeight: 279,
    imageAlt:
      'Bordură roșu cu alb la apexul unui viraj de circuit, fotografiată de aproape.',
    excerpt:
      'Mâinile urmează privirea. Exercițiile care îți mută atenția spre ieșirea din viraj îți fac traiectoria mai lină și mai precisă.',
    publishedAt: '2024-11-05T09:00:00Z',
    content: {
      version: 2,
      blocks: [
        {
          type: 'paragraph',
          id: 'introducere',
          variant: 'lead',
          text: 'Privește unde vrei să ajungi, nu unde ești. Este cel mai simplu principiu al condusului sportiv și cel mai des ignorat.',
        },
        {
          type: 'heading',
          id: 'privirea-inaintea-masinii',
          level: 2,
          text: 'Privirea înaintea mașinii',
          iconName: 'visibility',
        },
        {
          type: 'paragraph',
          id: 'privirea-inaintea-masinii-p1',
          variant: 'body',
          text: 'Înainte de punctul de frânare, privirea ta ar trebui să fie deja la apex; la apex, deja la ieșire. Exersează numind cu voce tare reperele înainte să ajungi la ele.',
        },
      ],
    },
  },
  {
    slug: 'traiectoria-ideala-in-viraj',
    title: 'Cum alegi traiectoria ideală în viraj',
    categorySlug: 'mecanica-conducerii',
    tags: ['viraje'],
    image: '/images/blogs/traiectoria-ideala/cover.jpg',
    imageWidth: 237,
    imageHeight: 512,
    imageAlt:
      'Grafic de telemetrie cu traiectorii de cursă suprapuse peste harta unui circuit.',
    excerpt:
      'Punctul de intrare, apexul și punctul de ieșire: cum alegi linia care îți dă cea mai mare viteză la ieșirea din viraj.',
    publishedAt: '2024-09-30T09:00:00Z',
    content: {
      version: 2,
      blocks: [
        {
          type: 'paragraph',
          id: 'introducere',
          variant: 'lead',
          text: 'Traiectoria ideală nu este cea mai scurtă, ci cea care îți permite să accelerezi cât mai devreme la ieșirea din viraj.',
        },
        {
          type: 'heading',
          id: 'intrare-apex-iesire',
          level: 2,
          text: 'Intrare, apex, ieșire',
          iconName: 'route',
        },
        {
          type: 'paragraph',
          id: 'intrare-apex-iesire-p1',
          variant: 'body',
          text: 'Intră larg, atinge apexul puțin mai târziu decât te-ar îndemna instinctul și folosește toată lățimea pistei la ieșire. Un apex întârziat îți lasă mai mult timp să îndrepți volanul și să accelerezi.',
        },
      ],
    },
  },
];

const WORDS_PER_MINUTE = 200;

function readTimeMinutes(content: SeedBlog['content']): number {
  const words = content.blocks
    .flatMap((b): string[] => {
      const items = b.items ?? [];
      switch (b.type) {
        case 'paragraph':
        case 'heading':
          return [b.text ?? ''];
        case 'checklist':
          return [b.title ?? '', ...(items as string[])];
        case 'callout':
          return [b.title ?? '', b.text ?? ''];
        case 'figure':
          return [b.caption ?? ''];
        case 'steps':
          return (items as { title: string; text: string }[]).flatMap((i) => [
            i.title,
            i.text,
          ]);
        default:
          return [];
      }
    })
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const idBySlug = (table: string, slug: string) =>
  sql<string>`(SELECT id FROM ${sql.table(table)} WHERE slug = ${slug})`;

async function setTags(db: Kysely<any>, blogSlug: string, tagSlugs: string[]) {
  const blog = await db
    .selectFrom('blogs')
    .select('id')
    .where('slug', '=', blogSlug)
    .$castTo<{ id: string }>()
    .executeTakeFirstOrThrow();
  await db.deleteFrom('blog_tags').where('blog_id', '=', blog.id).execute();
  await db
    .insertInto('blog_tags')
    .values(
      tagSlugs.map((slug, position) => ({
        blog_id: blog.id,
        tag_id: idBySlug('tags', slug),
        position,
      })),
    )
    .execute();
}

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('authors')
    .values(AUTHOR)
    .onConflict((oc) =>
      oc.column('slug').doUpdateSet({
        role: AUTHOR.role,
        avatar_url: AUTHOR.avatar_url,
        avatar_alt: AUTHOR.avatar_alt,
        bio: AUTHOR.bio,
      }),
    )
    .execute();
  await db
    .insertInto('tags')
    .values(TAGS)
    .onConflict((oc) => oc.column('slug').doNothing())
    .execute();

  const detailColumns = (b: SeedBlog) => ({
    content: JSON.stringify(b.content),
    author: AUTHOR.name,
    author_id: idBySlug('authors', AUTHOR.slug),
    image: b.image,
    image_alt: b.imageAlt,
    image_width: b.imageWidth,
    image_height: b.imageHeight,
    seo_title: b.seoTitle ?? null,
    seo_description: b.seoDescription ?? null,
    read_time_minutes: readTimeMinutes(b.content),
  });

  const existing = await db
    .selectFrom('blogs')
    .select('id')
    .where('slug', '=', MAIN.slug)
    .executeTakeFirst();
  if (existing) {
    await db
      .updateTable('blogs')
      .set(detailColumns(MAIN))
      .where('slug', '=', MAIN.slug)
      .execute();
  } else {
    await db
      .insertInto('blogs')
      .values({
        ...detailColumns(MAIN),
        slug: MAIN.slug,
        title: MAIN.title,
        excerpt: MAIN.excerpt,
        published_at: MAIN.publishedAt,
        category_id: idBySlug('blog_categories', MAIN.categorySlug),
      })
      .execute();
  }

  for (const stub of STUBS) {
    await db
      .insertInto('blogs')
      .values({
        ...detailColumns(stub),
        slug: stub.slug,
        title: stub.title,
        excerpt: stub.excerpt,
        published_at: stub.publishedAt,
        category_id: idBySlug('blog_categories', stub.categorySlug),
      })
      .onConflict((oc) => oc.column('slug').doNothing())
      .execute();
  }

  const main = await db
    .selectFrom('blogs')
    .select('id')
    .where('slug', '=', MAIN.slug)
    .$castTo<{ id: string }>()
    .executeTakeFirstOrThrow();
  await db
    .insertInto('blog_images')
    .values(MAIN.images.map((img) => ({ ...img, blog_id: main.id })))
    .onConflict((oc) => oc.columns(['blog_id', 'key']).doNothing())
    .execute();

  for (const b of [MAIN, ...STUBS]) await setTags(db, b.slug, b.tags);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('blogs')
    .where(
      'slug',
      'in',
      STUBS.map((s) => s.slug),
    )
    .execute();

  const main = await db
    .selectFrom('blogs')
    .select('id')
    .where('slug', '=', MAIN.slug)
    .executeTakeFirst();
  const original = BLOGS_SEED.find((b) => b.slug === MAIN.slug);
  if (main && original) {
    await db.deleteFrom('blog_images').where('blog_id', '=', main.id).execute();
    await db.deleteFrom('blog_tags').where('blog_id', '=', main.id).execute();
    await db
      .updateTable('blogs')
      .set({
        content: JSON.stringify({
          version: 2,
          blocks: original.content.blocks.flatMap((b) => [
            {
              type: 'heading',
              id: b.id,
              level: 2,
              text: b.heading,
              iconName: b.headingIconName,
            },
            {
              type: 'paragraph',
              id: `${b.id}-p1`,
              variant: 'body',
              text: b.body,
            },
          ]),
        }),
        author: original.author,
        author_id: sql`(SELECT id FROM authors WHERE name = ${original.author})`,
        image: original.image,
        image_alt: original.imageAlt,
        image_width: null,
        image_height: null,
        seo_title: null,
        seo_description: null,
        read_time_minutes: original.readTimeMinutes,
      })
      .where('id', '=', main.id)
      .execute();
  } else if (main) {
    await db.deleteFrom('blogs').where('id', '=', main.id).execute();
  }

  await sql`DELETE FROM tags t WHERE t.slug IN (${sql.join(TAGS.map((t) => t.slug))})
    AND NOT EXISTS (SELECT 1 FROM blog_tags bt WHERE bt.tag_id = t.id)`.execute(
    db,
  );
  await sql`DELETE FROM authors a WHERE a.slug = ${AUTHOR.slug}
    AND NOT EXISTS (SELECT 1 FROM blogs b WHERE b.author_id = a.id)`.execute(
    db,
  );
}
