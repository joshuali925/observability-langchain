/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { load } from 'js-yaml';

interface PipelineConfigSchema {
  [key: string]: {
    sink?: Array<{
      opensearch?: {
        index?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
}

export interface SourceIndex {
  name: string;
  path: string;
}

export class PipelineConfig {
  private config: PipelineConfigSchema | undefined;
  private sinkIndexes: SourceIndex[] | undefined;

  constructor(yaml: string | undefined) {
    if (yaml) {
      const parsed = load(yaml);
      if (typeof parsed === 'object') this.config = parsed as PipelineConfigSchema;
    }
  }

  getJsonConfig() {
    return this.config || {};
  }

  findSourceIndexes() {
    if (!this.config) {
      return [];
    }
    if (!this.sinkIndexes) {
      this.sinkIndexes = [];
      Object.entries(this.config).forEach(([pipelineName, pipelineConfig]) => {
        if (pipelineConfig.sink && Array.isArray(pipelineConfig.sink)) {
          pipelineConfig.sink.forEach((sink, sinkIndex) => {
            if (sink.opensearch?.index) {
              const path = `${pipelineName}.sink.${sinkIndex}.opensearch.index`;
              this.sinkIndexes!.push({ name: sink.opensearch.index, path });
            }
          });
        }
      });
    }
    return this.sinkIndexes;
  }
}
