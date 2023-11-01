/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider, ProviderResponse } from 'promptfoo';
import { ollyClient } from './clients/olly';
import { PROVIDERS } from './constants';

export class PPLGeneratorApiProvider implements ApiProvider {
  constructor(private readonly providerId = PROVIDERS.OLLY) {}

  id() {
    return this.providerId;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<ProviderResponse> {
    if (!context?.vars.index || typeof context.vars.index !== 'string')
      throw new Error('a string value is required for context.vars.index');

    try {
      return {
        output: await ollyClient.generatePPL(prompt, context.vars.index),
      };
    } catch (error) {
      console.error('Failed to request PPL generator:', error);
      return { error: `API call error: ${String(error)}` };
    }
  }
}
