import { z } from 'zod';

/** Block ids double as DOM ids / URL anchors. */
export const blockIdSchema = z
  .string()
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Block id must be ASCII kebab-case');
/** Material Symbols name (no dashes: "settings_input_component"). */
export const iconNameSchema = z
  .string()
  .max(64)
  .regex(/^[a-z0-9_]+$/, 'Icon name must be a Material Symbols name');

const text = z.string().trim().min(1).max(5000);
const title = z.string().trim().min(1).max(120);

export const paragraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  id: blockIdSchema,
  variant: z.enum(['lead', 'body']),
  text,
});

export const headingBlockSchema = z.object({
  type: z.literal('heading'),
  id: blockIdSchema,
  level: z.union([z.literal(2), z.literal(3)]),
  text: title,
  iconName: iconNameSchema.nullish(),
});

export const checklistBlockSchema = z.object({
  type: z.literal('checklist'),
  id: blockIdSchema,
  title,
  watermarkIconName: iconNameSchema.nullish(),
  items: z.array(text).min(1).max(12),
});

export const calloutBlockSchema = z.object({
  type: z.literal('callout'),
  id: blockIdSchema,
  variant: z.enum(['tip', 'insight']),
  title: title.nullish(),
  iconName: iconNameSchema.nullish(),
  text,
  quote: z.boolean().optional(),
});

export const figureBlockSchema = z.object({
  type: z.literal('figure'),
  id: blockIdSchema,
  imageKey: blockIdSchema,
  caption: z.string().trim().max(200).nullish(),
});

export const stepsBlockSchema = z.object({
  type: z.literal('steps'),
  id: blockIdSchema,
  items: z.array(z.object({ title, text })).min(1).max(12),
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  paragraphBlockSchema,
  headingBlockSchema,
  checklistBlockSchema,
  calloutBlockSchema,
  figureBlockSchema,
  stepsBlockSchema,
]);
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type FigureBlock = z.infer<typeof figureBlockSchema>;

export const blogContentV2Schema = z
  .object({
    version: z.literal(2),
    blocks: z.array(contentBlockSchema).min(1),
  })
  .superRefine((content, ctx) => {
    const seen = new Set<string>();
    let sawH2 = false;
    content.blocks.forEach((block, i) => {
      if (seen.has(block.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['blocks', i, 'id'],
          message: `Duplicate block id "${block.id}"`,
        });
      }
      seen.add(block.id);
      if (block.type === 'heading') {
        if (block.level === 3 && !sawH2) {
          ctx.addIssue({
            code: 'custom',
            path: ['blocks', i, 'level'],
            message: 'A level-3 heading must come after a level-2 heading',
          });
        }
        if (block.level === 2) sawH2 = true;
      }
    });
  });
export type BlogContentV2 = z.infer<typeof blogContentV2Schema>;

/** The original flat format (`{ blocks: [{ id, heading, headingIconName, body }] }`). */
export const legacyBlogContentSchema = z.object({
  blocks: z
    .array(
      z.object({
        id: z.string().min(1),
        heading: z.string().min(1),
        headingIconName: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1),
});
export type LegacyBlogContent = z.infer<typeof legacyBlogContentSchema>;

// legacy example rows used Lucide names; map them to Material Symbols
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
const toIcon = (name?: string): string | null =>
  !name
    ? null
    : (LEGACY_ICON_MAP[name] ?? (/^[a-z0-9_]+$/.test(name) ? name : null));

/** Each legacy block → an h2 (icon mapped) + one body paragraph per blank-line-separated chunk. */
export function legacyToV2(content: LegacyBlogContent): BlogContentV2 {
  return {
    version: 2,
    blocks: content.blocks.flatMap((b): ContentBlock[] => [
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
        .map((t, i): ContentBlock => ({
          type: 'paragraph',
          id: `${b.id}-p${i + 1}`,
          variant: 'body',
          text: t,
        })),
    ]),
  };
}

const legacyAsV2Schema = legacyBlogContentSchema
  .transform(legacyToV2)
  .pipe(blogContentV2Schema);

/**
 * Insert-script input: documents with a `version` key are validated as v2 (so errors point at the exact block);
 * anything else is read as the legacy format and converted.
 */
export const blogContentInputSchema = z
  .unknown()
  .transform((value, ctx): BlogContentV2 => {
    const isV2 =
      typeof value === 'object' && value !== null && 'version' in value;
    const result = (isV2 ? blogContentV2Schema : legacyAsV2Schema).safeParse(
      value,
    );
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: 'custom',
        message: issue.message,
        path: issue.path,
      });
    }
    return z.NEVER;
  });
