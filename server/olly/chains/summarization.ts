/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModel } from 'langchain/base_language';
import { Callbacks } from 'langchain/callbacks';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { OpenSearchClient } from '../../../../../src/core/server';
import { SummarizationRequestSchema } from '../../routes/langchain_routes';
import { generateFieldContext } from '../utils/ppl_generator';
import { truncate } from '../utils/utils';

interface SummarizationContext extends SummarizationRequestSchema {
  client: OpenSearchClient;
  model: BaseLanguageModel;
}

const createPrompt = async (context: SummarizationContext) => {
  if (!context.isError) {
    return `You will be given a search response, summarize it as a concise paragraph while considering the following:
User's question on index '${context.index}': ${context.question}
PPL (Piped Processing Language) query used: ${context.query}

Give some documents to support your point.

Skip the introduction; go straight into the summarization.`;
  }

  const [mappings, sampleDoc] = await Promise.all([
    context.client.indices.getMapping({ index: context.index }),
    context.client.search({ index: context.index, size: 1 }),
  ]);
  const fields = generateFieldContext(mappings, sampleDoc);

  return `You will be given an API response with errors, summarize it as a concise paragraph, then give some suggestions on how to fix the error.
Considering the following:
User's question on index '${context.index}': ${context.question}
${context.query ? 'PPL (Piped Processing Language) query used: ' + context.query : ''}

Additionally recommend 2 or 3 possible questions on this index given the fields below. Only give the questions, do not give descriptions of questions. The format for a field is
\`\`\`
- field_name: field_type (sample field value)
\`\`\`

Fields:
${fields}

Skip the introduction; go straight into the summarization.`;
};

/**
 * Generate a summary based on user question, corresponding PPL query, and
 * query results.
 *
 * @param context
 * @param callbacks
 * @returns summarized text
 */
export const requestSummarizationChain = async (
  context: SummarizationContext,
  callbacks?: Callbacks
) => {
  const chain = loadQAStuffChain(context.model);
  // vector search doesn't help much since the response is already retrieved based on user's question
  const docs = [new Document({ pageContent: truncate(context.response) })];
  const question = await createPrompt(context);
  const output = await chain.call({ input_documents: docs, question }, { callbacks });
  return output.text;
};
