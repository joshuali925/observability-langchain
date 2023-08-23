/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

import { flatten, jsonToCsv, swallowErrors } from '../../utils/utils';
import { getDashboardQuery, getIndexName, getTracesQuery } from './trace_tools/queries';

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
        'Use this to get information about each trace group. The tool response includes the key, doc_count, average_latency.value, trace_count.value, error_count.doc_count, error_count.trace_count.value, and error_rate.value. The key is the name of the trace group, the doc_count is the number of spans, the average_latency.value is the average latency of the trace group, measured in milliseconds. The trace_count.value is the number of traces in the trace group. The error_count.doc_count is the number of spans in the trace groups with errors, while the error_count.trace_count.value is the number of different traces in the trace group with errors. The error_rate.value is the percentage of traces in the trace group that has at least one error. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getTraceGroups()),
    }),
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACES,
      description:
        'Use this to get information about each trace. The tool response includes the key, doc_count, last_updated.value, last_updated.value_as_string, error_count.doc_count, trace_group.doc_count_error_upper_bound, trace_group.sum_other_doc_count, trace_group.buckets.1.key, and trace_groups.buckets.1.doc_count. The key is the ID of the trace. The doc_count is the number of spans in that particular trace. The last_updated.value_as_string is the last time that the trace was updated. The error_count.doc_count is how many spans in that trace has errors. The trace group is what trace group the trace belongs to. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getTraces()),
    }),
  ];

  public async getTraceGroups() {
    const indexName = await getIndexName(this.opensearchClient);
    const query = getDashboardQuery();
    const traceGroupsResponse = await this.observabilityClient.callAsCurrentUser('search', {
      body: JSON.stringify(query),
    });
    const traceGroups = traceGroupsResponse.aggregations.trace_group_name.buckets;
    return jsonToCsv(flatten(traceGroups));
  }

  public async getTraces() {
    const indexName = await getIndexName(this.opensearchClient);
    const query = getTracesQuery(indexName);
    const tracesResponse = await this.observabilityClient.callAsCurrentUser('search', {
      body: JSON.stringify(query),
    });
    const traces = tracesResponse.aggregations.traces.buckets;
    return jsonToCsv(flatten(traces));
  }
}
