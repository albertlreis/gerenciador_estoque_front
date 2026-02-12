import apiEstoque from './apiEstoque';
import { aplicarNormalizacaoBuscaProduto } from '../utils/normalizarBuscaProduto';

export const listarProdutos = (params = {}, config = {}) => {
  const paramsNormalizados = aplicarNormalizacaoBuscaProduto(params);

  return apiEstoque.get('/produtos', {
    ...config,
    params: paramsNormalizados,
  });
};
