/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React from 'react';
import { useIndexFields } from '../hooks/use_index_fields';

const aggregateActionOptions: Array<EuiComboBoxOptionOption<string>> = [
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
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiComboBox
          placeholder="Select identification keys"
          singleSelection={{ asPlainText: true }}
          fullWidth
          isClearable={false}
          isLoading={props.loading}
          options={[]}
          // selectedOptions={props.selected}
          // onChange={(newOption) => props.setSelected(newOption)}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiComboBox
          placeholder="Select aggregate action"
          singleSelection={{ asPlainText: true }}
          fullWidth
          isClearable={false}
          isLoading={props.loading}
          options={aggregateActionOptions}
          // selectedOptions={props.selected}
          // onChange={(newOption) => props.setSelected(newOption)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
