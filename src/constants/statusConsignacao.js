export const STATUS_CONSIGNACAO = {
  pendente: { label: 'Pendente', color: 'warning' },
  comprado: { label: 'Comprado', color: 'success' },
  devolvido: { label: 'Devolvido', color: 'info' },
  parcial:  { label: 'Parcial', color: 'secondary' },
  vencido:  { label: 'Vencido', color: 'danger' },
};

export const STATUS_CONSIGNACAO_OPTIONS = Object.entries(STATUS_CONSIGNACAO).map(([value, { label }]) => ({
  label,
  value,
}));
