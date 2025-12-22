export const toIsoDate = (d) => new Date(d).toISOString().slice(0, 10);

export const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const addDays = (d, n) =>
  new Date(new Date(d).setDate(new Date(d).getDate() + n));

/**
 * Formata data e hora no padrão pt-BR.
 * Ex: 22/12/2025 14:35
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {string}
 */
export const formatDateTimePtBR = (value) => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

  return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`;
};

// Apenas data: DD/MM/YYYY
export const formatDatePtBR = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Apenas hora: HH:mm
export const formatTimePtBR = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
