import { getDashboardProfileKey } from './homeConfig';

export default function getHomeProfile(user) {
  return getDashboardProfileKey(user);
}
