export const formatarReal = (valor = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export const formatarDataParaISO = (data) => {
  if (!data) return undefined;
  return new Date(data).toISOString().split('T')[0];
};
