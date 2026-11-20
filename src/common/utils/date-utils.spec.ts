import { addDaysIso, bucharestTodayIso } from './date-utils';

describe('date-utils', () => {
  it('bucharestTodayIso uses Romanian local date', () => {
    expect(bucharestTodayIso(new Date('2026-11-18T23:30:00Z'))).toBe(
      '2026-11-19',
    );
    expect(bucharestTodayIso(new Date('2026-11-18T21:30:00Z'))).toBe(
      '2026-11-18',
    );
    expect(bucharestTodayIso(new Date('2026-07-01T21:30:00Z'))).toBe(
      '2026-07-02',
    );
  });

  it('addDaysIso crosses months, years and DST changes', () => {
    expect(addDaysIso('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDaysIso('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDaysIso('2026-11-19', 90)).toBe('2027-02-17');
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
  });
});
