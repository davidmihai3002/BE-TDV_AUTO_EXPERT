// MOCK DATA — to be replaced (plan §9 D4). Romanian copy (D1), UTF-8, comma-below ș/ț only.
// Shared by migrations 032/034; ticket 05 imports and extends it (featured slug must stay `dinamica-avansata-in-viraje`).
import type { BlogContent } from 'src/types/blogs/blogs-table-types';

export interface BlogCategorySeed {
  slug: string;
  name: string;
  sortOrder: number;
}

export interface BlogSeed {
  slug: string;
  title: string;
  categorySlug: string;
  isFeatured: boolean;
  publishedAt: string;
  readTimeMinutes: number;
  author: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  content: BlogContent;
}

export const BLOG_CATEGORIES_SEED: BlogCategorySeed[] = [
  { slug: 'mecanica-conducerii', name: 'Mecanica conducerii', sortOrder: 10 }, // Driving Mechanics
  {
    slug: 'protocoale-de-siguranta',
    name: 'Protocoale de siguranță',
    sortOrder: 20,
  }, // Safety Protocols
  { slug: 'tehnologia-flotei', name: 'Tehnologia flotei', sortOrder: 30 }, // Fleet Tech
  {
    slug: 'perspectiva-instructorilor',
    name: 'Perspectiva instructorilor',
    sortOrder: 40,
  }, // Instructor Insights
  { slug: 'condus-defensiv', name: 'Condus defensiv', sortOrder: 50 }, // Defensive Driving
  {
    slug: 'intretinerea-vehiculului',
    name: 'Întreținerea vehiculului',
    sortOrder: 60,
  }, // Vehicle Maintenance
  { slug: 'siguranta-rutiera', name: 'Siguranță rutieră', sortOrder: 70 }, // Road Safety
  { slug: 'maiestrie-tehnica', name: 'Măiestrie tehnică', sortOrder: 80 }, // Technical Mastery
];

