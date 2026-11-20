import { Kysely, sql } from 'kysely';

type LegacyBlock = {
  id: string;
  heading: string;
  headingIconName: string;
  body: string;
};
type V2Block = {
  type: string;
  id: string;
  text?: string;
  title?: string | null;
  iconName?: string | null;
  items?: (string | { title: string; text: string })[];
};
type StoredContent = { version?: number; blocks: LegacyBlock[] | V2Block[] };

const LEGACY_ICON_MAP: Record<string, string> = {
  blocks: 'view_agenda',
  'shield-check': 'verified_user',
  database: 'database',
  plug: 'power',
  sprout: 'eco',
  route: 'route',
  workflow: 'account_tree',
  boxes: 'inventory_2',
  waypoints: 'conversion_path',
};
const toIcon = (name?: string) =>
  !name
    ? null
    : (LEGACY_ICON_MAP[name] ?? (/^[a-z0-9_]+$/.test(name) ? name : null));

export function legacyToV2(content: { blocks: LegacyBlock[] }) {
  return {
    version: 2,
    blocks: content.blocks.flatMap((b) => [
      {
        type: 'heading',
        id: b.id,
        level: 2,
        text: b.heading,
        iconName: toIcon(b.headingIconName),
      },
      ...b.body
        .split(/\n{2,}/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t, i) => ({
          type: 'paragraph',
          id: `${b.id}-p${i + 1}`,
          variant: 'body',
          text: t,
        })),
    ]),
  };
}

function v2ToLegacy(content: { blocks: V2Block[] }): { blocks: LegacyBlock[] } {
  const out: LegacyBlock[] = [];
  const textOf = (b: V2Block): string[] => {
    switch (b.type) {
      case 'paragraph':
        return [b.text ?? ''];
      case 'checklist':
        return [b.title ?? '', ...((b.items ?? []) as string[])];
      case 'callout':
        return [b.title ?? '', b.text ?? ''].filter(Boolean);
      case 'steps':
        return (b.items as { title: string; text: string }[]).map(
          (i, n) => `${n + 1}. ${i.title}: ${i.text}`,
        );
      default:
        return [];
    }
  };
  for (const b of content.blocks) {
    if (b.type === 'heading') {
      out.push({
        id: b.id,
        heading: b.text ?? '',
        headingIconName: b.iconName ?? 'article',
        body: '',
      });
      continue;
    }
    if (out.length === 0) {
      out.push({
        id: 'intro',
        heading: 'Introduction',
        headingIconName: 'article',
        body: '',
      });
    }
    const current = out[out.length - 1];
    const text = textOf(b).join('\n\n');
    if (text) current.body = current.body ? `${current.body}\n\n${text}` : text;
  }
  return { blocks: out.map((b) => ({ ...b, body: b.body || b.heading })) };
}

export async function up(db: Kysely<any>): Promise<void> {
  const rows = await db.selectFrom('blogs').select(['id', 'content']).execute();
  for (const row of rows as { id: string; content: StoredContent }[]) {
    if (row.content?.version === 2) continue;
    await db
      .updateTable('blogs')
      .set({
        content: JSON.stringify(
          legacyToV2(row.content as { blocks: LegacyBlock[] }),
        ),
      })
      .where('id', '=', row.id)
      .execute();
  }
  await sql`ALTER TABLE blogs ADD CONSTRAINT blogs_content_v2_chk
    CHECK ((content->>'version')::int = 2 AND jsonb_typeof(content->'blocks') = 'array')`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE blogs DROP CONSTRAINT IF EXISTS blogs_content_v2_chk`.execute(
    db,
  );
  const rows = await db.selectFrom('blogs').select(['id', 'content']).execute();
  for (const row of rows as { id: string; content: StoredContent }[]) {
    if (row.content?.version !== 2) continue;
    await db
      .updateTable('blogs')
      .set({
        content: JSON.stringify(
          v2ToLegacy(row.content as { blocks: V2Block[] }),
        ),
      })
      .where('id', '=', row.id)
      .execute();
  }
}
