export function formatarDataIsoParaBR(isoString) {
  if (!isoString || typeof isoString !== 'string') return '';

  const data = isoString.slice(0, 10); // '2025-07-08'
  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}
