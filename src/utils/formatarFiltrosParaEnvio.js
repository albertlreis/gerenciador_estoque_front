import { normalizarBuscaProduto } from './normalizarBuscaProduto';

export const formatarFiltrosParaEnvio = (filtros) => {
  const obj = {
    nome: normalizarBuscaProduto(filtros.nome) ?? null,
    id_categoria: filtros.categoria,
    ativo: filtros.ativo,
    is_outlet: filtros.outlet,
    estoque_status: filtros.estoque_status,
    ...Object.entries(filtros.atributos || {}).reduce((acc, [chave, valores]) => {
      acc[`atributos[${chave}]`] = valores;
      return acc;
    }, {})
  };

  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === '' || (Array.isArray(obj[key]) && obj[key].length === 0)) {
      delete obj[key];
    }
  });

  return obj;
};
