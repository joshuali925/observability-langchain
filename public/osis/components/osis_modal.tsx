/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PipelineSummary } from '@aws-sdk/client-osis';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiComboBoxOptionOption,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSteps,
} from '@elastic/eui';
import React, { useEffect, useMemo, useState } from 'react';
import { usePipeline, usePipelines } from '../hooks/use_pipelines';
import { PipelineConfig, SourceIndex } from '../utils/pipeline_config';
import { AggregateConfig } from './aggregate_config';
import { PipelineSelector } from './pipelines';
import { SourceIndexSelector } from './source_index';

interface OsisModalProps {
  close: () => void;
}

export const OsisModal: React.FC<OsisModalProps> = (props) => {
  const [yamlConfig, setYamlConfig] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<
    Array<EuiComboBoxOptionOption<PipelineSummary>>
  >([]);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<
    Array<EuiComboBoxOptionOption<SourceIndex>>
  >([]);

  const pipelines = usePipelines();
  const pipeline = usePipeline(selectedPipeline[0]?.value?.PipelineName);
  const pipelineConfig = useMemo(
    () => new PipelineConfig(pipeline.data?.Pipeline?.PipelineConfigurationBody),
    [pipeline.data]
  );

  useEffect(() => {
    setYamlConfig(pipelineConfig.getYamlConfig());
  }, [pipelineConfig]);

  const submit = async () => {};

  return (
    <EuiModal style={{ minWidth: 1200, minHeight: 600 }} onClose={props.close}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>Update pipeline</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiSteps
          steps={[
            {
              title: 'Pipeline',
              status: selectedPipeline.length ? 'complete' : undefined,
              children: (
                <PipelineSelector
                  pipelines={pipelines.data}
                  loading={pipelines.loading}
                  selected={selectedPipeline}
                  setSelected={setSelectedPipeline}
                />
              ),
            },
            {
              title: 'Source index',
              status: selectedSourceIndex.length ? 'complete' : undefined,
              children: (
                <SourceIndexSelector
                  sourceIndexes={pipelineConfig.findSourceIndexes()}
                  loading={pipeline.loading}
                  selected={selectedSourceIndex}
                  setSelected={setSelectedSourceIndex}
                />
              ),
            },
            {
              title: 'Aggregator',
              children: (
                <AggregateConfig
                  loading={pipeline.loading}
                  sourceIndex={selectedSourceIndex[0]?.value}
                  pipelineConfig={pipelineConfig}
                  setYamlConfig={setYamlConfig}
                />
              ),
            },
            {
              title: 'Preview',
              children: (
                <EuiCodeBlock language="yaml" paddingSize="s" isCopyable>
                  {yamlConfig}
                </EuiCodeBlock>
              ),
            },
          ]}
        />
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={props.close}>Cancel</EuiButtonEmpty>
        <EuiButton fill onClick={submit}>
          Submit
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
