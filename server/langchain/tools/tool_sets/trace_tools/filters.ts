/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModel } from 'langchain/base_language';
import { requestTimesFiltersChain } from '../../../../../server/langchain/chains/filter_generator';
import { SearchRequest } from '../../../../../../../src/plugins/data/common';
import { requestSortChain } from '../../../chains/sort_generator';

export async function addFilters(
  bodyQuery: SearchRequest['body'],
  userQuery: string,
  model: BaseLanguageModel
) {
  const time = await requestTimesFiltersChain(model, userQuery);
  const timeFilter = {
    range: {
      startTime: {
        gte: time?.start_time,
        lte: time?.end_time,
      },
    },
  };
  const must = bodyQuery?.query?.bool?.must;
  console.log(timeFilter);
  if (Array.isArray(must)) must.push(timeFilter);
}

export async function getField(userQuery: string, keyword: string, model: BaseLanguageModel) {
  const fields = {
    trace_group_name: "doc_count, 'average_latency.value', 'trace_count.value', 'error_rate.value",
    traces:
      'key, doc_count, last_updated.value, last_updated.value_as_string,latency.value,error_count.doc_count,trace_group.doc_count_error_upper_bound,trace_group.sum_other_doc_count,trace_group.buckets.0.key,trace_group.buckets.0.doc_count',
    service_name:
      'key,doc_count,error_count.doc_count,average_latency_nanos.value,average_latency.value,error_rate.value',
  };
  console.log(fields[keyword]);
  const field = await requestSortChain(model, userQuery, fields[keyword]);
  return field?.field;
}
