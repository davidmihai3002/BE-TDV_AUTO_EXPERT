import type { BlogContentV2, ContentBlock } from 'src/types';
import {
  computeReadTimeMinutes,
  countContentWords,
  countWords,
  extractBlockText,
  hydrateFigures,
} from './blogs-utils';

const words = (n: number) =>
  Array.from({ length: n }, () => 'cuvânt').join(' ');
const para = (text: string, id = 'p'): ContentBlock => ({
  type: 'paragraph',
  id,
  variant: 'body',
  text,
});
const content = (...blocks: ContentBlock[]): BlogContentV2 => ({
  version: 2,
  blocks,
});

describe('countWords', () => {
  it('splits on any whitespace and ignores padding', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('  unu\tdoi\n\ntrei  ')).toBe(3);
  });

  it('counts Romanian words with diacritics and hyphenated clitics as single words', () => {
    expect(countWords('Într-o zi, șoferul s-a oprit să-ți arate școala.')).toBe(
      8,
    );
  });
});

describe('extractBlockText', () => {
  it('covers every block type', () => {
    expect(
      extractBlockText({ type: 'heading', id: 'h', level: 2, text: 'Titlu' }),
    ).toEqual(['Titlu']);
    expect(
      extractBlockText({
        type: 'checklist',
        id: 'c',
        title: 'T',
        items: ['a', 'b'],
      }),
    ).toEqual(['T', 'a', 'b']);
    expect(
      extractBlockText({ type: 'callout', id: 'k', variant: 'tip', text: 'x' }),
    ).toEqual(['', 'x']);
    expect(
      extractBlockText({
        type: 'figure',
        id: 'f',
        imageKey: 'k',
        caption: 'Fig. 1',
      }),
    ).toEqual(['Fig. 1']);
    expect(
      extractBlockText({
        type: 'steps',
        id: 's',
        items: [{ title: 'Unu', text: 'doi trei' }],
      }),
    ).toEqual(['Unu', 'doi trei']);
  });
});

describe('computeReadTimeMinutes', () => {
  it('returns at least 1 minute and a number', () => {
    const result = computeReadTimeMinutes(content(para('x')));
    expect(result).toBe(1);
    expect(typeof result).toBe('number');
  });

  it('uses 200 words per minute across all block types, rounded up', () => {
    expect(computeReadTimeMinutes(content(para(words(200))))).toBe(1);
    expect(computeReadTimeMinutes(content(para(words(201))))).toBe(2);
    const mixed = content(
      { type: 'heading', id: 'h', level: 2, text: words(1) },
      para(words(150), 'a'),
      {
        type: 'steps',
        id: 's',
        items: [{ title: words(10), text: words(40) }],
      },
    );
    expect(countContentWords(mixed)).toBe(201);
    expect(computeReadTimeMinutes(mixed)).toBe(2);
  });
});

describe('hydrateFigures', () => {
  const image = {
    key: 'diag',
    url: '/a.jpg',
    alt: 'Alt',
    caption: 'Implicit',
    width: 10,
    height: 5,
    position: 0,
  };

  it('embeds the image and falls back to its caption', () => {
    const [fig] = hydrateFigures(
      [{ type: 'figure', id: 'f', imageKey: 'diag' }],
      [image],
    );
    expect(fig).toMatchObject({
      caption: 'Implicit',
      image: { url: '/a.jpg', alt: 'Alt', width: 10, height: 5 },
    });
  });

  it('drops figures whose image is missing and keeps other blocks', () => {
    const out = hydrateFigures(
      [para('x'), { type: 'figure', id: 'f', imageKey: 'nope' }],
      [image],
    );
    expect(out.map((b) => b.type)).toEqual(['paragraph']);
  });
});
