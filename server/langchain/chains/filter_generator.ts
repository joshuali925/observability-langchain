/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseLanguageModel } from 'langchain/base_language';
import { Callbacks } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';

const template = `
From the question, generate the user start and end times filters for their query. 

Time formats can be absolute or relative. 

If absolute, they are structured as "%year-%month-%dateT%hour:$minute.%secondZ". An example would be "2004-08-01T16:03:02Z-7:00" meaning a time of August 1st, 2004, 4:03.022 PM, in the Pacific Time Zone.
If relative, they are relative to "now", and are structured as "now+%n%u" for in the future, or "now-%n%u" for in the past. The %n is a number, and %u is a unit of measurement. For units, "s" means seconds, "m" means minutes, "h" means hours, "d" means days, "w" means weeks, "M" means months, and "y" means years. An example would be "now-3w" meaning 3 weeks before now, and "now+4y" meaning 4 years from now. 

If you cannot generate the times, or if the user does not reference any kind of date or time in their question, return the default start time as 5 years before now, and default end time as now.

---------------

Use the following steps to generate the start and end times:

Step 1. Use the user's query to write the start and end times, in either absolute or relative time format as specified above.

Step 2. Return those in a JSON object, where the keys are 'start_time' and 'end_time', and the values are the generated start and end times, respectively
    where start_time is the generated start time, and end_time is the generated end time

{format_instructions}
---------------

Question: {question}

`.trim();

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  start_time: 'This is the start time',
  end_time: 'This is the end time',
});
const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template,
  inputVariables: ['question'],
  partialVariables: { format_instructions: formatInstructions },
});

export const requestTimesFiltersChain = async (
  model: BaseLanguageModel,
  question: string,
  callbacks?: Callbacks
) => {
  console.log(question);
  const chain = new LLMChain({ llm: model, prompt });
  const output = await chain.call({ question }, callbacks);
  return parser.parse(output.text);
};
