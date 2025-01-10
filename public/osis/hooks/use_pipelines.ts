/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetPipelineCommandOutput, ListPipelinesCommandOutput } from '@aws-sdk/client-osis';
import { API } from '../../../common/utils/constants';
import { useOsisContext } from '../components/osis_icon';
import { useRequest } from './use_request';

export const usePipelines = () => {
  const context = useOsisContext();
  return useRequest((controller) =>
    context.http.get<ListPipelinesCommandOutput>(API.PIPELINES, { signal: controller.signal })
  );
};

export const usePipeline = (name: string | undefined) => {
  const context = useOsisContext();
  return useRequest((controller) => {
    if (name)
      return context.http.get<GetPipelineCommandOutput>(`${API.PIPELINE}/${name}`, {
        signal: controller.signal,
      });
    return Promise.resolve(undefined);
  }, name);
};
