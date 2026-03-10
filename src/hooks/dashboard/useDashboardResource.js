import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const allowCompare = options.allowCompare ?? false;
  const normalizeResponse = options.normalizeResponse;

  const [filters, setFilters] = useState({ ...defaultFilters, ...(options.initialFilters || {}) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const buildParams = useCallback((override = {}) => {
    const params = {
      ...filters,
      ...override,
    };

    if (!allowCompare) {
      delete params.compare;
    }

    return params;
  }, [allowCompare, filters]);

  const applyResponse = useCallback((response) => {
    const payload = response?.data ?? null;
    return typeof normalizeResponse === 'function'
      ? normalizeResponse(payload)
      : payload;
  }, [normalizeResponse]);

  const fetchData = useCallback(async (override = {}) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher(buildParams(override));

      if (requestId === requestIdRef.current) {
        setData(applyResponse(response));
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [applyResponse, buildParams, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
