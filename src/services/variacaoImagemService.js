import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const obterImagemVariacao = (variacaoId) =>
  apiEstoque.get(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));

const montarFormDataImagem = (arquivo) => {
  const formData = new FormData();
  formData.append('imagem', arquivo);
  return formData;
};

export const salvarImagemVariacao = (variacaoId, arquivo) =>
  apiEstoque.post(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId), montarFormDataImagem(arquivo));

export const atualizarImagemVariacao = (variacaoId, arquivo) =>
  apiEstoque.put(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId), montarFormDataImagem(arquivo));

export const removerImagemVariacao = (variacaoId) =>
  apiEstoque.delete(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));
