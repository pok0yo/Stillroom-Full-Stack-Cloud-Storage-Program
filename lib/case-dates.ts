// Calendar deadlines use the operator's Georgia timezone, including DST transitions.
const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
function wallTime(time: number) {
  const parts = Object.fromEntries(clock.formatToParts(time).map(p => [p.type, Number(p.value)]));
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) + ((time % 1000) + 1000) % 1000;
}
export function calendarDeadline(iso: string, days: number) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time) || !Number.isInteger(days) || days < 0) throw new Error('Invalid case date');
  const day = 86400000, desired = wallTime(time) + days * day;
  const candidates = [...new Set([-2, 2].map(offset => { const probe = desired + offset * day; return desired - (wallTime(probe) - probe); }))];
  const exact = candidates.filter(candidate => wallTime(candidate) === desired);
  // Choose the earlier occurrence for a fold, or earlier adjacent offset for a nonexistent time; never extend a target silently.
  return new Date(Math.min(...(exact.length ? exact : candidates))).toISOString();
}