/** Desktop card order first (posts 1–4), then the mobile rows; F is the only featured post. */
export const BLOGS_SEED: BlogSeed[] = [
  {
    slug: 'dinamica-avansata-in-viraje',
    title:
      'Dinamica avansată a virajelor: fizica întâlnește precizia pe circuit',
    categorySlug: 'maiestrie-tehnica',
    isFeatured: true,
    publishedAt: '2024-10-24T06:00:00Z',
    readTimeMinutes: 8,
    author: 'Andrei Ionescu',
    excerpt:
      'Stăpânirea apexului nu ține doar de instinct; este aplicarea riguroasă a frecării, a transferului de masă și a disciplinei la accelerație. Descoperă mecanica din spatele controlului de elită al vehiculului.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUh5BcH3ujQ2GRQ58ICibH17X1VegiXaUogRpj1tHkfbcsp2eY1HXOdLh_B4IE_oYZLxMTon-0XsTgxVeCqG6RwyjtA3nOHmzz1uM3IT4eFGX3h8kvFA8ykUDLYJNHJhO8Ak9FaB-P-RB9mwSTaDVTNBnd8LE0WFpHkTE-xDI1XIgxmHar6X4fPc6P6NdJcCek9lxJ_fDILeuzIzJ3CnzpHQm3rkAmKWhumJOdGVh3OHrONc2yzZwQ',
    imageAlt:
      'Mâinile instructorului pe volanul unei mașini moderne, cu bordul luminat de indicatoare albastre într-un tunel întunecat',
    content: {
      blocks: [
        {
          id: 'cercul-de-frecare',
          heading: 'Cercul de frecare',
          headingIconName: 'donut_large',
          body: 'Fiecare anvelopă are o cantitate limitată de aderență, împărțită între frânare, accelerare și virare. Dacă o depășești în orice direcție, mașina începe să alunece. Un viraj precis înseamnă să folosești acest buget în mod deliberat.',
        },
        {
          id: 'transferul-de-masa',
          heading: 'Transferul de masă și echilibrul',
          headingIconName: 'balance',
          body: 'Frânarea mută greutatea pe puntea față și face intrarea în viraj mai precisă; accelerația o mută spre spate și stabilizează mașina. Tranzițiile line între cele două mențin anvelopele încărcate și previzibile.',
        },
        {
          id: 'acceleratia-la-apex',
          heading: 'Disciplina accelerației la apex',
          headingIconName: 'speed',
          body: 'De la apex încolo, apasă accelerația o singură dată, progresiv. Ezitarea sau comenzile bruște dezechilibrează mașina și irosesc viteza de ieșire pe care ai construit-o.',
        },
      ],
    },
  },
  {
    slug: 'combaterea-acvaplanarii-raspunsul-senzorilor-activi',
    title:
      'Combaterea acvaplanării: strategii de răspuns ale senzorilor activi',
    categorySlug: 'protocoale-de-siguranta',
    isFeatured: false,
    publishedAt: '2024-10-21T06:00:00Z',
    readTimeMinutes: 7,
    author: 'Mihai Popescu',
    excerpt:
      'O analiză aprofundată a sistemelor moderne ESC (controlul electronic al stabilității) și a tehnicilor prin care șoferul preia controlul în situațiile critice de pierdere a aderenței.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAMiXCFBooiabNJ7deMMpYSDbSUppZYRNuA8ml2qf1ukUZWV1AZzxF6vrMe8xzoXVLIAJvzQyiO5woVX6FV433LydaLPDyQXu_iEtsEER9u0oDUQZj1nkiLFQk5c9Ui7znYURJcuabkv12wRB3wViix5pUmIHsdlkNRBLiJRztL64icqbfXhXhV_jA0KyoMPJikTOKaRNJxpR0izpYmXKdHPW7ritvE_q-J33Ty2hzG_H225ZXDQQd',
    imageAlt:
      'Prim-plan cu o anvelopă de performanță pe asfalt ud, sub o lumină albă și rece',
    content: {
      blocks: [
        {
          id: 'ce-este-acvaplanarea',
          heading: 'Ce se întâmplă când anvelopele pierd contactul',
          headingIconName: 'water_drop',
          body: 'Când apa nu poate fi evacuată suficient de repede prin profil, sub anvelopă se formează o pană de apă, iar volanul nu mai are efect. Sistemele moderne de stabilitate detectează diferența de turație a roților în câteva milisecunde.',
        },
        {
          id: 'raspunsul-esc',
          heading: 'Cum reacționează ESC',
          headingIconName: 'sensors',
          body: 'Controlul electronic al stabilității compară rata de girație cu unghiul volanului și frânează roți individuale pentru a readuce mașina pe traiectoria dorită. Dacă îi înțelegi logica, nu te mai lupți cu sistemul.',
        },
        {
          id: 'interventia-soferului',
          heading: 'Când intervii tu',
          headingIconName: 'back_hand',
          body: 'Ține volanul îndreptat spre direcția în care vrei să mergi, ridică piciorul de pe accelerație și evită frânarea bruscă. Lasă anvelopele să-și recapete aderența înainte de orice altă corecție.',
        },
      ],
    },
  },
  {
    slug: 'tintirea-vizuala-neurostiinta-privirii-in-viraj',
    title: 'Țintirea vizuală: neuroștiința privirii care conduce volanul',
    categorySlug: 'mecanica-conducerii',
    isFeatured: false,
    publishedAt: '2024-10-17T06:00:00Z',
    readTimeMinutes: 6,
    author: 'Elena Dumitrescu',
    excerpt:
      'Examinează legătura neurologică dintre vederea periferică și comenzile de direcție. Antrenează-ți privirea să urmărească trasa optimă în tranzițiile cu viteză mare.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbjNG1uHZnB95anjJxSs_30myvz_5vVe4GphYcsQZnu6kFeCFRMjo2nW6-I9Zw3MEOT5zrXvh1lS7EwhPhz6mr-XsPo5nLtJAce3fi6cQToUpMJ97gouNnMmsdZ_3H-bSNnpFtcoMV2-1f2cOBTE5aMbXjt_mTsS_symNsTpKK22Y-AR4M8tmyFttoZ2ZIHFn-b9oDB25Xg0rQPU_ZKpP_A_YhKp0k2aw1Y4bSHtzxg2dCAJ_3AYVR',
    imageAlt: 'Vedere peste volan spre un drum de munte șerpuit, la apus',
    content: {
      blocks: [
        {
          id: 'privirea-conduce-mainile',
          heading: 'Privirea îți conduce mâinile',
          headingIconName: 'visibility',
          body: 'Șoferii virează instinctiv spre locul în care privesc. Dacă îți antrenezi privirea să se mute din timp spre ieșirea din viraj, comenzile de direcție devin mai line, mai timpurii și mai precise.',
        },
        {
          id: 'vederea-periferica',
          heading: 'Folosirea vederii periferice',
          headingIconName: 'panorama',
          body: 'Vederea centrală procesează detaliile, iar cea periferică urmărește mișcarea și poziția. Șoferii experimentați se bazează pe periferie pentru a păstra banda, în timp ce atenția lor merge înainte.',
        },
        {
          id: 'exercitii-pentru-privire',
          heading: 'Exerciții pentru o privire care conduce',
          headingIconName: 'fitness_center',
          body: 'Exersează să numești cu voce tare punctele de reper înainte să ajungi la ele. Obiceiul îți ține privirea înaintea mașinii și construiește sincronizarea necesară tranzițiilor rapide.',
        },
      ],
    },
  },
  {
    slug: 'arhitectura-dct-transfer-de-putere-fara-intreruperi',
    title:
      'Arhitectura DCT: exploatarea transferului de putere fără întreruperi',
    categorySlug: 'tehnologia-flotei',
    isFeatured: false,
    publishedAt: '2024-10-14T06:00:00Z',
    readTimeMinutes: 9,
    author: 'Andrei Ionescu',
    excerpt:
      'Analiză tehnică a cutiilor de viteze cu dublu ambreiaj din flota noastră avansată și a modului în care optimizezi momentele de schimbare pentru o stabilitate dinamică maximă.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmYUZGB6K7Hc-_az2l6d-IvGZ8eiGz-gnOHmdBhsecPMBtqRIOAR_HCloX3UbZ2fi38kGbhKBZ-7SQMerOGdX_C6ZFt7-6XOyPYNfn30Uo7mSVwqnkgx2JADJ_8rMn6NsgdzIV6iQEEUhwzpSF4x_4FNxVY9U4Z1hbA1B-bCkibCAycU2JlYshbYL9g-3TtTJ6-1OODynhzhvWY0K9RE1vZM7zyByOjR7JS6mYdiIHNeL5oQ-NHDQN',
    imageAlt:
      'Schema unei cutii de viteze cu dublu ambreiaj suprapusă peste un compartiment motor metalic',
    content: {
      blocks: [
        {
          id: 'cum-functioneaza-dct',
          heading: 'Cum funcționează o cutie cu dublu ambreiaj',
          headingIconName: 'settings',
          body: 'Două ambreiaje gestionează separat treptele impare și pare, așa că următorul raport este preselectat și cuplat aproape instantaneu. Rezultatul este un transfer de putere fără întreruperi la schimbarea treptelor.',
        },
        {
          id: 'momentul-schimbarii',
          heading: 'Alegerea momentului de schimbare',
          headingIconName: 'speed',
          body: 'Schimbarea la turația potrivită menține motorul în zona de cuplu și nu dezechilibrează mașina în viraj. Modul manual al mașinilor din flota noastră îi lasă pe cursanți să simtă diferența.',
        },
        {
          id: 'stabilitate-dinamica',
          heading: 'Schimbările și stabilitatea dinamică',
          headingIconName: 'balance',
          body: 'Evită să schimbi treapta când mașina este puternic încărcată în viraj. Termină schimbările pe linie dreaptă, ca transmisia să rămână calmă în curbă.',
        },
      ],
    },
  },
  {
    slug: 'analiza-telemetriei-micro-comenzile-soferului',
    title: 'Analiza telemetriei: decodarea micro-comenzilor șoferului',
    categorySlug: 'perspectiva-instructorilor',
    isFeatured: false,
    publishedAt: '2024-10-10T06:00:00Z',
    readTimeMinutes: 7,
    author: 'Ioana Marinescu',
    excerpt:
      'Cum folosesc instructorii TDV datele de telemetrie în timp real pentru a corecta erori minuscule în presiunea de frânare și unghiul volanului în cursurile avansate.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAoXTKPEG1Frs3pAmXCe5H06O47SGD1kmzyRBYzpvmLJMeGkii1q9XMKsmiHD7XFsMIVZ2vCXcDiyBuKyxe7pJvAm3OXScTgCg0eJTaQCYIhkNvhNFCALa8DFWeeCGTTm6y_kkgNL5HGGx5yyoR3eql9p1fV-2RZoyf-z98my4RgABDN5AzzdqJkSvhT6Xhlc36y2MmNRzVS6t-XgJuDorgbqjHlu6Jqb-rilQ43zmTGRyaQ0c1qdz8',
    imageAlt:
      'Instructor care ține o tabletă cu date de telemetrie lângă un simulator de condus',
    content: {
      blocks: [
        {
          id: 'ce-inregistreaza-telemetria',
          heading: 'Ce înregistrează telemetria',
          headingIconName: 'monitoring',
          body: 'Presiunea de frânare, unghiul volanului, poziția pedalei de accelerație și viteza sunt înregistrate de multe ori pe secundă. Împreună dezvăluie obiceiuri invizibile de pe scaunul pasagerului.',
        },
        {
          id: 'micro-erori',
          heading: 'Identificarea micro-erorilor',
          headingIconName: 'troubleshoot',
          body: 'Micile ezitări înainte de frânare sau corecțiile fine de volan în mijlocul virajului apar clar în date. Instructorii folosesc aceste trasee pentru a concentra exercițiile acolo unde contează cel mai mult.',
        },
        {
          id: 'din-date-in-feedback',
          heading: 'Din date în feedback',
          headingIconName: 'school',
          body: 'După fiecare sesiune, cursanții își compară traseele cu un tur de referință al instructorului. Când vezi diferența, progresul devine concret și măsurabil.',
        },
      ],
    },
  },
  {
    slug: 'strategii-de-prevenire-a-acvaplanarii',
    title: 'Strategii de prevenire a acvaplanării',
    categorySlug: 'siguranta-rutiera',
    isFeatured: false,
    publishedAt: '2024-10-07T06:00:00Z',
    readTimeMinutes: 4,
    author: 'Mihai Popescu',
    excerpt:
      'Adâncimea profilului, presiunea din anvelope și disciplina vitezei decid dacă roțile păstrează contactul cu asfaltul ud. Obiceiuri simple care opresc acvaplanarea înainte să înceapă.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiClOtYDsu_DsBvCc_dwsOMbkJjyo7g4fREnX4f8OA1qJyZKoL4z-PaNC2cFqz0Ll84B1G5dWMQrXHPUPsG51jjaC6sAZxpH3kr65SQDesAicgaU94XeNSf3lF0lGYwZV3Zsep-Ll9n94uGggIzm4XGZALeXPgroJ5hhUDbfnyQABH4ZoZrkLt_TouK6gLFEX98KXsdBWQgAJw8IwwZgdO5OZDT46A7fwGbRe1kEqpkRh_mbrBFKoQ',
    imageAlt:
      'Anvelopă de performanță care aderă la asfaltul ud în timpul unei furtuni',
    content: {
      blocks: [
        {
          id: 'starea-anvelopelor',
          heading: 'Verifică profilul și presiunea',
          headingIconName: 'tire_repair',
          body: 'Canalele profilului evacuează apa din zona de contact. Anvelopele uzate sau insuficient umflate își pierd această capacitate cu mult înainte să pară periculoase.',
        },
        {
          id: 'disciplina-vitezei',
          heading: 'Încetinește când drumul e acoperit de apă',
          headingIconName: 'speed',
          body: 'Riscul de acvaplanare crește brusc odată cu viteza. Reducerea vitezei pe ploaie torențială este cea mai eficientă măsură de prevenire.',
        },
        {
          id: 'citirea-drumului',
          heading: 'Citește suprafața drumului',
          headingIconName: 'visibility',
          body: 'Fii atent la bălți, făgașe și porțiuni lucioase din față și mergi pe urmele roților vehiculului din fața ta, unde apa a fost deja dislocată.',
        },
      ],
    },
  },
  {
    slug: 'verificarea-de-5-minute-inainte-de-plecare',
    title: 'Verificarea dinaintea plecării: inspecția de 5 minute',
    categorySlug: 'intretinerea-vehiculului',
    isFeatured: false,
    publishedAt: '2024-10-03T06:00:00Z',
    readTimeMinutes: 3,
    author: 'Elena Dumitrescu',
    excerpt:
      'Cinci minute înainte de fiecare drum: lumini, anvelope, lichide, oglinzi și poziția la volan. Rutina rapidă de inspecție pe care o învățăm la școală încă din prima lecție.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlukM77hWt4js5w4ICpMf_MJpxKcUIaqxfyHwqycySCHAITn3mgsrQhPVC3wrKtNeG5ivGyWt7RjcYP4lTR_NuuzwUWjJRwvnI95w94xijektBF342q-sehiTPQV5P54q5g1Cq9-zvPEJ7NmLoFs4LdR8AtfAtn1ziSO8NB4iWTjuWbfd5FdhEr0v_dEEs9xtPtZOuv-GoF3DXVvCSBCmgpBsiSpMkIpJu5RtXnItEtOvV0WdP43vY',
    imageAlt:
      'Tavă ordonată cu scule de mecanic, chei cromate și o tabletă de diagnoză',
    content: {
      blocks: [
        {
          id: 'in-jurul-masinii',
          heading: 'Un tur în jurul mașinii',
          headingIconName: 'directions_walk',
          body: 'Verifică anvelopele de deteriorări și presiune, asigură-te că toate luminile funcționează și uită-te sub mașină după scurgeri proaspete înainte să urci.',
        },
        {
          id: 'sub-capota',
          heading: 'Lichidele dintr-o privire',
          headingIconName: 'oil_barrel',
          body: 'Uleiul, antigelul, lichidul de frână și lichidul de parbriz trebuie să fie între marcaje. O verificare rapidă, săptămânală, previne majoritatea surprizelor pe drum.',
        },
        {
          id: 'pozitia-la-volan',
          heading: 'Reglează-ți poziția la volan',
          headingIconName: 'airline_seat_recline_normal',
          body: 'Reglează scaunul, volanul și oglinzile înainte să pornești motorul și pune-ți centura. O poziție corectă îmbunătățește controlul și vizibilitatea.',
        },
      ],
    },
  },
  {
    slug: 'condusul-pe-timp-de-noapte-scanarea-vizuala',
    title: 'Condusul pe timp de noapte: o scanare vizuală mai bună',
    categorySlug: 'condus-defensiv',
    isFeatured: false,
    publishedAt: '2024-09-30T06:00:00Z',
    readTimeMinutes: 6,
    author: 'Ioana Marinescu',
    excerpt:
      'Întunericul îți îngustează câmpul vizual și ascunde pericolele. Învață tiparul de scanare folosit de șoferii experimentați pentru a citi noaptea intersecțiile, pietonii și orbirea de la faruri.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCe-KbiWEzHmUyKWWHIjwxfrUdnrsJW5-sf8igZYy8CbZX_hhGybDvbK3Emd1Ug9PfTWJhmN_pNbrb82mY_iJKvnXlH1jI2EVi1pesHQIs9TgLCfl5BQ1PXDMMCRprzFt6B0giLsTkcaihLbL57Mbq8RQnEljEPr5GihABlbceiaw4QRacqIYmK9vaMepqqlENeaiVaCO_xIVFATfRvQSuQNJdMoomyConmssHU_4O4qf0Gj2s_UNCm',
    imageAlt:
      'Vedere de noapte din interiorul mașinii spre o intersecție urbană luminată',
    content: {
      blocks: [
        {
          id: 'limitele-vederii-nocturne',
          heading: 'Limitele vederii pe timp de noapte',
          headingIconName: 'dark_mode',
          body: 'Farurile luminează doar o fracțiune din ceea ce arată lumina zilei. Distanța de oprire poate depăși cu ușurință distanța pe care o vezi efectiv.',
        },
        {
          id: 'tipar-de-scanare',
          heading: 'Un tipar de scanare structurat',
          headingIconName: 'radar',
          body: 'Mută-ți privirea de departe spre aproape, apoi spre oglinzi și drumurile laterale, într-un ritm constant. Structura împiedică atenția să se blocheze pe sursele de lumină care distrag.',
        },
        {
          id: 'gestionarea-orbirii',
          heading: 'Cum gestionezi orbirea',
          headingIconName: 'flare',
          body: 'Privește spre marginea dreaptă a benzii când se apropie faruri din sens opus, ține parbrizul curat și folosește modul de noapte al oglinzii retrovizoare.',
        },
      ],
    },
  },
  {
    slug: 'condus-defensiv-avansat-stapanirea-apexului',
    title: 'Condus defensiv avansat: stăpânirea apexului',
    categorySlug: 'condus-defensiv',
    isFeatured: false,
    publishedAt: '2024-09-26T06:00:00Z',
    readTimeMinutes: 5,
    author: 'Andrei Ionescu',
    excerpt:
      'Învață tehnicile profesioniste pentru a lua virajele în siguranță și eficient. Explicăm fizica și aplicarea practică a atingerii perfecte a apexului, de fiecare dată.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANLgiSFS0Tn6Ddkz8q0eD9vQKBOBwYwHxoQspubS0OxMPjAEqZ8aKFV8CKjnlFkQu95Mk9fvI8sQO23Y_T_xtl7-yLRaVPBSe6lR_ztbydragFlJ75IGxcDxssPqvj1vhm0kKirgA6ucmriTAUYNvytgaxQoJ4TBYOfPae8DCSvAdYRAyeGJmXN2qqEJloJ5gZJVhxPFZYlGDDtOXstb6LNtpb-TCG5KVZiHJ9hSngTFrTVvhEQalJ',
    imageAlt:
      'Ecranul bordului unei mașini premium cu grafice aurii pe o interfață albastru închis',
    content: {
      blocks: [
        {
          id: 'gasirea-apexului',
          heading: 'Găsirea apexului',
          headingIconName: 'route',
          body: 'Apexul este punctul în care mașina ajunge cel mai aproape de interiorul virajului. Dacă îl alegi corect, îți pregătești o ieșire sigură și largă.',
        },
        {
          id: 'viteza-de-intrare',
          heading: 'Viteza corectă de intrare',
          headingIconName: 'speed',
          body: 'Termină frânarea în linie dreaptă înainte să intri în viraj. Dacă ajungi cu viteza potrivită, traiectoria lină devine posibilă.',
        },
        {
          id: 'iesirea-controlata',
          heading: 'Ieșire controlată',
          headingIconName: 'trending_up',
          body: 'Îndreaptă volanul pe măsură ce accelerezi progresiv, păstrând mașina pe bandă și pregătită pentru ce urmează după curbă.',
        },
      ],
    },
  },
];
