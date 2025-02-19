import './index.scss';

import { InsightsDiscoverPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new InsightsDiscoverPlugin();
}
export { InsightsDiscoverPluginSetup, InsightsDiscoverPluginStart } from './types';
