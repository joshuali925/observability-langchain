/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DATA_PREPPER_INDEX_NAME } from 'common/constants/trace_analytics';
import { TraceAnalyticsMode } from 'public/components/trace_analytics/home';

import { PluginToolsFactory } from '../../tools_factory/tools_factory';
import { OpenSearchClient } from '../../../../../../../src/core/server';

export async function getIndexName(opensearchClient: OpenSearchClient) {
  const indexName = 'otel-v1-apm-span-*';
  const indexExistsResponse = await opensearchClient.indices.exists({
    index: indexName,
  });
  return indexExistsResponse ? indexName : '*jaeger-span-*';
}

// export function addFilters(bodyQuery: any, startTime?: string) {
//     const endTime = 'now'
//     if (startTime) {
//         const timeFilter = {
//             range: {
//               startTime: {
//                 gte: startTime,
//                 lte: endTime,
//               },
//             },
//         };
//         bodyQuery.query.bool.must.push(timeFilter);
//         bodyQuery.custom.timeFilter.push(timeFilter);
//     }
// }

export const getDashboardQuery = (indexName: string) => {
  return {
    size: 0,
    query: {
      bool: {
        must: [],
        filter: [],
        should: [],
        must_not: [],
      },
    },
    aggs: {
      trace_group_name: {
        terms: {
          field: 'traceGroup',
          size: 10000,
        },
        index: indexName,
        aggs: {
          average_latency: {
            scripted_metric: {
              init_script: 'state.traceIdToLatencyMap = [:];',
              map_script: `
                  if (doc.containsKey('traceGroupFields.durationInNanos') && !doc['traceGroupFields.durationInNanos'].empty) {
                    def traceId = doc['traceId'].value;
                    if (!state.traceIdToLatencyMap.containsKey(traceId)) {
                      state.traceIdToLatencyMap[traceId] = doc['traceGroupFields.durationInNanos'].value;
                    }
                  }
                `,
              combine_script: 'return state.traceIdToLatencyMap',
              reduce_script: `
                  def seenTraceIdsMap = [:];
                  def totalLatency = 0.0;
                  def traceCount = 0.0;
  
                  for (s in states) {
                    if (s == null) {
                      continue;
                    }
  
                    for (entry in s.entrySet()) {
                      def traceId = entry.getKey();
                      def traceLatency = entry.getValue();
                      if (!seenTraceIdsMap.containsKey(traceId)) {
                        seenTraceIdsMap[traceId] = true;
                        totalLatency += traceLatency;
                        traceCount++;
                      }
                    }
                  }
  
                  def average_latency_nanos = totalLatency / traceCount;
                  return Math.round(average_latency_nanos / 10000) / 100.0;
                `,
            },
          },
          trace_count: {
            cardinality: {
              field: 'traceId',
            },
          },
          error_count: {
            filter: {
              term: {
                'traceGroupFields.statusCode': '2',
              },
            },
            aggs: {
              trace_count: {
                cardinality: {
                  field: 'traceId',
                },
              },
            },
          },
          error_rate: {
            bucket_script: {
              buckets_path: {
                total: 'trace_count.value',
                errors: 'error_count>trace_count.value',
              },
              script: 'params.errors / params.total * 100',
            },
          },
        },
      },
    },
  };
};
