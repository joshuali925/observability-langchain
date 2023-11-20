/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider, ProviderResponse } from 'promptfoo';
import { IMessage } from '../types';
import { ollyClient } from './clients/olly';
import { PROVIDERS } from './constants';

export interface OllyProviderSuccessResponse extends Exclude<ProviderResponse, 'error'> {
  output: string;
  traceId: string;
  sessionId: string;
  messages: IMessage[];
}

export type OllyProviderResponse = ProviderResponse | OllyProviderSuccessResponse;

export class OllyApiProvider implements ApiProvider {
  constructor(private readonly providerId = PROVIDERS.OLLY) {}

  id() {
    return this.providerId;
  }

  async callApi(
    prompt: string,
    context?: { vars: Record<string, string | object> },
  ): Promise<OllyProviderResponse> {
    try {
      const prom = ollyClient.sendMessage(prompt);
      console.log(`in olly: ${prom}`);
      prom.then((val) => console.log(`resolved valu: ${val}`));
      return prom;
    } catch (error) {
      console.error('Failed to request Olly:', error);
      return { error: `API call error: ${String(error)}` };
    }
  }
}
