/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useOsisContext } from '../components/osis_icon';
import { useRequest } from './use_request';

export const useIndexFields = (index: string | undefined) => {
  const context = useOsisContext();
  return useRequest((controller) => {
    if (index) {
      return context.http.post('/api/console/proxy', {
        query: {
          path: `${index}/_mappings`,
          method: 'GET',
          dataSourceId: context.dependencies.query.dataset?.dataSource?.id,
        },
        signal: controller.signal,
      });
    }
    return Promise.resolve(undefined);
  }, index);
};
