/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider, ProviderEmbeddingResponse, ProviderResponse } from 'promptfoo';
import { OPENSEARCH_CONFIG, PROVIDERS, getAuthHeader } from './utils';

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

export class MlCommonsApiProvider implements ApiProvider {
  constructor(private readonly providerId = PROVIDERS.ML_COMMONS) {}

  id() {
    return this.providerId;
  }

  private async getModelId() {
    const config = (await fetch(
      `${OPENSEARCH_CONFIG.URL}/.chat-assistant-config/_doc/model-config`,
      {
        headers: getAuthHeader(),
      },
    ).then((resp) => resp.json())) as {
      _source: { model_id: string; embeddings_model_id: string };
    };
    return config._source;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<ProviderResponse> {
    try {
      const modelId = (await this.getModelId()).model_id;
      const response = (await fetch(
        `${OPENSEARCH_CONFIG.URL}/_plugins/_ml/models/${modelId}/_predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            parameters: {
              temperature: 0.0000001,
              max_tokens_to_sample: 2048,
              prompt,
            },
          }),
        },
      ).then((resp) => resp.json())) as MLCommonsPredictionResponse;
      const respData = response.inference_results[0].output[0].dataAsMap;
      if (!respData.completion) throw new Error(respData.message || 'Failed to request model');
      return { output: respData.completion };
    } catch (error) {
      return { error: `API call error: ${String(error)}` };
    }
  }

  async callEmbeddingApi(prompt: string): Promise<ProviderEmbeddingResponse> {
    try {
      const modelId = (await this.getModelId()).embeddings_model_id;
      const response = (await fetch(
        `${OPENSEARCH_CONFIG.URL}/_plugins/_ml/_predict/text_embedding/${modelId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            text_docs: [prompt],
            target_response: ['sentence_embedding'],
          }),
        },
      ).then((resp) => resp.json())) as MLCommonsPredictionResponse;
      return {
        embedding: response.inference_results.map((inference) => inference.output[0].data)[0],
      };
    } catch (error) {
      return {
        error: `API call error: ${String(error)}`,
      };
    }
  }
}
