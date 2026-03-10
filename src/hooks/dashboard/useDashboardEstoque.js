import useDashboardResource from './useDashboardResource';
import { getDashboardEstoque } from '../../services/dashboard';

export default function useDashboardEstoque() {
  return useDashboardResource(getDashboardEstoque, {
    allowCompare: false,
    initialFilters: { period: '7d' },
  });
}
