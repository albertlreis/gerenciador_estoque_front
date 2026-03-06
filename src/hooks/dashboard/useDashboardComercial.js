import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboardSeriesComercial } from '../../services/dashboard';

const defaultFilters = {
  period: 'month',
  compare: 1,
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

export default function useDashboardComercial(profileFetcher, initialFilters = {}) {
  const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (override = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { ...filters, ...override };
      const [profileResponse, seriesResponse] = await Promise.all([
        profileFetcher(params),
        getDashboardSeriesComercial(params),
      ]);

      const profileData = profileResponse?.data || {};
      const seriesData = seriesResponse?.data?.series || profileData.series || {};

      setData({
        ...profileData,
        series: seriesData,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, profileFetcher]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileResponse, seriesResponse] = await Promise.all([
          profileFetcher(filters),
          getDashboardSeriesComercial(filters),
        ]);

        if (!mounted) return;

        const profileData = profileResponse?.data || {};
        const seriesData = seriesResponse?.data?.series || profileData.series || {};

        setData({
          ...profileData,
          series: seriesData,
        });
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
  }, [filters, profileFetcher]);

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
