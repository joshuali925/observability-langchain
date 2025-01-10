/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
} from '@elastic/eui';
import React, { useState } from 'react';
import { IFieldType } from '../../../../../src/plugins/data/common';
import { AggregationType, useAggregator } from '../hooks/use_aggregator';
import { useIndexFields } from '../hooks/use_index_fields';

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
  sourceIndex: string | undefined;
}

export const AggregateConfig: React.FC<AggregateConfigProps> = (props) => {
  const indexFields = useIndexFields(props.sourceIndex);
  const [selectedIdentificationKeys, setSelectedIdentificationKeys] = useState<
    Array<EuiComboBoxOptionOption<IFieldType>>
  >([]);
  const [config, setConfig] = useAggregator();

  return (
    <EuiForm component="form">
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Aggregate action">
            <EuiComboBox
              placeholder="Select aggregate action"
              singleSelection={{ asPlainText: true }}
              fullWidth
              isClearable={false}
              isLoading={props.loading}
              options={aggregateActionOptions}
              selectedOptions={aggregateActionOptions.filter(
                (option) => option.value === config.action
              )}
              onChange={(option) => setConfig({ action: option[0].value })}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Identification keys">
            <EuiComboBox
              placeholder="Select identification keys"
              fullWidth
              isClearable={false}
              isLoading={props.loading}
              options={indexFields.data?.map((field) => ({ label: field.name, value: field }))}
              selectedOptions={selectedIdentificationKeys}
              onChange={(newOption) => setSelectedIdentificationKeys(newOption)}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};
