/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModel } from 'langchain/base_language';
import { requestTimesFiltersChain } from '../../../../../server/langchain/chains/filter_generator';

export async function addFilters(bodyQuery: object, userQuery: string, model: BaseLanguageModel) {
  const time = await requestTimesFiltersChain(model, userQuery);
  const timeFilter = {
    range: {
      startTime: {
        gte: time?.start_time,
        lte: time?.end_time,
      },
    },
  };
  // @ts-ignore
  bodyQuery?.query.bool.must.push(timeFilter);
}
