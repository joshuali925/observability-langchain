/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox } from '@elastic/eui';
import React from 'react';
import { usePipelineState } from '../hooks/use_pipeline_state';
import { SourceIndex } from '../utils/pipeline_config';

interface SourceIndexSelectorProps {
  loading: boolean;
  sourceIndexes: SourceIndex[];
}

export const SourceIndexSelector: React.FC<SourceIndexSelectorProps> = (props) => {
  const { state, dispatch } = usePipelineState();
  const options = props.sourceIndexes.map((index) => ({ label: index.name, value: index }));
  return (
    <>
      <EuiComboBox
        placeholder="Select a source index"
        singleSelection={{ asPlainText: true }}
        fullWidth
        isClearable={false}
        isLoading={props.loading}
        options={options}
        selectedOptions={options.filter((option) => option.value === state.sourceIndex)}
        onChange={(newOption) =>
          dispatch({ type: 'setState', payload: { sourceIndex: newOption.at(0)?.value } })
        }
      />
    </>
  );
};
