import apiEstoque from './apiEstoque';

const BASE_PATH = '/auditoria';

export const listarEventos = (params = {}, config = {}) =>
  apiEstoque.get(`${BASE_PATH}/eventos`, {
    ...config,
    params,
  });

export const obterEvento = (id, config = {}) =>
  apiEstoque.get(`${BASE_PATH}/eventos/${id}`, config);

export const listarPorEntidade = (params = {}, config = {}) =>
  apiEstoque.get(`${BASE_PATH}/entidade`, {
    ...config,
    params,
  });

const auditoriaService = {
  listarEventos,
  obterEvento,
  listarPorEntidade,
};

export default auditoriaService;
