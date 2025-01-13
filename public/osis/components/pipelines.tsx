/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ListPipelinesCommandOutput } from '@aws-sdk/client-osis';
import { EuiComboBox } from '@elastic/eui';
import React from 'react';
import { usePipelineState } from '../hooks/use_pipeline_state';

interface PipelineSelectorProps {
  loading: boolean;
  pipelines: ListPipelinesCommandOutput | undefined;
}

export const PipelineSelector: React.FC<PipelineSelectorProps> = (props) => {
  const { state, dispatch } = usePipelineState();
  const options =
    props.pipelines?.Pipelines?.filter(
      (pipeline) => pipeline.PipelineArn !== undefined
    ).map((pipeline) => ({ label: pipeline.PipelineArn!, value: pipeline })) || [];
  return (
    <>
      <EuiComboBox
        placeholder="Select a pipeline"
        singleSelection={{ asPlainText: true }}
        fullWidth
        isClearable={false}
        isLoading={props.loading}
        options={options}
        selectedOptions={options.filter((option) => option.value === state.pipeline)}
        onChange={(newOption) =>
          dispatch({ type: 'selectPipeline', payload: newOption.at(0)?.value })
        }
      />
    </>
  );
};
