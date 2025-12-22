export function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;       // { data: [...] }
  if (val && Array.isArray(val.results)) return val.results; // { results: [...] }
  if (val && Array.isArray(val.items)) return val.items;     // { items: [...] }
  if (val && Array.isArray(val.rows)) return val.rows;       // { rows: [...] }
  return [];
}
