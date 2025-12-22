export const emptyEndereco = () => ({
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  principal: true,
});

export const normalizeDigits = (value) => String(value ?? '').replace(/\D/g, '');

export function buildInitialCliente(initialData = {}) {
  const enderecos =
    Array.isArray(initialData.enderecos) && initialData.enderecos.length > 0
      ? initialData.enderecos.map((e, idx) => ({
        ...emptyEndereco(),
        ...e,
        principal: idx === 0 ? !!e.principal : !!e.principal,
      }))
      : [emptyEndereco()];

  return ensureOnePrincipal({
    id: initialData.id ?? null,
    nome: initialData.nome || '',
    nome_fantasia: initialData.nome_fantasia || '',
    documento: initialData.documento || '',
    inscricao_estadual: initialData.inscricao_estadual || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    whatsapp: initialData.whatsapp || '',
    tipo: initialData.tipo || '',
    enderecos,
  });
}

export function normalizeClientePayload(cliente) {
  return {
    ...cliente,
    documento: normalizeDigits(cliente?.documento),
    enderecos: (cliente?.enderecos || []).map((ed) => ({
      ...ed,
      cep: normalizeDigits(ed?.cep),
      principal: !!ed?.principal,
    })),
  };
}

/** Endereços */
export function setPrincipal(enderecos, index) {
  return (enderecos || []).map((e, i) => ({ ...e, principal: i === index }));
}

export function addEndereco(enderecos) {
  const base = (enderecos || []).map((e) => ({ ...e, principal: false }));
  return [...base, { ...emptyEndereco(), principal: base.length === 0 }];
}

export function removeEndereco(enderecos, index) {
  const list = [...(enderecos || [])];
  list.splice(index, 1);
  if (list.length === 0) return [emptyEndereco()];
  return ensureOnePrincipalList(list);
}

export function ensureOnePrincipal(cliente) {
  return { ...cliente, enderecos: ensureOnePrincipalList(cliente?.enderecos || []) };
}

export function ensureOnePrincipalList(enderecos) {
  if (!enderecos.length) return [{ ...emptyEndereco(), principal: true }];
  if (enderecos.some((e) => !!e.principal)) return enderecos;
  return enderecos.map((e, i) => ({ ...e, principal: i === 0 }));
}

/** Field errors */
export const isInvalid = (fieldErrors, path) => !!fieldErrors?.[path];
export const getError = (fieldErrors, path) => fieldErrors?.[path] || '';
export function clearFieldError(fieldErrors, path) {
  if (!fieldErrors?.[path]) return fieldErrors || {};
  const clone = { ...(fieldErrors || {}) };
  delete clone[path];
  return clone;
}
