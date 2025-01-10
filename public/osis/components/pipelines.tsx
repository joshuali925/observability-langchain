/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ListPipelinesCommandOutput, PipelineSummary } from '@aws-sdk/client-osis';
import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import React from 'react';

interface PipelineSelectorProps {
  loading: boolean;
  pipelines: ListPipelinesCommandOutput | undefined;
  selected: Array<EuiComboBoxOptionOption<PipelineSummary>>;
  setSelected: React.Dispatch<
    React.SetStateAction<Array<EuiComboBoxOptionOption<PipelineSummary>>>
  >;
}

export const PipelineSelector: React.FC<PipelineSelectorProps> = (props) => {
  return (
    <>
      <EuiComboBox
        placeholder="Select a pipeline"
        singleSelection={{ asPlainText: true }}
        fullWidth
        isClearable={false}
        isLoading={props.loading}
        options={
          props.pipelines?.Pipelines?.filter(
            (pipeline) => pipeline.PipelineArn !== undefined
          ).map((pipeline) => ({ label: pipeline.PipelineArn!, value: pipeline })) || []
        }
        selectedOptions={props.selected}
        onChange={(newOption) => props.setSelected(newOption)}
      />
    </>
  );
};
