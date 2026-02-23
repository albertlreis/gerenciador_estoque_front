export const AUDITORIA_MODULOS = [
  { label: 'Catalogo', value: 'catalogo' },
  { label: 'Pedidos', value: 'pedidos' },
  { label: 'Estoque', value: 'estoque' },
  { label: 'Financeiro', value: 'financeiro' },
];

export const AUDITORIA_ACOES = [
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'STATUS_CHANGE', value: 'STATUS_CHANGE' },
  { label: 'CANCEL', value: 'CANCEL' },
  { label: 'REVERSAL', value: 'REVERSAL' },
  { label: 'ATTACH', value: 'ATTACH' },
  { label: 'DETACH', value: 'DETACH' },
  { label: 'IMPORT', value: 'IMPORT' },
  { label: 'EXPORT', value: 'EXPORT' },
];

export const AUDITORIA_TIPOS_ENTIDADE = [
  { label: 'Produto', value: 'Produto' },
  { label: 'ProdutoVariacao', value: 'ProdutoVariacao' },
  { label: 'Pedido', value: 'Pedido' },
  { label: 'EstoqueMovimentacao', value: 'EstoqueMovimentacao' },
  { label: 'ContaPagar', value: 'ContaPagar' },
  { label: 'ContaReceber', value: 'ContaReceber' },
  { label: 'LancamentoFinanceiro', value: 'LancamentoFinanceiro' },
];

const ACTION_SEVERITY = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  STATUS_CHANGE: 'warning',
  CANCEL: 'danger',
  REVERSAL: 'warning',
  ATTACH: 'secondary',
  DETACH: 'secondary',
  IMPORT: 'info',
  EXPORT: 'help',
};

export const getAcaoSeverity = (acao) => ACTION_SEVERITY[acao] || 'secondary';

const normalizarData = (value) => {
  if (!value) return null;
  const data = value instanceof Date ? value : new Date(value);
  return Number.isNaN(data.getTime()) ? null : data;
};

export const formatarDataHoraAuditoria = (value) => {
  const data = normalizarData(value);
  if (!data) return '-';

  return data.toLocaleString('pt-BR', {
    hour12: false,
  });
};

export const toApiDate = (value) => {
  const data = normalizarData(value);
  if (!data) return null;

  const year = data.getFullYear();
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const day = String(data.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseJsonSafe = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

export const formatarValorAuditoria = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const parsed = parseJsonSafe(value);
  if (parsed === null || parsed === undefined || parsed === '') return '-';

  if (typeof parsed === 'object') {
    try {
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(parsed);
};
