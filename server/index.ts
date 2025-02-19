import { PluginInitializerContext } from '../../../src/core/server';
import { InsightsDiscoverPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new InsightsDiscoverPlugin(initializerContext);
}

export { InsightsDiscoverPluginSetup, InsightsDiscoverPluginStart } from './types';
