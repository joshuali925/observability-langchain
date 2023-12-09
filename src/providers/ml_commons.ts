/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '@opensearch-project/opensearch';
import { GetResponse } from '@opensearch-project/opensearch/api/types';
import { ApiProvider, ProviderEmbeddingResponse, ProviderResponse } from 'promptfoo';
import { openSearchClient } from './clients/opensearch';
import { ASSISTANT_CONFIG_DOCUMENT, ASSISTANT_CONFIG_INDEX, PROVIDERS } from './constants';

interface MLCommonsPredictionResponse {
  inference_results: Array<{
    output: Array<{
      name: string;
      data_type: string;
      shape: number[];
      data: number[];
      dataAsMap: {
        completion: string;
        message: string;
      };
    }>;
  }>;
}

interface AssistantConfigDoc {
  model_id: string;
  embeddings_model_id: string;
}

/**
 * Api Provider to request model/_predict in ml-commons directly.
 */
export class MlCommonsApiProvider implements ApiProvider {
  constructor(private readonly providerId = PROVIDERS.ML_COMMONS) {}

  id() {
    return this.providerId;
  }

  private async getModelId() {
    const getResponse = await openSearchClient.get<GetResponse<AssistantConfigDoc>>({
      id: ASSISTANT_CONFIG_DOCUMENT,
      index: ASSISTANT_CONFIG_INDEX,
    });
    if (!getResponse.body._source) throw new Error('Assistant config source not found.');
    return getResponse.body._source;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<ProviderResponse> {
    try {
      const modelId = (await this.getModelId()).model_id;
      const response = (await openSearchClient.transport.request({
        method: 'POST',
        path: `/_plugins/_ml/models/${modelId}/_predict`,
        body: JSON.stringify({
          parameters: {
            temperature: 0.0000001,
            max_tokens_to_sample: 2048,
            prompt,
          },
        }),
      })) as ApiResponse<MLCommonsPredictionResponse, unknown>;
      const respData = response.body.inference_results[0].output[0].dataAsMap;
      if (!respData.completion) throw new Error(respData.message || 'Failed to request model');
      return { output: respData.completion };
    } catch (error) {
      console.error('Failed to request ml-commons model:', error);
      return { error: `API call error: ${String(error)}` };
    }
  }

  async callEmbeddingApi(prompt: string): Promise<ProviderEmbeddingResponse> {
    try {
      const modelId = (await this.getModelId()).embeddings_model_id;
      const response = (await openSearchClient.transport.request({
        method: 'POST',
        path: `/_plugins/_ml/_predict/text_embedding/${modelId}`,
        body: JSON.stringify({
          text_docs: [prompt],
          target_response: ['sentence_embedding'],
        }),
      })) as ApiResponse<MLCommonsPredictionResponse, unknown>;
      return {
        embedding: response.body.inference_results.map((inference) => inference.output[0].data)[0],
      };
    } catch (error) {
      console.error('Failed to request ml-commons embeddings model:', error);
      return {
        error: `API call error: ${String(error)}`,
      };
    }
  }
}
