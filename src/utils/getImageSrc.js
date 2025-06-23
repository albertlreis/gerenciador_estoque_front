/**
 * Retorna a URL completa da imagem.
 * Suporta tanto URLs absolutas quanto relativas ao backend.
 *
 * @param {string} url - Caminho da imagem ou URL absoluta.
 * @returns {string} - URL final da imagem.
 */
const getImageSrc = (url) => {
  if (!url) return '';
  return url.startsWith('http')
    ? url
    : `${process.env.REACT_APP_BASE_URL_ESTOQUE}/uploads/produtos/${url}`;
};

export default getImageSrc;
