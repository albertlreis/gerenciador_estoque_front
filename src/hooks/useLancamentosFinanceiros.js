import { useCallback, useMemo, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';
import { toIsoDate } from '../utils/date/dateHelpers';

/**
 * Hook de listagem de lançamentos financeiros (index).
 * - paginação (page/per_page)
 * - filtros
 * - ordenação
 * - serialização de datas via toIsoDate (YYYY-MM-DD)
 */
export function useLancamentosFinanceiros(filtros) {
  const [lista, setLista] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);

  const mapFiltrosApi = useMemo(() => (f) => ({
    q: f?.q || undefined,
    tipo: f?.tipo || undefined,
    status: f?.status || undefined,
    atrasado: f?.atrasado ? true : undefined,
    categoria_id: f?.categoria_id || undefined,
    conta_id: f?.conta_id || undefined,
    data_inicio: f?.periodo?.[0] ? toIsoDate(f.periodo[0]) : undefined,
    data_fim: f?.periodo?.[1] ? toIsoDate(f.periodo[1]) : undefined,
    order_by: f?.order_by || undefined,
    order_dir: f?.order_dir || undefined,
    per_page: f?.per_page || undefined,
  }), []);

  const fetchLancamentos = useCallback(async (page = 1, override = filtros) => {
    setLoading(true);
    try {
      const params = { ...mapFiltrosApi(override), page };
      const { data } = await apiFinanceiro.get('/financeiro/lancamentos', { params });

      setLista(data?.data || []);
      setMeta(data?.meta || { page: 1, per_page: 25, total: 0, last_page: 1 });
    } finally {
      setLoading(false);
    }
  }, [filtros, mapFiltrosApi]);

  return { lista, meta, loading, fetchLancamentos, mapFiltrosApi };
}
