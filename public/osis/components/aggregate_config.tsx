/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import { dump } from 'js-yaml';
import React, { useEffect, useRef, useState } from 'react';
import { AggregationType, useAggregator } from '../hooks/use_aggregator';
import { useIndexFields } from '../hooks/use_index_fields';
import { PipelineConfig, SourceIndex } from '../utils/pipeline_config';

const aggregateActionOptions: Array<EuiComboBoxOptionOption<AggregationType>> = [
  { label: 'Count', value: 'count' },
  { label: 'Remove duplicates', value: 'remove_duplicates' },
  { label: 'Put all', value: 'put_all' },
  { label: 'Histogram', value: 'histogram' },
  { label: 'Rate limiter', value: 'rate_limiter' },
  { label: 'Percent sampler', value: 'percent_sampler' },
];

interface AggregateConfigProps {
  loading: boolean;
  sourceIndex: SourceIndex | undefined;
  setYamlConfig: React.Dispatch<React.SetStateAction<string>>;
  pipelineConfig: PipelineConfig;
}

export const AggregateConfig: React.FC<AggregateConfigProps> = (props) => {
  const indexFields = useIndexFields(props.sourceIndex?.name);
  const [aggConfig, setAggConfig] = useAggregator();
  const [destIndex, setDestIndex] = useState<string>();
  const [newPipelineName, setNewPipelineName] = useState<string>();

  useEffect(() => {
    if (destIndex && newPipelineName) {
      const newConfig = props.pipelineConfig.createNewPipeline(
        props.sourceIndex,
        aggConfig,
        destIndex,
        newPipelineName
      );
      if (newConfig) props.setYamlConfig(newConfig.getYamlConfig());
    }
  }, [aggConfig, destIndex, newPipelineName]);

  return (
    <EuiForm component="form">
      <EuiFormRow label="Destination index">
        <EuiFieldText
          placeholder="metrics"
          value={destIndex}
          onChange={(e) => setDestIndex(e.target.value)}
        />
      </EuiFormRow>
      <EuiFormRow label="New pipeline name">
        <EuiFieldText
          placeholder="my-new-pipeline"
          value={newPipelineName}
          onChange={(e) => setNewPipelineName(e.target.value)}
        />
      </EuiFormRow>
      <EuiFormRow label="Identification keys">
        <EuiComboBox
          placeholder="Select identification keys"
          isClearable={false}
          isLoading={props.loading}
          options={indexFields.data?.map((field) => ({ label: field.name }))}
          selectedOptions={aggConfig.identificationKeys?.map((key) => ({ label: key }))}
          onChange={(option) =>
            setAggConfig((prev) => ({
              ...prev,
              identificationKeys: option.map((key) => key.label),
            }))
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
            (option) => option.value === aggConfig.action
          )}
          onChange={(option) =>
            setAggConfig((prev) => ({
              action: option[0].value,
              identificationKeys: prev.identificationKeys,
            }))
          }
        />
      </EuiFormRow>
    </EuiForm>
  );
};
