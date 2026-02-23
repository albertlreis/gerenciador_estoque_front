import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const listarAniversarios = ({ tipo = 'todos', dias = 7 } = {}) =>
  apiEstoque.get(ESTOQUE_ENDPOINTS.aniversarios.base, {
    params: { tipo, dias },
  });

