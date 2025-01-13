/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { dump, load } from 'js-yaml';
import _ from 'lodash';
import { AggregatorConfig } from '../hooks/use_pipeline_state';

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
  pipelineName: string;
  sinkIdx: number;
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

  getYamlConfig() {
    return dump(this.config, { forceQuotes: true });
  }

  findSourceIndexes() {
    if (!this.config) {
      return [];
    }
    if (!this.sinkIndexes) {
      this.sinkIndexes = [];
      Object.entries(this.config).forEach(([pipelineName, pipelineConfig]) => {
        if (pipelineConfig.sink && Array.isArray(pipelineConfig.sink)) {
          pipelineConfig.sink.forEach((sink, sinkIdx) => {
            if (sink.opensearch?.index) {
              // path = ${pipelineName}.sink.${sinkIdx}.opensearch.index
              this.sinkIndexes!.push({ name: sink.opensearch.index, pipelineName, sinkIdx });
            }
          });
        }
      });
    }
    return this.sinkIndexes;
  }

  createNewPipeline(
    sourceIndex: SourceIndex,
    aggConfig: Partial<AggregatorConfig>,
    destIndex: string,
    pipelineName: string
  ): PipelineConfig | undefined {
    if (!this.config) return undefined;

    const newConfig = new PipelineConfig(undefined);
    newConfig.config = _.cloneDeep(this.config);

    const sourcePipeline = newConfig.config[sourceIndex.pipelineName];
    if (!sourcePipeline.sink?.at(sourceIndex.sinkIdx)) return undefined;

    const opensearchSink = _.cloneDeep(sourcePipeline.sink.at(sourceIndex.sinkIdx))!;
    opensearchSink.opensearch!.index = destIndex;

    sourcePipeline.sink.push({ pipeline: { name: pipelineName } });

    newConfig.config[pipelineName] = {
      source: { pipeline: { name: sourceIndex.pipelineName } },
      processor: [
        {
          aggregate: {
            identification_keys: aggConfig.identificationKeys,
            action: { count: null },
            group_duration: aggConfig.groupDuration,
          },
        },
      ],
      sink: [opensearchSink],
    };

    return newConfig;
  }
}
