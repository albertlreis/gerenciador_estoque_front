import useDashboardComercial from './useDashboardComercial';
import { getDashboardVendedor } from '../../services/dashboard';

export default function useDashboardVendedor() {
  return useDashboardComercial(getDashboardVendedor, {
    period: 'month',
    compare: 1,
  });
}
