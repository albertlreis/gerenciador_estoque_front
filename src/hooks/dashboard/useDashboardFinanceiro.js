import useDashboardResource from './useDashboardResource';
import { getDashboardFinanceiro } from '../../services/dashboard';

export default function useDashboardFinanceiro() {
  return useDashboardResource(getDashboardFinanceiro, {
    allowCompare: false,
    initialFilters: { period: 'month' },
  });
}
