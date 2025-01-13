/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { UpdatePipelineCommandOutput } from '@aws-sdk/client-osis';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeBlock,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSteps,
} from '@elastic/eui';
import React, { useEffect, useMemo, useState } from 'react';
import { API } from '../../../common/utils/constants';
import { usePipeline, usePipelines } from '../hooks/use_pipelines';
import { usePipelineState } from '../hooks/use_pipeline_state';
import { PipelineConfig } from '../utils/pipeline_config';
import { AggregateConfig } from './aggregate_config';
import { useOsisContext } from './osis_icon';
import { PipelineSelector } from './pipelines';
import { SourceIndexSelector } from './source_index';

interface OsisModalProps {
  close: () => void;
}

export const OsisModal: React.FC<OsisModalProps> = (props) => {
  const context = useOsisContext();
  const { state } = usePipelineState();

  const [yamlConfig, setYamlConfig] = useState('');

  const pipelines = usePipelines();
  const pipeline = usePipeline(state.pipeline?.PipelineName);
  const pipelineConfig = useMemo(
    () => new PipelineConfig(pipeline.data?.Pipeline?.PipelineConfigurationBody),
    [pipeline.data]
  );

  useEffect(() => {
    if (pipelines.error)
      context.notifications.toasts.addError(pipelines.error, { title: 'Failed to list pipelines' });
  }, [pipelines.error]);

  useEffect(() => {
    if (pipeline.error)
      context.notifications.toasts.addError(pipeline.error, { title: 'Failed to get pipeline' });
  }, [pipeline.error]);

  useEffect(() => {
    if (state.sourceIndex && state.destIndex && state.newPipelineName) {
      const newConfig = pipelineConfig.createNewPipeline(
        state.sourceIndex,
        state.aggregatorConfig,
        state.destIndex,
        state.newPipelineName
      );
      if (newConfig) setYamlConfig(newConfig.getYamlConfig());
      return;
    }
    setYamlConfig(pipelineConfig.getYamlConfig());
  }, [pipelineConfig, state]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    await context.http
      .put<UpdatePipelineCommandOutput>(`${API.PIPELINE}/${state.pipeline?.PipelineName}`, {
        body: JSON.stringify({ config: yamlConfig }),
      })
      .then(props.close)
      .catch((error) => context.notifications.toasts.addError(error, { title: 'Failed to submit' }))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <EuiModal style={{ minWidth: 1024 }} onClose={props.close}>
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
              status: state.pipeline ? 'complete' : undefined,
              children: <PipelineSelector pipelines={pipelines.data} loading={pipelines.loading} />,
            },
            {
              title: 'Source index',
              status: state.sourceIndex ? 'complete' : undefined,
              children: (
                <SourceIndexSelector
                  sourceIndexes={pipelineConfig.findSourceIndexes()}
                  loading={pipeline.loading}
                />
              ),
            },
            {
              title: 'Aggregator',
              children: (
                <AggregateConfig
                  loading={pipeline.loading}
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
        <EuiButton fill onClick={submit} isLoading={isSubmitting}>
          Submit
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
