/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IOpenSearchDashboardsResponse, IRouter, ResponseError } from '../../../../src/core/server';
import { LANGCHAIN_API } from '../../common/constants/langchain';
import { generatePPL } from '../langchain/tools/generate_ppl';
import { generateFieldContext } from '../langchain/utils/utils';

export function registerLLMRoute(router: IRouter) {
  router.post(
    {
      path: LANGCHAIN_API.PPL_GENERATOR,
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
        const sampleDoc = await context.core.opensearch.client.asCurrentUser.search({
          index: request.body.index,
          size: 1,
        });
        const fields = generateFieldContext(mappings, sampleDoc);
        const ppl = await generatePPL({ question, index, timeField, fields });
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