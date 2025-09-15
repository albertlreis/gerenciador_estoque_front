import apiEstoque from '../services/apiEstoque';

export async function listarParceiros(params = {}, config = {}) {
  const qp = { ...params };
  if (typeof qp.with_trashed === 'boolean') {
    // back espera boolean; mandaremos 'true'/'false' quando marcado
    qp.with_trashed = qp.with_trashed ? true : undefined;
  }
  const { data } = await apiEstoque.get('/parceiros', { params: qp, ...config });
  const items = data?.data ?? data;
  const meta  = data?.meta ?? {};
  return { items, meta };
}

export async function obterParceiro(id) {
  const { data } = await apiEstoque.get(`/parceiros/${id}`);
  return data?.data ?? data;
}

export async function criarParceiro(payload) {
  const { data } = await apiEstoque.post('/parceiros', payload);
  return data?.data ?? data;
}

export async function atualizarParceiro(id, payload) {
  const { data } = await apiEstoque.put(`/parceiros/${id}`, payload);
  return data?.data ?? data;
}

export async function excluirParceiro(id) {
  const { data } = await apiEstoque.delete(`/parceiros/${id}`);
  return data;
}

export async function restaurarParceiro(id) {
  const { data } = await apiEstoque.post(`/parceiros/${id}/restore`);
  return data?.data ?? data;
}

export function normalizeDocumento(v) {
  if (!v) return null;
  const only = String(v).replace(/\D+/g, '');
  return only || null;
}

export function formatDocumento(v) {
  const s = (v ?? '').toString().replace(/\D+/g, '');
  if (s.length === 11) {
    return s.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4'); // CPF
  }
  if (s.length === 14) {
    return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'); // CNPJ
  }
  return v ?? '';
}
