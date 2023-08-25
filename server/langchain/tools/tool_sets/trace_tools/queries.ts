/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import _ from 'lodash';
import { SearchRequest } from '@opensearch-project/opensearch/api/types';
import { TraceAnalyticsMode } from '../../../utils/utils';
import { OpenSearchClient } from '../../../../../../../src/core/server';
import {
  DATA_PREPPER_INDEX_NAME,
  DATA_PREPPER_SERVICE_INDEX_NAME,
  JAEGER_SERVICE_INDEX_NAME,
  SERVICE_MAP_MAX_EDGES,
  SERVICE_MAP_MAX_NODES,
  TRACES_MAX_NUM,
} from '../../../../../common/constants/trace_analytics';
import { ServiceObject } from '../../../../../public/components/trace_analytics/components/common/plots/service_map';

export async function getMode(opensearchClient: OpenSearchClient) {
  const indexExistsResponse = await opensearchClient.indices.exists({
    index: DATA_PREPPER_INDEX_NAME,
  });
  return indexExistsResponse ? 'data_prepper' : 'jaeger';
}

export const getDashboardQuery = () => {
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

export const getTracesQuery = (mode: TraceAnalyticsMode) => {
  const jaegerQuery: SearchRequest['body'] = {
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
  const dataPrepperQuery: SearchRequest['body'] = {
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
  return mode === 'jaeger' ? jaegerQuery : dataPrepperQuery;
};

// @ts-ignore
export const getServices = async (mode: TraceAnalyticsMode, openSearchClient: OpenSearchClient) => {
  const map: ServiceObject = {};
  let id = 1;
  const serviceNodesResponse = await openSearchClient.search({
    index: mode === 'jaeger' ? JAEGER_SERVICE_INDEX_NAME : DATA_PREPPER_SERVICE_INDEX_NAME,
    body: getServiceNodesQuery(mode),
  });

  serviceNodesResponse.body.aggregations.service_name.buckets.map(
    (bucket: object) =>
      (map[bucket.key as string] = {
        serviceName: bucket.key,
        id: id++,
        traceGroups: bucket.trace_group.buckets.map((traceGroup: object) => ({
          traceGroup: traceGroup.key,
          targetResource: traceGroup.target_resource.buckets.map((res: object) => res.key),
        })),
        targetServices: [],
        destServices: [],
      })
  );

  const targets = {};
  const serviceEdgesTargetResponse = await openSearchClient.search({
    index: mode === 'jaeger' ? JAEGER_SERVICE_INDEX_NAME : DATA_PREPPER_SERVICE_INDEX_NAME,
    body: getServiceEdgesQuery('target', mode),
  });

  serviceEdgesTargetResponse.body.aggregations.service_name.buckets.map((bucket: object) => {
    bucket.resource.buckets.map((resource: object) => {
      resource.domain.buckets.map((domain: object) => {
        targets[resource.key + ':' + domain.key] = bucket.key;
      });
    });
  });

  const serviceEdgesDestResponse = await openSearchClient.search({
    index: mode === 'jaeger' ? JAEGER_SERVICE_INDEX_NAME : DATA_PREPPER_SERVICE_INDEX_NAME,
    body: getServiceEdgesQuery('destination', mode),
  });

  serviceEdgesDestResponse.body.aggregations.service_name.buckets.map((bucket: object) => {
    bucket.resource.buckets.map((resource: object) => {
      resource.domain.buckets.map((domain: object) => {
        const targetService = targets[resource.key + ':' + domain.key];
        if (targetService) {
          if (map[bucket.key].targetServices.indexOf(targetService) === -1)
            map[bucket.key].targetServices.push(targetService);
          if (map[targetService].destServices.indexOf(bucket.key) === -1)
            map[targetService].destServices.push(bucket.key);
        }
      });
    });
  });

  const serviceMetricsResponse = await openSearchClient.search({
    body: getServiceMetricsQuery(Object.keys(map), map, mode),
  });

  serviceMetricsResponse.body.aggregations.service_name.buckets.map((bucket: object) => {
    map[bucket.key].latency = bucket.average_latency.value;
    map[bucket.key].error_rate = _.round(bucket.error_rate.value, 2) || 0;
    map[bucket.key].throughput = bucket.doc_count;
  });
  return serviceMetricsResponse.body.aggregations.service_name.buckets;
};

export const getServiceNodesQuery = (mode: TraceAnalyticsMode) => {
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
      service_name: {
        terms: {
          field: 'serviceName',
          size: SERVICE_MAP_MAX_NODES,
        },
        aggs: {
          trace_group: {
            terms: {
              field: 'traceGroupName',
              size: SERVICE_MAP_MAX_EDGES,
            },
            aggs: {
              target_resource: {
                terms: {
                  field: 'target.resource',
                  size: SERVICE_MAP_MAX_EDGES,
                },
              },
            },
          },
        },
      },
    },
  };
};

export const getServiceEdgesQuery = (
  source: 'destination' | 'target',
  mode: TraceAnalyticsMode
) => {
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
      service_name: {
        terms: {
          field: 'serviceName',
          size: SERVICE_MAP_MAX_EDGES,
        },
        aggs: {
          resource: {
            terms: {
              field: `${source}.resource`,
              size: SERVICE_MAP_MAX_EDGES,
            },
            aggs: {
              domain: {
                terms: {
                  field: `${source}.domain`,
                  size: SERVICE_MAP_MAX_EDGES,
                },
              },
            },
          },
        },
      },
    },
  };
};

