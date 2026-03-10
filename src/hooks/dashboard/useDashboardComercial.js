import useDashboardResource from './useDashboardResource';

export default function useDashboardComercial(fetcher, initialFilters = {}) {
  return useDashboardResource(fetcher, {
    allowCompare: true,
    initialFilters,
  });
}
