import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const listarAvisos = (params = {}) =>
  apiEstoque.get(ESTOQUE_ENDPOINTS.avisos.base, { params });

export const obterAviso = (id) =>
  apiEstoque.get(ESTOQUE_ENDPOINTS.avisos.byId(id));

export const criarAviso = (payload) =>
  apiEstoque.post(ESTOQUE_ENDPOINTS.avisos.base, payload);

export const atualizarAviso = (id, payload) =>
  apiEstoque.patch(ESTOQUE_ENDPOINTS.avisos.byId(id), payload);

export const removerAviso = (id) =>
  apiEstoque.delete(ESTOQUE_ENDPOINTS.avisos.byId(id));

export const marcarAvisoComoLido = (id) =>
  apiEstoque.post(ESTOQUE_ENDPOINTS.avisos.ler(id));

