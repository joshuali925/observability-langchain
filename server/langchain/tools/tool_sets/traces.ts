/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AggregationsMultiBucketAggregate } from '@opensearch-project/opensearch/api/types';
import { DynamicTool } from 'langchain/tools';
import {
  DATA_PREPPER_INDEX_NAME,
  JAEGER_INDEX_NAME,
} from '../../../../common/constants/trace_analytics';
import { AggregationBucket, flatten, jsonToCsv, swallowErrors } from '../../utils/utils';
import { PluginToolsFactory } from '../tools_factory/tools_factory';
import { getDashboardQuery, getMode, getTracesQuery, getServices } from './trace_tools/queries';
import { requestTimesFiltersChain } from '../../../../server/langchain/chains/filter_generator';
import { addFilters } from './trace_tools/filters';

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
        "Use this to get information about each trace group. The input must be the entire original USER'S INPUT with no modification. The first line of the tool response is the column labels, which includes the key, doc_count, average_latency.value, trace_count.value, error_count.doc_count, error_count.trace_count.value, and error_rate.value. The key is the name of the trace group, the doc_count is the number of spans, the average_latency.value is the average latency of the trace group, measured in milliseconds. The trace_count.value is the number of traces in the trace group. The error_count.doc_count is the number of spans in the trace groups with errors, while the error_count.trace_count.value is the number of different traces in the trace group with errors. The error_rate.value is the percentage of traces in the trace group that has at least one error. There may be no trace groups",
      func: swallowErrors(async (userQuery: string) => this.getTraceGroups(userQuery)),
      callbacks: this.callbacks,
    }),
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACES,
      description:
        'Use this to get information about each trace. The tool response includes the key, doc_count, last_updated.value, last_updated.value_as_string, error_count.doc_count, trace_group.doc_count_error_upper_bound, trace_group.sum_other_doc_count, trace_group.buckets.0.key, and trace_groups.buckets.0.doc_count. The key is the ID of the trace. The doc_count is the number of spans in that particular trace. The last_updated.value_as_string is the last time that the trace was updated. The error_count.doc_count is how many spans in that trace has errors. The trace group.buckets.1.key is what trace group the trace belongs to. The other fields are mostly irrelevant data. This tool takes in no inputs.',
      func: swallowErrors(async () => this.getTraces()),
      callbacks: this.callbacks,
    }),
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.SERVICES,
      description:
        'Use this to get information about each service in trace analytics. The tool response includes the key, doc_count, error_count.doc_count, average_latency_nanos.value, average_latency.value, and error_rate.value. The key is the name of the service. The doc_count is the number of spans in the service. The error_count.doc_count is the number of traces with errors in the service. The average_latency.value is the average latency in milliseconds. The error_rate.value is the percentage of traces that had an error.',
      func: swallowErrors(async () => this.getServices()),
      callbacks: this.callbacks,
    }),
  ];

  public async getTraceGroups(userQuery: string) {
    console.log(userQuery);
    const mode = await getMode(this.opensearchClient);
    const times = await requestTimesFiltersChain(this.model, userQuery);
    console.log(times);
    const query = getDashboardQuery();
    addFilters(query, times);
    console.log(query);
    const traceGroupsResponse = await this.opensearchClient.search({
      index: mode === 'data_prepper' ? DATA_PREPPER_INDEX_NAME : JAEGER_INDEX_NAME,
      body: query,
    });
    if (!traceGroupsResponse.body.aggregations) return '';
    const traceGroupBuckets = (traceGroupsResponse.body.aggregations
      .trace_group_name as AggregationsMultiBucketAggregate<AggregationBucket>).buckets;
    if (traceGroupBuckets.length === 0) {
      return 'No trace groups found';
    }
    return jsonToCsv(flatten(traceGroupBuckets));
  }

  public async getTraces() {
    const mode = await getMode(this.opensearchClient);
    const query = getTracesQuery(mode);
    const tracesResponse = await this.opensearchClient.search({
      index: mode === 'data_prepper' ? DATA_PREPPER_INDEX_NAME : JAEGER_INDEX_NAME,
      body: query,
    });
    if (!tracesResponse.body.aggregations) return '';
    const traceBuckets = (tracesResponse.body.aggregations
      .trace_group_name as AggregationsMultiBucketAggregate<AggregationBucket>).buckets;
    return jsonToCsv(flatten(traceBuckets));
  }

  public async getServices() {
    const mode = await getMode(this.opensearchClient);
    const services = await getServices(mode, this.opensearchClient);
    return jsonToCsv(flatten(services));
  }
}
