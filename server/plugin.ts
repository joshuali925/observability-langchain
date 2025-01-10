/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { OsisIntegrationPluginSetup, OsisIntegrationPluginStart } from './types';
import { defineRoutes } from './routes';

export class OsisIntegrationPlugin
  implements Plugin<OsisIntegrationPluginSetup, OsisIntegrationPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    const router = core.http.createRouter();

    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
