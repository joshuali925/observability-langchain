/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponseError } from '@opensearch-project/opensearch/lib/errors';
import { schema } from '@osd/config-schema';
import { IOpenSearchDashboardsResponse, IRouter } from '../../../../../src/core/server';
import { CHAT_API } from '../../../common/constants/llm';
import {
  CHAT_SAVED_OBJECT,
  IChat,
  SAVED_OBJECT_VERSION,
} from '../../../common/types/observability_saved_object_attributes';
import { AgentFactory } from '../../langchain/agents/chat_conv_agent';

export function registerChatRoute(router: IRouter) {
  // TODO split into three functions: request LLM, create chat, update chat
  router.post(
    {
      path: CHAT_API.LLM,
      validate: {
        body: schema.object({
          chatId: schema.maybe(schema.string()),
          // TODO finish schema, messages should be retrieved from index
          messages: schema.arrayOf(schema.any()),
          input: schema.object({
            type: schema.string(),
            context: schema.object({
              appId: schema.maybe(schema.string()),
            }),
            content: schema.string(),
            contentType: schema.string(),
          }),
        }),
      },
    },
    async (
      context,
      request,
      response
    ): Promise<IOpenSearchDashboardsResponse<any | ResponseError>> => {
      try {
        const client = context.core.savedObjects.client;
        const { chatId, input, messages } = request.body;
        const agent = new AgentFactory(context.core.opensearch.client);
        await agent.init();
        const agentResponse = await agent.run(input.content);
        const outputs = [
          {
            type: 'output',
            content: typeof agentResponse === 'string' ? agentResponse : agentResponse.output,
            contentType: 'markdown',
          },
        ];
        if (!chatId) {
          const createResponse = await client.create<IChat>(CHAT_SAVED_OBJECT, {
            title: input.content.substring(0, 50),
            version: SAVED_OBJECT_VERSION,
            createdTimeMs: new Date().getTime(),
            messages: [...messages, input, ...outputs],
          });
          return response.ok({
            body: {
              chatId: createResponse.id,
              messages: createResponse.attributes.messages,
            },
          });
        }
        const updateResponse = await client.update<Partial<IChat>>(CHAT_SAVED_OBJECT, chatId, {
          messages: [...messages, input, ...outputs],
        });
        return response.ok({
          body: {
            chatId,
            messages: updateResponse.attributes.messages,
          },
        });
      } catch (error) {
        console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
