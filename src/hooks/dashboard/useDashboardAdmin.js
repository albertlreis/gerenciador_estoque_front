import useDashboardComercial from './useDashboardComercial';
import { getDashboardAdmin } from '../../services/dashboard';

export default function useDashboardAdmin() {
  return useDashboardComercial(getDashboardAdmin, {
    period: 'month',
    compare: 1,
  });
}
