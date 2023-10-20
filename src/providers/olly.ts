/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider, ProviderResponse } from 'promptfoo';
import { IMessage } from '../types';
import { OPENSEARCH_CONFIG, PROVIDERS, getAuthHeader } from './utils';

interface ProviderOptions {
  id?: string;
  config?: unknown;
}

export class OllyApiProvider implements ApiProvider {
  providerId: string;
  config: unknown;

  constructor(options: ProviderOptions = {}) {
    this.providerId = options.id || PROVIDERS.OLLY;
    this.config = options.config;
  }

  id() {
    return this.providerId;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<ProviderResponse> {
    try {
      const response = (await fetch(`${OPENSEARCH_CONFIG.OSD_URL}/api/assistant/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          'osd-xsrf': '1',
        },
        body: JSON.stringify({
          input: {
            type: 'input',
            content: prompt,
            contentType: 'text',
          },
        }),
      }).then((resp) => resp.json())) as { sessionId: string; messages: IMessage[] };
      return {
        output: response.messages
          .reverse()
          .find((message) => message.type === 'output' && message.contentType === 'markdown')
          ?.content,
      };
    } catch (error) {
      return { error: `API call error: ${String(error)}` };
    }
  }
}
