export const toIsoDate = (d) => new Date(d).toISOString().slice(0, 10);

export const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const addDays = (d, n) =>
  new Date(new Date(d).setDate(new Date(d).getDate() + n));
