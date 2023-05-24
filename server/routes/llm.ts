/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IOpenSearchDashboardsResponse, IRouter, ResponseError } from '../../../../src/core/server';
import { generatePPL } from '../langchain/tools/generate_ppl';
import { flattenMappings } from '../langchain/utils/utils';

export function registerLLMRoute(router: IRouter) {
  router.post(
    {
      path: '/api/langchain/llm',
      validate: {
        body: schema.object({
          index: schema.string(),
          question: schema.string(),
          timeField: schema.string(),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      try {
        const { index, question, timeField } = request.body;
        const mappings = await context.core.opensearch.client.asCurrentUser.indices.getMapping({
          index: request.body.index,
        });
        const fields = flattenMappings(mappings);
        const ppl = await generatePPL({ question, index, fields });
        return response.ok({ body: ppl });
      } catch (error) {
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
