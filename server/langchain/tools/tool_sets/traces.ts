/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

import { getDashboardQuery } from '../../../../public/components/trace_analytics/requests/queries/dashboard_queries';
import DSLFacet from '../../../services/facets/dsl_facet';
import { swallowErrors } from '../../utils/utils';

interface DSLResponse {
  schema: Array<{ name: string; type: string }>;
  datarows: unknown[][];
  total: number;
  size: number;
}

export class TracesTools extends PluginToolsFactory {
  static TOOL_NAMES = {
    ERROR_RATES: 'Get error rates',
  } as const;

  toolsList = [
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.ERROR_RATES,
      description:
        'Use this to get information about each trace group, including its latency average and variance, error rate, and number of traces in that trace group',
      func: swallowErrors(async () => this.getTracesQuery().then()),
    }),
  ];

  public async getTracesQuery() {
    // const query = "{ size: 0, query: { bool: { must: [], filter: [], should: [], must_not: [], }, }, aggs: { trace_group_name: { terms: { field: 'traceGroup', size: 10000, }, aggs: { average_latency: { scripted_metric: { init_script: 'state.traceIdToLatencyMap = [:];', map_script: ` if (doc.containsKey('traceGroupFields.durationInNanos') && !doc['traceGroupFields.durationInNanos'].empty) { def traceId = doc['traceId'].value; if (!state.traceIdToLatencyMap.containsKey(traceId)) { state.traceIdToLatencyMap[traceId] = doc['traceGroupFields.durationInNanos'].value; } } `, combine_script: 'return state.traceIdToLatencyMap', reduce_script: ` def seenTraceIdsMap = [:]; def totalLatency = 0.0; def traceCount = 0.0; for (s in states) { if (s == null) { continue; } for (entry in s.entrySet()) { def traceId = entry.getKey(); def traceLatency = entry.getValue(); if (!seenTraceIdsMap.containsKey(traceId)) { seenTraceIdsMap[traceId] = true; totalLatency += traceLatency; traceCount++; } } } def average_latency_nanos = totalLatency / traceCount; return Math.round(average_latency_nanos / 10000) / 100.0; `, }, }, trace_count: { cardinality: { field: 'traceId', }, }, error_count: { filter: { term: { 'traceGroupFields.statusCode': '2', }, }, aggs: { trace_count: { cardinality: { field: 'traceId', }, }, }, }, error_rate: { bucket_script: { buckets_path: { total: 'trace_count.value', errors: 'error_count>trace_count.value', }, script: 'params.errors / params.total * 100', }, }, }, }, }, };"
    const query = getDashboardQuery();
    // const response = await this.opensearchClient.search()

    const response: DSLResponse = await this.observabilityClient.callAsCurrentUser('dsl.dslQuery', {
      body: { query },
    });
    return response;
  }
}
