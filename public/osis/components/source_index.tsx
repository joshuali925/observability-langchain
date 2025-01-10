/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import React from 'react';
import { SourceIndex } from '../utils/pipeline_config';

interface SourceIndexSelectorProps {
  loading: boolean;
  sourceIndexes: SourceIndex[];
  selected: Array<EuiComboBoxOptionOption<SourceIndex>>;
  setSelected: React.Dispatch<React.SetStateAction<Array<EuiComboBoxOptionOption<SourceIndex>>>>;
}

export const SourceIndexSelector: React.FC<SourceIndexSelectorProps> = (props) => {
  return (
    <>
      <EuiComboBox
        placeholder="Select a source index"
        singleSelection={{ asPlainText: true }}
        fullWidth
        isClearable={false}
        isLoading={props.loading}
        options={props.sourceIndexes.map((index) => ({ label: index.name, value: index }))}
        selectedOptions={props.selected}
        onChange={(newOption) => props.setSelected(newOption)}
      />
    </>
  );
};
