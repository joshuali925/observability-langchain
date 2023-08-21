/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TraceAnalyticsMode } from 'public/components/trace_analytics/home';
import { TRACES_MAX_NUM } from '../../../../../common/constants/trace_analytics';

import { OpenSearchClient } from '../../../../../../../src/core/server';

export async function getIndexName(opensearchClient: OpenSearchClient) {
  const indexName = 'otel-v1-apm-span-*';
  const indexExistsResponse = await opensearchClient.indices.exists({
    index: indexName,
  });
  return indexExistsResponse ? indexName : '*jaeger-span-*';
}

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
        // index: indexName,
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

export const getTracesQuery = (mode: TraceAnalyticsMode, traceId: string = '') => {
  const jaegerQuery = {
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
      traces: {
        terms: {
          field: 'traceID',
          size: TRACES_MAX_NUM,
        },
        aggs: {
          latency: {
            max: {
              script: {
                source: `
                if (doc.containsKey('duration') && !doc['duration'].empty) {
                  return Math.round(doc['duration'].value) / 1000.0
                }

                return 0
                `,
                lang: 'painless',
              },
            },
          },
          trace_group: {
            terms: {
              field: 'traceGroup',
              size: 1,
            },
          },
          error_count: {
            filter: {
              term: {
                'tag.error': true,
              },
            },
          },
          last_updated: {
            max: {
              script: {
                source: `
                if (doc.containsKey('startTime') && !doc['startTime'].empty && doc.containsKey('duration') && !doc['duration'].empty) {
                  return (Math.round(doc['duration'].value) + Math.round(doc['startTime'].value)) / 1000.0
                }

                return 0
                `,
                lang: 'painless',
              },
            },
          },
        },
      },
    },
  };
  const dataPrepperQuery = {
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
      traces: {
        terms: {
          field: 'traceId',
          size: TRACES_MAX_NUM,
        },
        aggs: {
          latency: {
            max: {
              script: {
                source: `
                if (doc.containsKey('traceGroupFields.durationInNanos') && !doc['traceGroupFields.durationInNanos'].empty) {
                  return Math.round(doc['traceGroupFields.durationInNanos'].value / 10000) / 100.0
                }
                return 0
                `,
                lang: 'painless',
              },
            },
          },
          trace_group: {
            terms: {
              field: 'traceGroup',
              size: 1,
            },
          },
          error_count: {
            filter: {
              term: {
                'traceGroupFields.statusCode': '2',
              },
            },
          },
          last_updated: {
            max: {
              field: 'traceGroupFields.endTime',
            },
          },
        },
      },
    },
  };
  // if (traceId) {
  //   jaegerQuery.query.bool.must.push({
  //     term: {
  //       "traceID": traceId,
  //     },
  //   });
  //   dataPrepperQuery.query.bool.must.push({
  //     term: {
  //       traceId,
  //     },
  //   });
  // }
  return mode === 'jaeger' ? jaegerQuery : dataPrepperQuery;
};
