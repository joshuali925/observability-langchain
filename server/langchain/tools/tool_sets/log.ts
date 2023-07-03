/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import { requestGuessingIndexChain } from '../../chains/guessing_index';
import { generateFieldContext } from '../../utils/ppl_generator';
import { logToFile, swallowErrors } from '../../utils/utils';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

export class LogSummaryTools extends PluginToolsFactory {
  toolsList = [
    new DynamicTool({
      name: 'Log Summary',
      description: 'Use to generate summary of log',
      func: swallowErrors(async (query: string) => {
        const summary = await this.summarize_log(query);
        return summary;
      }),
    }),
  ];

  /**
   * @returns non hidden OpenSearch index names as a list.
   */
  private async getIndexNameList() {
    const response = await this.opensearchClient.cat.indices({ format: 'json' });
    return response.body
      .map((index) => index.index)
      .filter((index) => index !== undefined && !index.startsWith('.')) as string[];
  }

  public async summarize_log(question: string, index?: string) {
    console.info('❗question:', question);

    if (!index) {
      const indexNameList = await this.getIndexNameList();
      const response = await requestGuessingIndexChain(question, indexNameList);
      index = response.index;
    }

    try {
      const [mappings, sampleDoc] = await Promise.all([
        this.opensearchClient.indices.getMapping({ index }),
        this.opensearchClient.search({ index, size: 1 }),
      ]);
      const fields = generateFieldContext(mappings, sampleDoc);

      const input = `Fields:\n${fields}\nQuestion: ${question}? index is \`${index}\``;
      const summary = 'THIS IS A FAKE SUMMARY!';

      logToFile({ question, input, summary }, 'LOG SUMMARIZER');

      console.info('❗SUMMARY:', summary);
      return summary;
    } catch (error) {
      logToFile({ question, error }, 'LOG SUMMARIZER');
      throw error;
    }
  }
}
