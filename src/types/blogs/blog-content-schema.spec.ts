import {
  blogContentInputSchema,
  blogContentV2Schema,
  legacyToV2,
} from './blog-content-schema';

const valid = {
  version: 2,
  blocks: [
    { type: 'paragraph', id: 'introducere', variant: 'lead', text: 'Intro' },
    {
      type: 'heading',
      id: 'fizica',
      level: 2,
      text: 'Fizica',
      iconName: 'speed',
    },
    { type: 'heading', id: 'detalii', level: 3, text: 'Detalii' },
  ],
};

describe('blogContentV2Schema', () => {
  it('accepts a valid document', () => {
    expect(blogContentV2Schema.safeParse(valid).success).toBe(true);
  });

  it.each([
    [
      'duplicate ids',
      {
        ...valid,
        blocks: [
          ...valid.blocks,
          { type: 'paragraph', id: 'fizica', variant: 'body', text: 'x' },
        ],
      },
    ],
    ['unknown block type', { ...valid, blocks: [{ type: 'video', id: 'v' }] }],
    [
      'icon name with a dash',
      {
        ...valid,
        blocks: [
          {
            type: 'heading',
            id: 'h',
            level: 2,
            text: 'T',
            iconName: 'shield-check',
          },
        ],
      },
    ],
    [
      'h3 before any h2',
      { ...valid, blocks: [{ type: 'heading', id: 'h', level: 3, text: 'T' }] },
    ],
    [
      'non-kebab id',
      {
        ...valid,
        blocks: [
          { type: 'paragraph', id: 'Intro_1', variant: 'body', text: 'x' },
        ],
      },
    ],
    ['empty blocks', { version: 2, blocks: [] }],
  ])('rejects %s', (_label, doc) => {
    expect(blogContentV2Schema.safeParse(doc).success).toBe(false);
  });
});

describe('legacyToV2', () => {
  it('turns each block into an h2 + paragraphs and maps Lucide icons', () => {
    const v2 = legacyToV2({
      blocks: [
        {
          id: 'sectiune',
          heading: 'Titlu',
          headingIconName: 'shield-check',
          body: 'Unu.\n\nDoi.',
        },
      ],
    });
    expect(v2).toEqual({
      version: 2,
      blocks: [
        {
          type: 'heading',
          id: 'sectiune',
          level: 2,
          text: 'Titlu',
          iconName: 'verified_user',
        },
        { type: 'paragraph', id: 'sectiune-p1', variant: 'body', text: 'Unu.' },
        { type: 'paragraph', id: 'sectiune-p2', variant: 'body', text: 'Doi.' },
      ],
    });
  });

  it('drops unmappable icon names', () => {
    const v2 = legacyToV2({
      blocks: [
        { id: 'a', heading: 'H', headingIconName: 'Weird-Icon', body: 'b' },
      ],
    });
    expect(v2.blocks[0]).toMatchObject({ iconName: null });
  });
});

describe('blogContentInputSchema', () => {
  it('accepts legacy input and returns v2', () => {
    const out = blogContentInputSchema.parse({
      blocks: [{ id: 'a', heading: 'H', headingIconName: 'route', body: 'b' }],
    });
    expect(out.version).toBe(2);
  });
});
