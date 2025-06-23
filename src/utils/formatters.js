export const formatarReal = (valor = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export const formatarDataParaISO = (data) => {
  if (!data) return undefined;
  return new Date(data).toISOString().split('T')[0];
};

export const formatarValor = (valor) => {
  if (isNaN(valor)) return 'R$ 0,00';
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatarDataIsoParaBR = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR');
};

export const formatarNumero = (numero, casas = 2) => {
  return Number(numero).toFixed(casas).replace('.', ',');
};
