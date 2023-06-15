/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { initTools } from '../langchain/tools/tools_helper';
import { ILegacyClusterClient, IRouter } from '../../../../src/core/server';
import DSLFacet from '../services/facets/dsl_facet';
import PPLFacet from '../services/facets/ppl_facet';
import SavedObjectFacet from '../services/facets/saved_objects';
import QueryService from '../services/queryService';
import { registerAppAnalyticsRouter } from './application_analytics/app_analytics_router';
import { PanelsRouter } from './custom_panels/panels_router';
import { VisualizationsRouter } from './custom_panels/visualizations_router';
import { registerDslRoute } from './dsl';
import { registerEventAnalyticsRouter } from './event_analytics/event_analytics_router';
import { registerChatRoute } from './llm_chat/chat_router';
import { registerLangChainRoutes } from './llm_chat/langchain';
import { registerMetricsRoute } from './metrics/metrics_rounter';
import { registerNoteRoute } from './notebooks/noteRouter';
import { registerParaRoute } from './notebooks/paraRouter';
import { registerSqlRoute } from './notebooks/sqlRouter';
import { registerVizRoute } from './notebooks/vizRouter';
import { registerPplRoute } from './ppl';
import { registerTraceAnalyticsDslRouter } from './trace_analytics_dsl_router';
import { pluginAgentsInit } from '../langchain/agents/plugin_agents/plugin_helpers';
import { chatAgentInit } from '../langchain/agents/agent_helpers';

export function setupRoutes({ router, client }: { router: IRouter; client: ILegacyClusterClient }) {
  PanelsRouter(router);
  VisualizationsRouter(router);
  registerPplRoute({ router, facet: new PPLFacet(client) });
  registerDslRoute({ router, facet: new DSLFacet(client) });
  registerEventAnalyticsRouter({ router, savedObjectFacet: new SavedObjectFacet(client) });
  registerAppAnalyticsRouter(router);

  // TODO remove trace analytics route when DSL route for autocomplete is added
  registerTraceAnalyticsDslRouter(router);

  // notebooks routes
  registerParaRoute(router);
  registerNoteRoute(router);
  registerVizRoute(router);
  const queryService = new QueryService(client);
  registerSqlRoute(router, queryService);

  registerMetricsRoute(router);

  const pluginTools = initTools();
  const pluginAgentTools = pluginAgentsInit(pluginTools);
  const chatAgent = chatAgentInit(pluginAgentTools);

  registerChatRoute(router);
  registerLangChainRoutes(router);
}
