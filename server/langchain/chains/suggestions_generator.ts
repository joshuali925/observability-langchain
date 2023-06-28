/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LLMChain } from 'langchain/chains';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { BufferMemory } from 'langchain/memory';
import { BaseChatMessage } from 'langchain/schema';
import { Tool } from 'langchain/tools';
import { llmModel } from '../models/llm_model';

const template = `
You will be given a chat history between OpenSearch Assistant and a Human.
Use the context provided to generate follow up questions the Human would ask to the Assistant.

The Assistant can answer general questions about logs, traces and metrics.
The Assistant is an expert in 

Assistant can access a set of tools listed below to answer questions given by the Human:
{tools_description}

The Human is currently on this screen in the OpenSearch Dashboards app page
{app_url}

Here's the chat history between the human and the Assistant.
{chat_history}


Use the following steps to generate follow up questions Human may ask after the response of the Assistant:

Step 1. Use the chat history to understand what human is trying to search and explore.

Step 2. Use the app page and try to relate tools for this page.

Step 3. Understand what capabilities the assistant has with the set of tools it has access to.

Step 4. Use the above context and generate follow up questions.

----------------
{format_instructions}
----------------
`.trim();

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  question1: 'This is the first follow up question',
  question2: 'This is the second follow up question',
});
const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template,
  inputVariables: ['tools_description', 'chat_history', 'app_url'],
  partialVariables: { format_instructions: formatInstructions },
});

const convertChatToStirng = (chatMessages: BaseChatMessage[]) => {
  const chatString = chatMessages
    .map((message) => `${message._getType()}: ${message.text}`)
    .join('\n');
  return chatString;
};

const parseURL = (appURL: string) => {
  let appURLContents = '';

  if (appURL !== '') {
    // TODO: Remove the split functions and use inbuilt functions for URL parsing
    const parsedAppURL = appURL.split('/app/').at(-1);
    const appName = parsedAppURL!.split('#/').at(0) || '';
    const appContent = parsedAppURL!.split('#/').at(-1) || '';
    const appContentPrefix = appContent.split('?').at(0) || '';
    const appParams = appContent.split('?').at(-1) || '';

    let params = appParams.replaceAll('=', ': ');
    params = params.replaceAll('&', ', ');
    appURLContents = `App name: ${appName} \n hash route: ${appContentPrefix} \n params: ${params}`;
  }
  return appURLContents;
};

export const requestSuggestionsChain = async (tools: Tool[], memory: BufferMemory, appURL = '') => {
  const toolsContext = tools.map((tool) => `${tool.name}: ${tool.description}`).join('\n');

  const chatHistory = memory.chatHistory;
  // TODO: Reduce the message history (may be to last six chat pairs) sent to the chain in the context.
  const chatContext = convertChatToStirng(await chatHistory.getMessages());
  const chain = new LLMChain({ llm: llmModel.model, prompt });

  const output = await chain.call({
    tools_description: toolsContext,
    chat_history: chatContext,
    app_url: parseURL(appURL),
  });
  return parser.parse(output.text);
};
