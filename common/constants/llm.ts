/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OBSERVABILITY_BASE } from './shared';

export const CHAT_API = {
  LLM: `${OBSERVABILITY_BASE}/chat/llm`,
} as const;

export const LANGCHAIN_API = {
  PPL_GENERATOR: `${OBSERVABILITY_BASE}/langchain/ppl`,
  AGENT_TEST: `${OBSERVABILITY_BASE}/langchain/agent`,
  FEEDBACK: `${OBSERVABILITY_BASE}/chat/feedback`,
} as const;

export const LLM_INDEX = {
  TRACES: 'langchain',
  FEEDBACK: '.llm-feedback',
};
