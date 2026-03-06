import apiEstoque from './apiEstoque';

const cleanParams = (params = {}) => {
  const payload = { ...params };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  return payload;
};

export const getDashboardAdmin = (params = {}) =>
  apiEstoque.get('/dashboard/admin', { params: cleanParams(params) });

export const getDashboardFinanceiro = (params = {}) =>
  apiEstoque.get('/dashboard/financeiro', { params: cleanParams(params) });

export const getDashboardEstoque = (params = {}) =>
  apiEstoque.get('/dashboard/estoque', { params: cleanParams(params) });

export const getDashboardVendedor = (params = {}) =>
  apiEstoque.get('/dashboard/vendedor', { params: cleanParams(params) });

export const getDashboardSeriesComercial = (params = {}) =>
  apiEstoque.get('/dashboard/series/comercial', { params: cleanParams(params) });
