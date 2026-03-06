import { useCallback, useEffect, useMemo, useState } from 'react';

const defaultFilters = {
  period: 'month',
  compare: 0,
  inicio: null,
  fim: null,
  deposito_id: null,
};

const getNumericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const hasMeaningfulData = (response) => {
  if (!response) return false;

  const kpis = response.kpis || {};
  const kpiValues = Object.values(kpis).map((kpi) => getNumericValue(kpi?.value ?? kpi));
  const hasKpi = kpiValues.some((value) => value > 0);

  const pendencias = response.pendencias || {};
  const hasPendencias = Object.values(pendencias).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return Object.values(value).some((nested) => getNumericValue(nested) > 0);
    }
    return getNumericValue(value) > 0;
  });

  const series = response.series || {};
  const hasSeries = [series.pedidos_serie, series.faturamento_serie].some((serie) => Array.isArray(serie) && serie.length > 0);

  return hasKpi || hasPendencias || hasSeries;
};

export default function useDashboardResource(fetcher, options = {}) {
  const [filters, setFilters] = useState({ ...defaultFilters, ...(options.initialFilters || {}) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (override = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        ...override,
      };

      if (!options.allowCompare) {
        delete params.compare;
      }

      const response = await fetcher(params);
      setData(response?.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, filters, options.allowCompare]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = { ...filters };
        if (!options.allowCompare) {
          delete params.compare;
        }

        const response = await fetcher(params);
        if (mounted) {
          setData(response?.data ?? null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetcher, filters, options.allowCompare]);

  const refresh = useCallback(() => fetchData({ fresh: 1 }), [fetchData]);

  const empty = useMemo(() => !loading && !error && !hasMeaningfulData(data), [data, error, loading]);

  return {
    data,
    loading,
    error,
    empty,
    filters,
    setFilters,
    refresh,
    refetch: fetchData,
  };
}
