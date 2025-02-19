import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { InsightsDiscoverPluginSetup, InsightsDiscoverPluginStart } from './types';
import { defineRoutes } from './routes';

export class InsightsDiscoverPlugin
  implements Plugin<InsightsDiscoverPluginSetup, InsightsDiscoverPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('insights_discover: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('insights_discover: Started');
    return {};
  }

  public stop() {}
}
