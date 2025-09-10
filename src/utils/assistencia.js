export const PRIORIDADES = [
  { label: "Baixa", value: "baixa" },
  { label: "Média", value: "media" },
  { label: "Alta", value: "alta" },
  { label: "Crítica", value: "critica" },
];

export const STATUS_OPTIONS = [
  { label: "Aberto", value: "aberto" },
  { label: "Aguardando Resposta da Fábrica", value: "aguardando_resposta_fabrica" },
  { label: "Aguardando Peça", value: "aguardando_peca" },
  { label: "Enviado à Fábrica", value: "enviado_fabrica" },
  { label: "Em Trânsito (Fábrica → Depósito)", value: "em_transito_retorno" },
  { label: "Aguardando Reparo", value: "aguardando_reparo" },
  { label: "Reparo Concluído", value: "reparo_concluido" },
  { label: "Entregue", value: "entregue" },
  { label: "Cancelado", value: "cancelado" },
];

/**
 * Retorna o rótulo amigável do status (label) a partir do value armazenado.
 * @param {string} status
 * @returns {string}
 */
export function statusLabel(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status ?? '—';
}

/**
 * Sugere a severidade do Tag conforme o status.
 * @param {string} status
 * @returns {"info"|"warning"|"success"|"danger"|"secondary"}
 */
export function statusSeverity(status) {
  switch (status) {
    case "aberto":
      return "info";
    case "aguardando_resposta_fabrica":
    case "aguardando_peca":
    case "enviado_fabrica":
    case "em_transito_retorno":
    case "aguardando_reparo":
      return "warning";
    case "reparo_concluido":
    case "entregue":
      return "success";
    case "cancelado":
      return "danger";
    default:
      return "secondary";
  }
}

export const LOCAIS_REPARO = [
  { label: "Depósito", value: "deposito" },
  { label: "Envio para Fábrica", value: "fabrica" },
  { label: "Casa do Cliente", value: "cliente" },
];

export const CUSTO_RESP = [
  { label: "Cliente", value: "cliente" },
  { label: "Loja", value: "loja" },
];

/**
 * Converte Date para YYYY-MM-DD.
 * @param {Date|null|undefined} date
 * @returns {string|null}
 */
export function toYmd(date) {
  if (!date) return null;
  try {
    return date.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}
