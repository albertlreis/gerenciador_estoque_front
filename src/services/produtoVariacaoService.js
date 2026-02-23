import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const patchProdutoVariacao = (variacaoId, payload) =>
  apiEstoque.patch(ESTOQUE_ENDPOINTS.produtoVariacoes.byId(variacaoId), payload);

