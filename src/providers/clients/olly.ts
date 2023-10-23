/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IMessage } from '../../types';
import { OPENSEARCH_CONFIG } from '../constants';

const getAuthHeader = (): { Authorization: string } | undefined => {
  if (!OPENSEARCH_CONFIG.OPENSEARCH_USERNAME || !OPENSEARCH_CONFIG.OPENSEARCH_PASSWORD) {
    return undefined;
  }
  return {
    Authorization:
      'Basic ' +
      btoa(`${OPENSEARCH_CONFIG.OPENSEARCH_USERNAME}:${OPENSEARCH_CONFIG.OPENSEARCH_PASSWORD}`),
  };
};

class OllyClient {
  async sendMessage(prompt: string, sessionId?: string) {
    const response = (await fetch(`${OPENSEARCH_CONFIG.OSD_URL}/api/assistant/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        'osd-xsrf': '1',
      },
      body: JSON.stringify({
        sessionId,
        input: {
          type: 'input',
          content: prompt,
          contentType: 'text',
        },
      }),
    }).then((resp) => resp.json())) as { sessionId: string; messages: IMessage[] };
    return {
      ...response,
      output: response.messages
        .reverse()
        .find((message) => message.type === 'output' && message.contentType === 'markdown')
        ?.content,
    };
  }
}

export const ollyClient = new OllyClient();
