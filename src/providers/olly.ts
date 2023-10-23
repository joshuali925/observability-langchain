/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider, ProviderResponse } from 'promptfoo';
import { ollyClient } from './clients/olly';
import { PROVIDERS } from './constants';

export class OllyApiProvider implements ApiProvider {
  constructor(private readonly providerId = PROVIDERS.OLLY) {}

  id() {
    return this.providerId;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<ProviderResponse> {
    try {
      const response = await ollyClient.sendMessage(prompt);
      return {
        output: response.output,
      };
    } catch (error) {
      console.error('Failed to request Olly:', error);
      return { error: `API call error: ${String(error)}` };
    }
  }
}
