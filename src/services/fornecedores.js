import apiEstoque from '../services/apiEstoque';

export async function listarFornecedores(params = {}, config = {}) {
  const qp = { ...params };
  if (typeof qp.with_trashed === 'boolean') {
    qp.with_trashed = qp.with_trashed ? 1 : undefined;
  }

  const { data } = await apiEstoque.get('/fornecedores', { params: qp, ...config });
  const items = data?.data ?? data;
  const meta  = data?.meta ?? {};
  return { items, meta };
}

export async function obterFornecedor(id) {
  const { data } = await apiEstoque.get(`/fornecedores/${id}`);
  return data?.data ?? data;
}

export async function criarFornecedor(payload) {
  const { data } = await apiEstoque.post('/fornecedores', payload);
  return data?.data ?? data;
}

export async function atualizarFornecedor(id, payload) {
  const { data } = await apiEstoque.put(`/fornecedores/${id}`, payload);
  return data?.data ?? data;
}

export async function excluirFornecedor(id) {
  const { data } = await apiEstoque.delete(`/fornecedores/${id}`);
  return data;
}

export async function restaurarFornecedor(id) {
  const { data } = await apiEstoque.patch(`/fornecedores/${id}/restaurar`);
  return data?.data ?? data;
}

export function normalizeCNPJ(v) {
  if (!v) return null;
  const only = String(v).replace(/\D+/g, '');
  return only || null;
}

export function formatCNPJ(v) {
  const s = (v ?? '').toString().replace(/\D+/g, '');
  if (s.length !== 14) return v ?? '';
  return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
