export const PRIORIDADES = [
  { label: "Baixa", value: "baixa" },
  { label: "Média", value: "media" },
  { label: "Alta", value: "alta" },
  { label: "Crítica", value: "critica" },
];

export const STATUS_OPTIONS = [
  { label: "Aberto", value: "aberto" },
  { label: "Em análise", value: "em_analise" },
  { label: "Enviado assistência", value: "enviado_assistencia" },
  { label: "Em orçamento", value: "em_orcamento" },
  { label: "Em reparo", value: "em_reparo" },
  { label: "Retornado", value: "retornado" },
  { label: "Finalizado", value: "finalizado" },
  { label: "Cancelado", value: "cancelado" },
];

export function statusSeverity(status) {
  switch (status) {
    case "aberto":
    case "em_analise":
      return "info";
    case "enviado_assistencia":
    case "em_orcamento":
    case "em_reparo":
      return "warning";
    case "retornado":
    case "finalizado":
      return "success";
    case "cancelado":
      return "danger";
    default:
      return "secondary";
  }
}

export function toYmd(date) {
  if (!date) return null;
  try {
    return date.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}
