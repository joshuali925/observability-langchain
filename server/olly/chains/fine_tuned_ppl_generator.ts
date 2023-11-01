/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModel } from 'langchain/base_language';
import { Callbacks } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

const template = `
Below is an instruction that describes a task, paired with the index and corresponding fields that provides further context. Write a response that appropriately completes the request.

### Instruction:
I have an opensearch index with fields in the following.Now I have a question: {instruction} Can you help me generate a PPL for that?

### Index:
{index}

### Fields:
{context}

### Response: \n`;

const prompt = new PromptTemplate({
  template,
  inputVariables: ['instruction', 'index', 'context'],
});

export const requestFineTunedPPLGeneratorChain = async (
  model: BaseLanguageModel,
  index: string,
  context: string,
  instrucion: string,
  callbacks?: Callbacks
) => {
  const chain = new LLMChain({ llm: model, prompt });
  const output = await chain.call({ instruction: instrucion, context, index }, callbacks);
  return output.text;
};
