/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import {
  DATA_PREPPER_SERVICE_INDEX_NAME,
  JAEGER_SERVICE_INDEX_NAME,
} from 'common/constants/trace_analytics';
import { None } from 'vega';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

import { swallowErrors } from '../../utils/utils';
import {
  getDashboardQuery,
  getIndexName,
  getServicesQuery,
  getTracesQuery,
} from './trace_tools/queries';
import { ServiceObject } from '../../../../public/components/trace_analytics/components/common/plots/service_map';

export class TracesTools extends PluginToolsFactory {
  static TOOL_NAMES = {
    TRACE_GROUPS: 'Get trace groups',
    SERVICES: 'Get trace services',
    TRACES: 'Get traces',
  } as const;

  toolsList = [
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACE_GROUPS,
      description:
        'Use this to get information about each trace group. The key is the name of the trace group, the doc_count is the number of spans, the trace_count is the number of traces, the average latency is measured in milliseconds, and the error rate is the percentage of traces with errors. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getTraceGroupsQuery()),
    }),
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.SERVICES,
      description:
        'Use this to get information about each service. The key is the name of the service, the average latency is measured in milliseconds, the error rate is the percentage of spans in that service with errors, the throughput is the number of traces through that service, and the trace_count is the number of traces. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getServicesQuery().then()),
    }),
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACES,
      description:
        'Use this to get information about each trace. The key is the ID of the trace. The doc_count is the number of spans in that particular trace. The latency is measured in ms. If the error count is not 0, that trace had an error. The trace group is what trace group the trace belongs to. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getTracesQuery().then()),
    }),
  ];

  public async getTraceGroupsQuery() {
    const indexName = getIndexName(this.opensearchClient);
    const query = getDashboardQuery(await indexName);
    try {
      const traceGroupsResponse = await this.observabilityClient.callAsCurrentUser('search', {
        body: JSON.stringify(query),
      });
      console.log(traceGroupsResponse.aggregations.trace_group_name.buckets);
      return JSON.stringify(traceGroupsResponse.aggregations.trace_group_name.buckets);
    } catch (error) {
      return 'error in running trace groups query' + error;
    }
  }

  public async getServicesQuery() {
    const indexName = getIndexName(this.opensearchClient);
    const DSL = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    const map: ServiceObject = {};
    const query = getServicesQuery([], map, 'data_prepper');
    console.log(JSON.stringify(query));
    try {
      const servicesResponse = await this.observabilityClient.callAsCurrentUser('search', {
        body: JSON.stringify(query),
      });
      console.log(servicesResponse.aggregations.service_name.buckets);
      return JSON.stringify(servicesResponse.aggregations.service_name.buckets);
    } catch (error) {
      return 'error in running trace groups query' + error;
    }
  }

  public async getTracesQuery() {
    const indexName = getIndexName(this.opensearchClient);

    const query = getTracesQuery('data_prepper', '');
    console.log(JSON.stringify(query));
    try {
      const tracesResponse = await this.observabilityClient.callAsCurrentUser('search', {
        body: JSON.stringify(query),
      });
      console.log(tracesResponse);
      console.log(tracesResponse.aggregations.traces.buckets);
      return JSON.stringify(tracesResponse.aggregations.traces.buckets);
    } catch (error) {
      return 'error in running trace groups query' + error;
    }
  }
}
