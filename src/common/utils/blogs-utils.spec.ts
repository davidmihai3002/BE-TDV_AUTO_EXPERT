import type { BlogContent } from 'src/types';
import { computeReadTimeMinutes, countWords } from './blogs-utils';

const words = (n: number) =>
  Array.from({ length: n }, () => 'cuvânt').join(' ');
const content = (...bodies: string[]): BlogContent => ({
  blocks: bodies.map((body, i) => ({
    id: `b${i}`,
    heading: '',
    headingIconName: 'x',
    body,
  })),
});

describe('countWords', () => {
  it('splits on any whitespace and ignores padding', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('  unu\tdoi\n\ntrei  ')).toBe(3);
  });

  it('counts Romanian words with diacritics and hyphenated clitics as single words', () => {
    expect(countWords('Într-o zi, șoferul s-a oprit la școală.')).toBe(7);
  });
});

describe('computeReadTimeMinutes', () => {
  it('returns at least 1 minute', () => {
    expect(computeReadTimeMinutes(content(''))).toBe(1);
  });

  it('uses 200 words per minute, rounded up', () => {
    expect(computeReadTimeMinutes(content(words(200)))).toBe(1);
    expect(computeReadTimeMinutes(content(words(201)))).toBe(2);
    expect(computeReadTimeMinutes(content(words(150), words(250)))).toBe(2);
  });

  it('counts headings too and returns a number', () => {
    const c: BlogContent = {
      blocks: [
        { id: 'a', heading: words(1), headingIconName: 'x', body: words(200) },
      ],
    };
    const result = computeReadTimeMinutes(c);
    expect(result).toBe(2);
    expect(typeof result).toBe('number');
  });
});
