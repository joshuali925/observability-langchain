/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from 'langchain/tools';
import { PPL_DATASOURCES_REQUEST } from '../../../../common/constants/metrics';
import { requestGuessingIndexChain } from '../../chains/guessing_index';
import { requestPPLGeneratorChain } from '../../chains/ppl_generator';
import { generateFieldContext } from '../../utils/ppl_generator';
import { swallowErrors } from '../../utils/utils';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

interface PPLResponse {
  schema: Array<{ name: string; type: string }>;
  datarows: unknown[][];
  total: number;
  size: number;
}

export class PPLTools extends PluginToolsFactory {
  static TOOL_NAMES = {
    QUERY_OPENSEARCH: 'Query OpenSearch',
    QUERY_PROMETHEUS: 'Generate prometheus PPL query',
    EXECUTE: 'Execute PPL query',
    LOG_INFO: 'Log info',
    LOG_ERROR_INFO: 'Log error info',
  } as const;

  toolsList = [
    new DynamicTool({
      name: PPLTools.TOOL_NAMES.QUERY_OPENSEARCH,
      description:
        'Use to generate and run a PPL Query to get results for a generic user question. The input must be the original question as user phrased it without modifications',
      func: swallowErrors(async (query: string) => {
        const ppl = await this.generatePPL(query);
        const results = await this.executePPL(ppl);
        return `The PPL query is: ${ppl}\n\nThe results are:\n${JSON.stringify(results, null, 2)}`;
      }),
      callbacks: this.callbacks,
    }),
    /* new DynamicTool({
      name: PPLTools.NAMES.QUERY_PROMETHEUS,
      description:
        'Use this tool to generate a PPL query about metrics and prometheus. This tool take natural language question as input.',
      func: swallowErrors((query: string) => this.generatePrometheusPPL(query)),
      callbacks: this.callbacks,
    }), */
    new DynamicTool({
      name: PPLTools.TOOL_NAMES.EXECUTE,
      description: 'Use this tool to run a PPL query. This tool takes the PPL query as input.',
      func: swallowErrors((query: string) =>
        this.executePPL(query).then(
          (result) =>
            `The PPL query is: ${query}\n\nThe results are:\n${JSON.stringify(result, null, 2)}`
        )
      ),
      callbacks: this.callbacks,
    }),
    new DynamicTool({
      name: PPLTools.TOOL_NAMES.LOG_INFO,
      description:
        'Use to get information of logs if the question contains an OpenSearch log index. The input should be the name of the index',
      func: swallowErrors(async (index: string) => {
        const ppl = await this.generatePPL(`Give me log patterns? index is '${index}'`);
        const results = await this.executePPL(ppl);
        return `The PPL query is: ${ppl}\n\nThe results are:\n${JSON.stringify(results, null, 2)}`;
      }),
      callbacks: this.callbacks,
    }),
    new DynamicTool({
      name: PPLTools.TOOL_NAMES.LOG_ERROR_INFO,
      description:
        'Use to get information of logs with errors if the question contains an OpenSearch log index. The input should be the name of the index. The output is a representative log per each log pattern group.',
      func: swallowErrors(async (index: string) => {
        const ppl = await this.generatePPL(
          `Give me log patterns for logs with errors? index is '${index}'`
        );
        const results = await this.executePPL(ppl);
        return `The PPL query is: ${ppl}\n\nThe results are:\n${JSON.stringify(results, null, 2)}`;
      }),
      callbacks: this.callbacks,
    }),
  ];

  /**
   * @returns non hidden OpenSearch index names as a list.
   */
  private async getIndexNameList() {
    const response = await this.opensearchClient.cat.indices({ format: 'json', h: 'index' });
    return response.body
      .map((index) => index.index)
      .filter((index) => index !== undefined && !index.startsWith('.')) as string[];
  }

  private async getPrometheusMetricList() {
    const response = await this.executePPL(PPL_DATASOURCES_REQUEST);
    return Promise.all(
      response.datarows.map(([dataSource]) =>
        this.executePPL(`source = ${dataSource}.information_schema.tables`).then((tables) =>
          tables.datarows.map((row) => {
            const obj: { [k: string]: unknown } = {};
            row.forEach((value, i) => (obj[tables.schema[i].name] = value));
            return {
              table: `${obj.TABLE_CATALOG}.${obj.TABLE_NAME}`,
              type: obj.TABLE_TYPE as string,
              description: obj.REMARKS as string,
            };
          })
        )
      )
    ).then((responses) => responses.flat());
  }

  public async executePPL(query: string) {
    const response: PPLResponse = await this.observabilityClient.callAsCurrentUser('ppl.pplQuery', {
      body: { query },
    });
    return response;
  }

  public async generatePrometheusPPL(question: string, index?: string) {
    if (!index) {
      const prometheusMetricList = await this.getPrometheusMetricList();
      const response = await requestGuessingIndexChain(
        this.model,
        question,
        prometheusMetricList.map(
          (metric) => `index: ${metric.table}, description: ${metric.description}`
        ),
        this.callbacks
      );
      index = response.index;
    }
    return `source = ${index} | stats avg(@value) by span(@timestamp, 1h)`;
  }

  public async generatePPL(question: string, index?: string) {
    if (!index) {
      const indexNameList = await this.getIndexNameList();
      const response = await requestGuessingIndexChain(
        this.model,
        question,
        indexNameList,
        this.callbacks
      );
      index = response.index;
    }

    const [mappings, sampleDoc] = await Promise.all([
      this.opensearchClient.indices.getMapping({ index }),
      this.opensearchClient.search({ index, size: 1 }),
    ]);
    const fields = generateFieldContext(mappings, sampleDoc);

    const input = `Fields:\n${fields}\nQuestion: ${question}? index is \`${index}\``;
    const ppl = await requestPPLGeneratorChain(this.model, input, this.callbacks);
    ppl.query = ppl.query.replace(/`/g, ''); // workaround for https://github.com/opensearch-project/dashboards-observability/issues/509, https://github.com/opensearch-project/dashboards-observability/issues/557
    ppl.query = ppl.query.replace(/\bSPAN\(/g, 'span('); // workaround for https://github.com/opensearch-project/dashboards-observability/issues/759
    return ppl.query;
  }
}
