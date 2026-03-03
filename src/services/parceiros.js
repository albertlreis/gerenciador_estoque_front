import apiEstoque from '../services/apiEstoque';

const TIPOS_CONTATO_VALIDOS = ['email', 'telefone', 'outro'];

function normalizeEmail(value) {
  const v = String(value ?? '').trim().toLowerCase();
  return v || null;
}

function normalizeTelefone(value) {
  const v = String(value ?? '').trim();
  return v || null;
}

function normalizeContato(contato = {}) {
  const tipo = String(contato.tipo ?? '').trim().toLowerCase();
  if (!TIPOS_CONTATO_VALIDOS.includes(tipo)) return null;

  const valorRaw = String(contato.valor ?? '').trim();
  if (!valorRaw) return null;

  const valor = tipo === 'email' ? normalizeEmail(valorRaw) : valorRaw;
  if (!valor) return null;

  return {
    tipo,
    valor,
    valor_e164: contato.valor_e164 ?? null,
    rotulo: contato.rotulo ?? null,
    principal: !!contato.principal,
    observacoes: contato.observacoes ?? null,
  };
}

function ensureSinglePrincipalPerTipo(contatos = []) {
  const byType = new Map();
  contatos.forEach((c, i) => {
    const arr = byType.get(c.tipo) || [];
    arr.push(i);
    byType.set(c.tipo, arr);
  });

  byType.forEach((indexes) => {
    let principalIndex = indexes.find((idx) => contatos[idx].principal);
    if (principalIndex === undefined) principalIndex = indexes[0];
    indexes.forEach((idx) => {
      contatos[idx].principal = idx === principalIndex;
    });
  });

  return contatos;
}

function mergeLegacyRootIntoContatos(payload = {}) {
  const contatosInput = Array.isArray(payload.contatos) ? payload.contatos : [];
  const contatos = contatosInput
    .map((c) => normalizeContato(c))
    .filter(Boolean);

  const rootEmail = normalizeEmail(payload.email);
  if (rootEmail) {
    const idx = contatos.findIndex((c) => c.tipo === 'email' && c.valor === rootEmail);
    if (idx >= 0) {
      contatos[idx].principal = true;
    } else {
      contatos.push({ tipo: 'email', valor: rootEmail, principal: true, rotulo: 'principal', valor_e164: null, observacoes: null });
    }
  }

  const rootTelefone = normalizeTelefone(payload.telefone);
  if (rootTelefone) {
    const idx = contatos.findIndex((c) => c.tipo === 'telefone' && c.valor === rootTelefone);
    if (idx >= 0) {
      contatos[idx].principal = true;
    } else {
      contatos.push({ tipo: 'telefone', valor: rootTelefone, principal: true, rotulo: 'principal', valor_e164: null, observacoes: null });
    }
  }

  return ensureSinglePrincipalPerTipo(contatos);
}

function pickRootByTipo(contatos = [], tipo) {
  const contatosTipo = contatos.filter((c) => c.tipo === tipo);
  if (!contatosTipo.length) return null;

  const principal = contatosTipo.find((c) => c.principal);
  return (principal || contatosTipo[0])?.valor ?? null;
}

function normalizeParceiroResponse(item = {}) {
  const contatos = (Array.isArray(item.contatos) ? item.contatos : [])
    .map((c) => normalizeContato(c))
    .filter(Boolean);

  const email = item.email ?? pickRootByTipo(contatos, 'email');
  const telefone = item.telefone ?? pickRootByTipo(contatos, 'telefone');

  return {
    ...item,
    email: email || '',
    telefone: telefone || '',
    contatos,
    consultor_nome: item.consultor_nome ?? '',
    nivel_fidelidade: item.nivel_fidelidade ?? '',
  };
}

function mapParceiroPayload(payload = {}) {
  const contatos = mergeLegacyRootIntoContatos(payload);
  const email = pickRootByTipo(contatos, 'email');
  const telefone = pickRootByTipo(contatos, 'telefone');

  return {
    ...payload,
    email: email || null,
    telefone: telefone || null,
    contatos,
    documento: normalizeDocumento(payload.documento),
  };
}

export async function listarParceiros(params = {}, config = {}) {
  const qp = { ...params };
  if (typeof qp.with_trashed === 'boolean') {
    qp.with_trashed = qp.with_trashed ? true : undefined;
  }
  const { data } = await apiEstoque.get('/parceiros', { params: qp, ...config });
  const items = (data?.data ?? data ?? []).map((item) => normalizeParceiroResponse(item));
  const meta = data?.meta ?? {};
  return { items, meta };
}

export async function obterParceiro(id) {
  const { data } = await apiEstoque.get(`/parceiros/${id}`);
  return normalizeParceiroResponse(data?.data ?? data ?? {});
}

export async function criarParceiro(payload) {
  const { data } = await apiEstoque.post('/parceiros', mapParceiroPayload(payload));
  return normalizeParceiroResponse(data?.data ?? data ?? {});
}

export async function atualizarParceiro(id, payload) {
  const { data } = await apiEstoque.put(`/parceiros/${id}`, mapParceiroPayload(payload));
  return normalizeParceiroResponse(data?.data ?? data ?? {});
}

export async function excluirParceiro(id) {
  const { data } = await apiEstoque.delete(`/parceiros/${id}`);
  return data;
}

export async function restaurarParceiro(id) {
  const { data } = await apiEstoque.patch(`/parceiros/${id}/restaurar`);
  return normalizeParceiroResponse(data?.data ?? data ?? {});
}

export function normalizeDocumento(v) {
  if (!v) return null;
  const only = String(v).replace(/\D+/g, '');
  return only || null;
}

export function formatDocumento(v) {
  const s = (v ?? '').toString().replace(/\D+/g, '');
  if (s.length === 11) {
    return s.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  if (s.length === 14) {
    return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  return v ?? '';
}
