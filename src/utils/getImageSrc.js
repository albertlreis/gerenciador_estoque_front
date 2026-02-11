/**
 * Retorna a URL completa da imagem.
 * Suporta tanto URLs absolutas quanto relativas ao backend.
 *
 * @param {string} url - Caminho da imagem ou URL absoluta.
 * @returns {string} - URL final da imagem.
 */
const getImageSrc = (url) => {
  if (!url) return '';

  const base = (process.env.REACT_APP_BASE_URL_ESTOQUE || '').replace(/\/+$/, '');
  const cleaned = String(url).trim();

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }

  if (cleaned.startsWith('/storage') || cleaned.startsWith('storage/')) {
    const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    return base ? `${base}${path}` : path;
  }

  if (cleaned.startsWith('/uploads') || cleaned.startsWith('uploads/') || cleaned.includes('/uploads/')) {
    const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    return base ? `${base}${path}` : path;
  }

  const legacy = `/uploads/produtos/${cleaned.replace(/^\/+/, '')}`;
  return base ? `${base}${legacy}` : legacy;
};

export default getImageSrc;
