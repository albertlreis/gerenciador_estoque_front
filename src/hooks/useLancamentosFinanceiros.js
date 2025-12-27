import { useCallback, useMemo, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';
import { toIsoDate } from '../utils/date/dateHelpers';
import { ensureArray } from '../utils/array/ensureArray';

const pickNumber = (v, fallback) => {
  const raw = Array.isArray(v) ? v[v.length - 1] : v; // se vier [25,25], pega o último
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

export function useLancamentosFinanceiros(filtros) {
  const [lista, setLista] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 25, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);

  const mapFiltrosApi = useMemo(() => (f) => ({
    q: f?.q || undefined,
    tipo: f?.tipo || undefined,
    status: f?.status || undefined,
    categoria_id: f?.categoria_id || undefined,
    conta_id: f?.conta_id || undefined,
    data_inicio: f?.periodo?.[0] ? toIsoDate(f.periodo[0]) : undefined,
    data_fim: f?.periodo?.[1] ? toIsoDate(f.periodo[1]) : undefined,
    order_by: f?.order_by || 'data_movimento',
    order_dir: f?.order_dir || 'desc',
    per_page: f?.per_page || undefined,
  }), []);

  const fetchLancamentos = useCallback(async (page = 1, override = filtros) => {
    setLoading(true);
    try {
      const params = { ...mapFiltrosApi(override), page };
      const { data } = await apiFinanceiro.get('/financeiro/lancamentos', { params });

      // ✅ garante array sempre
      setLista(ensureArray(data?.data));

      // ✅ normaliza meta (suporta meta padrão do Laravel e o seu)
      const m = data?.meta || {};
      setMeta({
        page: pickNumber(m.page ?? m.current_page, 1),
        per_page: pickNumber(m.per_page, override?.per_page ?? 25),
        total: pickNumber(m.total, 0),
        last_page: pickNumber(m.last_page, 1),
      });
    } finally {
      setLoading(false);
    }
  }, [filtros, mapFiltrosApi]);

  return { lista, meta, loading, fetchLancamentos, mapFiltrosApi };
}
