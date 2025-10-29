import { useCallback, useMemo, useRef, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';


export function useContasPagar(filtrosIniciais = {}) {
  const [lista, setLista] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const filtrosRef = useRef(filtrosIniciais);


  const fetchContas = useCallback(async (page = 1, overrideFilters) => {
    setLoading(true);
    try {
      if (overrideFilters) filtrosRef.current = { ...filtrosRef.current, ...overrideFilters };
      const params = { page, per_page: 10, ...filtrosRef.current };
      const { data } = await apiFinanceiro.get('/contas-pagar', { params });
// paginator compatível com Resource::collection
      setLista(data?.data ?? []);
      setTotal(data?.meta?.total ?? data?.total ?? 0);
      setPagina(page);
    } finally {
      setLoading(false);
    }
  }, []);


  return { lista, total, pagina, setPagina, loading, fetchContas, filtrosRef };
}
