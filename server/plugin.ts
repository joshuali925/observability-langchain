/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { first } from 'rxjs/operators';
import 'web-streams-polyfill';
import { AssistantConfig } from '.';
import {
  CoreSetup,
  CoreStart,
  ILegacyClusterClient,
  Logger,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/server';
import { OpenSearchAlertingPlugin } from './adaptors/opensearch_alerting_plugin';
import { OpenSearchObservabilityPlugin } from './adaptors/opensearch_observability_plugin';
import { PPLPlugin } from './adaptors/ppl_plugin';
import { AssistantServerConfig } from './config/schema';
import './fetch-polyfill';
import { setupRoutes } from './routes/index';
import { chatSavedObject } from './saved_objects/chat_saved_object';
import { AssistantPluginSetup, AssistantPluginStart } from './types';

export class AssistantPlugin implements Plugin<AssistantPluginSetup, AssistantPluginStart> {
  private readonly logger: Logger;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public async setup(core: CoreSetup) {
    this.logger.debug('Assistant: Setup');
    const config = await this.initializerContext.config
      .create<AssistantConfig>()
      .pipe(first())
      .toPromise();
    const router = core.http.createRouter();
    const openSearchObservabilityClient: ILegacyClusterClient = core.opensearch.legacy.createClient(
      'opensearch_observability',
      {
        plugins: [PPLPlugin, OpenSearchObservabilityPlugin, OpenSearchAlertingPlugin],
      }
    );

    core.http.registerRouteHandlerContext('assistant_plugin', (context, request) => {
      return {
        config,
        logger: this.logger,
        observabilityClient: openSearchObservabilityClient,
      };
    });

    // Register server side APIs
    setupRoutes(router);

    core.savedObjects.registerType(chatSavedObject);
    core.capabilities.registerProvider(() => ({
      observability: {
        show: true,
      },
    }));

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('Observability: Started');
    return {};
  }

  public stop() {}
}
