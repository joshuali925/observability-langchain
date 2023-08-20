/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

import { swallowErrors } from '../../utils/utils';
import { getDashboardQuery, getIndexName } from './trace_tools/queries';

export class TracesTools extends PluginToolsFactory {
  static TOOL_NAMES = {
    TRACE_GROUPS: 'Get trace groups',
    SERVICES: 'Get trace services',
  } as const;

  toolsList = [
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACE_GROUPS,
      description:
        'Use this to get information about each trace group. The key is the name of the trace group, the doc_count is the number of spans, the trace_count is the number of traces, the average latency is measured in milliseconds, and the error rate is the percentage of traces with errors. You can specify a start and end time, formatted in %',
      func: swallowErrors(async () => this.getTraceGroupsQuery()),
    }),
    // new DynamicTool({
    //   name: TracesTools.TOOL_NAMES.SERVICES,
    //   description:
    //     'Use this to get information about each service in the system of traces. The key is the name of the service, the average latency is measured in milliseconds, the error rate is the percentage of spans in that service with errors, the throughput is the number of traces through that service, and the trace_count is the number of traces',
    //   func: swallowErrors(async () => this.getServicesQuery().then()),
    // }),
  ];

  public async getTraceGroupsQuery() {
    const indexName = getIndexName(this.opensearchClient);
    const query = getDashboardQuery(await indexName);
    try {
      const traceGroupsResponse = await this.observabilityClient.callAsCurrentUser('search', {
        body: query,
      });
      console.log(traceGroupsResponse.aggregations.trace_group_name.buckets);
      return JSON.stringify(traceGroupsResponse.aggregations.trace_group_name.buckets);
    } catch (error) {
      return 'error in running trace groups query' + error;
    }
  }

  public async getServicesQuery() {}
}
