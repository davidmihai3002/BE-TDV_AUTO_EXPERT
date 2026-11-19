import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The landing seed must use comma-below ș/ț (U+0219/U+021B), never the cedilla forms, and carry the mock marker.
describe('015-insert-landing-content seed', () => {
  const file = readFileSync(
    join(
      __dirname,
      '../../clients/database/migrations/015-insert-landing-content.ts',
    ),
    'utf8',
  );
  it('has no cedilla ş/ţ and starts with the mock marker', () => {
    expect(file).not.toMatch(/[şţŞŢ]/);
    expect(file.startsWith('// MOCK DATA — to be replaced')).toBe(true);
    expect(file).toMatch(/ș/);
  });
  it('ships no legal-verification markers', () => {
    expect(file).not.toContain('(*)');
  });
});