// @ts-ignore
export const getServiceMetricsQuery = (
  serviceNames: string[],
  map: ServiceObject,
  mode: TraceAnalyticsMode
) => {
  const targetResource = [].concat(
    ...Object.keys(map).map((service) => getServiceMapTargetResources(map, service))
  );
  const jaegerQuery = {
    size: 0,
    query: {
      bool: {
        must: [],
        should: [],
        must_not: [],
        filter: [
          {
            terms: {
              'process.serviceName': serviceNames,
            },
          },
          {
            bool: {
              should: [
                {
                  bool: {
                    filter: [
                      {
                        bool: {
                          must_not: {
                            term: {
                              references: {
                                value: [],
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: {
                      term: {
                        references: {
                          value: [],
                        },
                      },
                    },
                  },
                },
              ],
              adjust_pure_negative: true,
              boost: 1,
            },
          },
        ],
      },
    },
    aggregations: {
      service_name: {
        terms: {
          field: 'process.serviceName',
          size: SERVICE_MAP_MAX_NODES,
          min_doc_count: 1,
          shard_min_doc_count: 0,
          show_term_doc_count_error: false,
          order: [
            {
              _count: 'desc',
            },
            {
              _key: 'asc',
            },
          ],
        },
        aggregations: {
          average_latency_nanos: {
            avg: {
              field: 'duration',
            },
          },
          average_latency: {
            bucket_script: {
              buckets_path: {
                count: '_count',
                latency: 'average_latency_nanos.value',
              },
              script: 'Math.round(params.latency / 10) / 100.0',
            },
          },
          error_count: {
            filter: {
              term: {
                'tag.error': true,
              },
            },
          },
          error_rate: {
            bucket_script: {
              buckets_path: {
                total: '_count',
                errors: 'error_count._count',
              },
              script: 'params.errors / params.total * 100',
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
        should: [],
        must_not: [],
        filter: [
          {
            terms: {
              serviceName: serviceNames,
            },
          },
          {
            bool: {
              should: [
                {
                  bool: {
                    filter: [
                      {
                        bool: {
                          must_not: {
                            term: {
                              parentSpanId: {
                                value: '',
                              },
                            },
                          },
                        },
                      },
                      {
                        terms: {
                          name: targetResource,
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: {
                      term: {
                        parentSpanId: {
                          value: '',
                        },
                      },
                    },
                  },
                },
              ],
              adjust_pure_negative: true,
              boost: 1,
            },
          },
        ],
      },
    },
    aggregations: {
      service_name: {
        terms: {
          field: 'serviceName',
          size: SERVICE_MAP_MAX_NODES,
          min_doc_count: 1,
          shard_min_doc_count: 0,
          show_term_doc_count_error: false,
          order: [
            {
              _count: 'desc',
            },
            {
              _key: 'asc',
            },
          ],
        },
        aggregations: {
          average_latency_nanos: {
            avg: {
              field: 'durationInNanos',
            },
          },
          average_latency: {
            bucket_script: {
              buckets_path: {
                count: '_count',
                latency: 'average_latency_nanos.value',
              },
              script: 'Math.round(params.latency / 10000) / 100.0',
            },
          },
          error_count: {
            filter: {
              term: {
                'status.code': '2',
              },
            },
          },
          error_rate: {
            bucket_script: {
              buckets_path: {
                total: '_count',
                errors: 'error_count._count',
              },
              script: 'params.errors / params.total * 100',
            },
          },
        },
      },
    },
  };
  return mode === 'jaeger' ? jaegerQuery : dataPrepperQuery;
};

export function getServiceMapTargetResources(map: ServiceObject, serviceName: string) {
  return ([] as string[]).concat.apply(
    [],
    [...map[serviceName].traceGroups.map((traceGroup) => [...traceGroup.targetResource])]
  );
}
