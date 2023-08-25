/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const addFilters = (bodyQuery: object, time: Record<string, string>) => {
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
};
