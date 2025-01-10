/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PipelineSummary } from '@aws-sdk/client-osis';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiComboBoxOptionOption,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSteps,
} from '@elastic/eui';
import React, { useMemo, useRef, useState } from 'react';
import { usePipeline, usePipelines } from '../hooks/use_pipelines';
import { PipelineConfig, SourceIndex } from '../utils/pipeline_config';
import { AggregateConfig } from './aggregate_config';
import { Configuration } from './configuration';
import { PipelineSelector } from './pipelines';
import { SourceIndexSelector } from './source_index';

interface OsisModalProps {
  close: () => void;
}

export const OsisModal: React.FC<OsisModalProps> = (props) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<
    Array<EuiComboBoxOptionOption<PipelineSummary>>
  >([]);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<
    Array<EuiComboBoxOptionOption<SourceIndex>>
  >([]);

  const pipelines = usePipelines();
  const pipeline = usePipeline(selectedPipeline[0]?.value?.PipelineName);
  const config = useMemo(
    () => new PipelineConfig(pipeline.data?.Pipeline?.PipelineConfigurationBody),
    [pipeline.data]
  );

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
                  sourceIndexes={config.findSourceIndexes()}
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
                  sourceIndex={selectedSourceIndex[0]?.value?.name}
                />
              ),
            },
            {
              title: 'Configuration',
              children: <Configuration textAreaRef={textAreaRef} config={config.getJsonConfig()} />,
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
