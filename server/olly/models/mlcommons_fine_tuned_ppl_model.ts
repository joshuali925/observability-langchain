/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModelParams } from 'langchain/base_language';
import { CallbackManagerForLLMRun } from 'langchain/callbacks';
import { BaseChatModel } from 'langchain/chat_models/base';
import { AIMessage, BaseMessage, ChatResult, LLMResult } from 'langchain/schema';
import { OpenSearchClient } from '../../../../../src/core/server';
import {
  ASSISTANT_CONFIG_DOCUMENT,
  ASSISTANT_CONFIG_INDEX,
  ML_COMMONS_BASE_API,
} from './constants';

export class MLCommonsFineTunedPPLModel extends BaseChatModel {
  static modelSuffix: string = '</s>';
  opensearchClient: OpenSearchClient;

  constructor(fields: BaseLanguageModelParams, osClient: OpenSearchClient) {
    super(fields);
    this.opensearchClient = osClient;
  }

  _combineLLMOutput?(...llmOutputs: Array<LLMResult['llmOutput']>): LLMResult['llmOutput'] {
    return [];
  }

  _llmType(): string {
    return 'opensearch_mlcommons';
  }

  private formatMessagesAsPrompt(messages: BaseMessage[]): string {
    /* There is supposed to be only one HumanMessage */
    return messages
      .map((message) => {
        return message.content;
      })
      .join('');
  }

  async model_predict(prompt: string) {
    const getResponse = await this.opensearchClient.get<AssistantConfigDoc>({
      id: ASSISTANT_CONFIG_DOCUMENT,
      index: ASSISTANT_CONFIG_INDEX,
    });
    if (!getResponse.body._source) throw new Error('Assistant config source not found.');
    const mlCommonsFineTunedPPLModelId = getResponse.body._source.fine_tuned_ppl_model_id;
    if (mlCommonsFineTunedPPLModelId === undefined) throw new Error('PPL model id not found.');

    const mlCommonsResponse = await this.opensearchClient.transport.request({
      method: 'POST',
      path: `${ML_COMMONS_BASE_API}/models/${mlCommonsFineTunedPPLModelId}/_predict`,
      body: {
        parameters: {
          prompt,
        },
      },
    });
    const respData = mlCommonsResponse.body.inference_results[0].output[0].dataAsMap;
    if (respData.output === undefined) {
      return 'Failed to request model';
    } else {
      if ((respData.output as string).endsWith(MLCommonsFineTunedPPLModel.modelSuffix)) {
        respData.output = (respData.output as string).slice(
          0,
          -MLCommonsFineTunedPPLModel.modelSuffix.length
        );
      }
      return respData.output;
    }
  }

  async _call(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    return await this.model_predict(this.formatMessagesAsPrompt(messages));
  }

  async _generate(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const text = await this._call(messages, options, runManager);
    const message = new AIMessage(text);
    return {
      generations: [
        {
          text: message.content,
          message,
        },
      ],
    };
  }
}
