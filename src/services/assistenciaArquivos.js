import apiEstoque from './apiEstoque';

/**
 * Monta FormData com múltiplos arquivos e campos extras.
 * @param {File[]} files
 * @param {Record<string, any>} [extra]
 * @returns {FormData}
 */
function buildFormData(files, extra = {}) {
  const fd = new FormData();
  files.forEach(f => fd.append('arquivos[]', f));
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  return fd;
}

/**
 * Lista arquivos de um chamado.
 * @param {number|string} chamadoId
 * @returns {Promise<Array>}
 */
export async function getChamadoArquivos(chamadoId) {
  const { data } = await apiEstoque.get(`/assistencias/chamados/${chamadoId}/arquivos`);
  return data?.data ?? data ?? [];
}

/**
 * Faz upload de fotos para um chamado.
 * @param {number|string} chamadoId
 * @param {File[]} files
 * @param {string} [tipo]
 * @returns {Promise<Array>}
 */
export async function uploadChamadoArquivos(chamadoId, files, tipo) {
  const form = buildFormData(files, { tipo });
  const { data } = await apiEstoque.post(
    `/assistencias/chamados/${chamadoId}/arquivos`,
    form
  );
  return data?.data ?? data ?? [];
}

/**
 * Lista arquivos de um item do chamado.
 * @param {number|string} itemId
 * @returns {Promise<Array>}
 */
export async function getItemArquivos(itemId) {
  const { data } = await apiEstoque.get(`/assistencias/itens/${itemId}/arquivos`);
  return data?.data ?? data ?? [];
}

/**
 * Faz upload de fotos para um item do chamado.
 * @param {number|string} itemId
 * @param {File[]} files
 * @param {string} [tipo]
 * @returns {Promise<Array>}
 */
export async function uploadItemArquivos(itemId, files, tipo) {
  const form = buildFormData(files, { tipo });
  const { data } = await apiEstoque.post(
    `/assistencias/itens/${itemId}/arquivos`,
    form
  );
  return data?.data ?? data ?? [];
}

/**
 * Remove um arquivo (apaga do storage e banco).
 * @param {number|string} arquivoId
 * @returns {Promise<void>}
 */
export async function deleteArquivo(arquivoId) {
  await apiEstoque.delete(`/assistencias/arquivos/${arquivoId}`);
}

/**
 * Retorna URL pública (já vem pronta do backend no resource).
 * Mantido por simetria e eventual transformação futura.
 * @param {{url:string}} arq
 * @returns {string}
 */
export function getArquivoUrl(arq) {
  return arq?.url ?? '';
}
