/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import React from 'react';
import { useIndexFields } from '../hooks/use_index_fields';
import { AggregationType, usePipelineState } from '../hooks/use_pipeline_state';
import { PipelineConfig } from '../utils/pipeline_config';

const aggregateActionOptions: Array<EuiComboBoxOptionOption<AggregationType>> = [
  { label: 'Count', value: 'count' },
  { label: 'Histogram', value: 'histogram' },
];

interface AggregateConfigProps {
  loading: boolean;
  setYamlConfig: React.Dispatch<React.SetStateAction<string>>;
  pipelineConfig: PipelineConfig;
}

export const AggregateConfig: React.FC<AggregateConfigProps> = (props) => {
  const { state, dispatch } = usePipelineState();
  const indexFields = useIndexFields(state.sourceIndex?.name);

  return (
    <EuiForm component="form">
      <EuiFormRow label="Destination index">
        <EuiFieldText
          placeholder="metrics"
          value={state.destIndex}
          onChange={(e) =>
            dispatch({ type: 'setState', payload: { destIndex: e.target.value } })
          }
        />
      </EuiFormRow>
      <EuiFormRow label="New pipeline name">
        <EuiFieldText
          placeholder="my-new-pipeline"
          value={state.newPipelineName}
          onChange={(e) =>
            dispatch({ type: 'setState', payload: { newPipelineName: e.target.value } })
          }
        />
      </EuiFormRow>
      <EuiFormRow label="Identification keys">
        <EuiComboBox
          placeholder="Select identification keys"
          isClearable={false}
          isLoading={props.loading}
          options={indexFields.data?.map((field) => ({ label: field.name }))}
          selectedOptions={state.aggregatorConfig.identificationKeys?.map((key) => ({
            label: key,
          }))}
          onChange={(option) =>
            dispatch({
              type: 'setAggregatorProperty',
              payload: { identificationKeys: option.map((key) => key.label) },
            })
          }
        />
      </EuiFormRow>
      <EuiFormRow label="Aggregate action">
        <EuiComboBox
          placeholder="Select aggregate action"
          singleSelection={{ asPlainText: true }}
          isClearable={false}
          isLoading={props.loading}
          options={aggregateActionOptions}
          selectedOptions={aggregateActionOptions.filter(
            (option) => option.value === state.aggregatorConfig.action
          )}
          onChange={(option) =>
            dispatch({
              type: 'setAggregatorAction',
              payload: option[0].value,
            })
          }
        />
      </EuiFormRow>
      <EuiFormRow
        label="Group duration"
        helpText="The amount of time that a group should exist before it is concluded automatically. Default is 180s."
      >
        <EuiFieldText
          placeholder="30s"
          value={state.aggregatorConfig.groupDuration}
          onChange={(e) =>
            dispatch({
              type: 'setAggregatorProperty',
              payload: { groupDuration: e.target.value },
            })
          }
        />
      </EuiFormRow>
    </EuiForm>
  );
};
