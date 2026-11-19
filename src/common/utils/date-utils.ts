const BUCHAREST_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Bucharest',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's calendar date in Romania as 'YYYY-MM-DD' (en-CA formats ISO-style). */
export function bucharestTodayIso(now: Date = new Date()): string {
  return BUCHAREST_DATE.format(now);
}

/** Adds `n` calendar days to an ISO date using UTC arithmetic (DST-safe, independent of the server TZ). */
export function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
