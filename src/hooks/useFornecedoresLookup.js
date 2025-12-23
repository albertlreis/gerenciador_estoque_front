import { useCallback, useRef, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';

export function useFornecedoresLookup() {
  const cacheRef = useRef(new Map()); // key => list
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query = '') => {
    const q = (query || '').trim();
    const key = `q=${q}`;
    if (cacheRef.current.has(key)) return cacheRef.current.get(key);

    setLoading(true);
    try {
      // sua rota é /fornecedores (v1/fornecedores no backend, mas no front o apiFinanceiro já deve ter baseURL /v1)
      const { data } = await apiFinanceiro.get('/fornecedores', {
        params: { q: q || undefined, per_page: 15, page: 1 }
      });

      // pode vir como paginator puro ou {data, meta}. vamos cobrir:
      const rows = data?.data?.data || data?.data || [];
      const list = (rows || []).map((f) => ({
        label: f.nome,
        value: f.id,
        raw: f,
      }));

      cacheRef.current.set(key, list);
      return list;
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, loading };
}
