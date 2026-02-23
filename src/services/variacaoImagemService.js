import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const obterImagemVariacao = (variacaoId) =>
  apiEstoque.get(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));

export const salvarImagemVariacao = (variacaoId, payload) =>
  apiEstoque.post(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId), payload);

export const atualizarImagemVariacao = (variacaoId, payload) =>
  apiEstoque.put(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId), payload);

export const removerImagemVariacao = (variacaoId) =>
  apiEstoque.delete(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));

