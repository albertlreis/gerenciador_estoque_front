import { useCallback, useRef, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';
import { ensureArray } from '../utils/array/ensureArray';

const cleanParams = (obj) => {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    out[k] = v;
  });
  return out;
};

export function useContasPagar() {
  const [lista, setLista] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  // aqui a gente guarda SEMPRE os filtros já no formato da API (busca/data_ini/etc)
  const filtrosRef = useRef({});

  const fetchContas = useCallback(async (page = 1, overrideFilters) => {
    setLoading(true);
    try {
      if (overrideFilters) {
        filtrosRef.current = { ...filtrosRef.current, ...overrideFilters };
      }

      const params = cleanParams({ page, per_page: 10, ...filtrosRef.current });
      const { data } = await apiFinanceiro.get('/financeiro/contas-pagar', { params });

      setLista(ensureArray(data?.data));
      setTotal(Number(data?.meta?.total ?? data?.total ?? 0) || 0);
      setPagina(page);
    } finally {
      setLoading(false);
    }
  }, []);

  return { lista, total, pagina, loading, fetchContas, filtrosRef };
}
