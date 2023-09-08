/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LangchainTrace } from '../../../../../common/utils/llm_chat/traces';
import { buildOutputs } from '../build_outputs';
import { createTrace } from './__utils__/test_helpers';

describe('build outputs', () => {
  it('builds outputs', () => {
    const traces: LangchainTrace[] = [createTrace(), createTrace({ type: 'tool' })];
    const outputs = buildOutputs(
      'test question',
      'agent response',
      'test-session',
      { question1: 'test suggestion 1', question2: 'test suggestion 2' },
      traces
    );
    expect(outputs).toEqual([
      {
        content: 'agent response',
        contentType: 'markdown',
        sessionId: 'test-session',
        suggestedActions: [
          { actionType: 'send_as_input', message: 'test suggestion 1' },
          { actionType: 'send_as_input', message: 'test suggestion 2' },
        ],
        toolsUsed: ['trace name'],
        type: 'output',
      },
    ]);
  });

  it('sanitizes outputs', () => {
    const outputs = buildOutputs(
      'test question',
      'normal text<b onmouseover=alert("XSS testing!")></b>',
      'test-session',
      {},
      []
    );
    expect(outputs).toEqual([
      {
        content: 'normal text<b></b>',
        contentType: 'markdown',
        sessionId: 'test-session',
        suggestedActions: [],
        toolsUsed: [],
        type: 'output',
      },
    ]);
  });

  it('builds outputs with object type response', () => {
    const outputs = buildOutputs(
      'test question',
      { output: 'agent response' },
      'test-session',
      {},
      []
    );
    expect(outputs).toEqual([
      {
        content: 'agent response',
        contentType: 'markdown',
        sessionId: 'test-session',
        suggestedActions: [],
        toolsUsed: [],
        type: 'output',
      },
    ]);
  });
});
