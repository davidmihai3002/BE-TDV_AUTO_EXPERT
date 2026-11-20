import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('015-insert-landing-content seed', () => {
  const file = readFileSync(
    join(
      __dirname,
      '../../clients/database/migrations/015-insert-landing-content.ts',
    ),
    'utf8',
  );
  it('has no cedilla ş/ţ', () => {
    expect(file).not.toMatch(/[şţŞŢ]/);
    expect(file).toMatch(/ș/);
  });
  it('ships no legal-verification markers', () => {
    expect(file).not.toContain('(*)');
  });
});
