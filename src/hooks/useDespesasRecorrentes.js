import { useCallback, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';

export function useDespesasRecorrentes(filtros) {
  const [lista, setLista] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);

  const mapFiltrosApi = useCallback((f) => {
    const params = {
      q: f?.q || undefined,
      status: f?.status || undefined,
      tipo: f?.tipo || undefined,
      frequencia: f?.frequencia || undefined,
      fornecedor_id: f?.fornecedor_id || undefined,
      categoria_id: f?.categoria_id || undefined,
      centro_custo_id: f?.centro_custo_id || undefined,
      data_inicio_de: f?.data_inicio_de || undefined,
      data_inicio_ate: f?.data_inicio_ate || undefined,
      per_page: f?.per_page || 25,
    };
    return params;
  }, []);

  const fetchDespesas = useCallback(async (page = 1, f = filtros) => {
    setLoading(true);
    try {
      const params = { ...mapFiltrosApi(f), page };
      const { data } = await apiFinanceiro.get('/financeiro/despesas-recorrentes', { params });

      // aceita tanto {data, meta} quanto paginator puro
      const rows = data?.data?.data || data?.data || data?.items || [];
      const m = data?.meta || data?.data?.meta || {
        current_page: data?.current_page,
        per_page: data?.per_page,
        total: data?.total,
        last_page: data?.last_page,
      };

      setLista(rows || []);
      setMeta({
        page: m?.current_page || page,
        per_page: m?.per_page || f?.per_page || 25,
        total: m?.total || 0,
        last_page: m?.last_page || 1,
      });
    } finally {
      setLoading(false);
    }
  }, [filtros, mapFiltrosApi]);

  return { lista, meta, loading, fetchDespesas, mapFiltrosApi };
}
