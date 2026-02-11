export function toYmdFromDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function twoDigitYearToFour(yy) {
  const n = Number(yy);
  if (Number.isNaN(n)) return null;
  return n >= 70 ? 1900 + n : 2000 + n;
}

export function normalizeDateToYmd(value) {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return toYmdFromDate(value);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  let match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m}-${d}`;
  }

  match = raw.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (match) {
    const [, d, m, y2] = match;
    const year = twoDigitYearToFour(y2);
    if (year) return `${year}-${m}-${d}`;
  }

  match = raw.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? twoDigitYearToFour(y) : Number(y);
    if (year) return `${year}-${m}-${d}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return toYmdFromDate(parsed);
  }

  return raw;
}
