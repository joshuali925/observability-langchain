/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { CatIndicesResponse } from '@opensearch-project/opensearch/api/types';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RAW_QUERY } from '../../../../../common/constants/explorer';
import { LANGCHAIN_API } from '../../../../../common/constants/llm';
import { DSL_BASE, DSL_CAT } from '../../../../../common/constants/shared';
import { getOSDHttp } from '../../../../../common/utils';
import { genericReducer, GenericReducer } from '../../../llm_chat/hooks/fetch_reducer';
import { changeQuery } from '../../redux/slices/query_slice';

interface Props {
  handleQueryChange: (query: string) => void;
  handleTimeRangePickerRefresh: () => void;
  tabId: string;
}
export const LLMInput: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const questionRef = useRef<HTMLInputElement>(null);
  const { data, loading } = useCatIndices();
  const [selectedIndex, setSelectedIndex] = useState<EuiComboBoxOptionOption[]>([
    { label: 'opensearch_dashboards_sample_data_flights' },
  ]);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.value = 'what are the longest flights in the past day';
    }
  }, []);

  // hide if not in a tab
  if (props.tabId === '') return null;

  const request = async () => {
    if (!selectedIndex.length) return;
    const response = await getOSDHttp().post(LANGCHAIN_API.PPL_GENERATOR, {
      body: JSON.stringify({
        question: questionRef.current?.value,
        index: selectedIndex[0].label,
      }),
    });
    await props.handleQueryChange(response);
    await dispatch(
      changeQuery({
        tabId: props.tabId,
        data: {
          [RAW_QUERY]: response,
        },
      })
    );
    await props.handleTimeRangePickerRefresh();
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 300 }}>
          <EuiComboBox
            placeholder="Select an index"
            isClearable={false}
            prepend={['Index']}
            singleSelection={{ asPlainText: true }}
            isLoading={loading}
            options={data}
            selectedOptions={selectedIndex}
            onChange={(index) => setSelectedIndex(index)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFieldText
            placeholder="What are the longest flights in the past day"
            prepend={['Question']}
            fullWidth
            inputRef={questionRef}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={request}>Predict</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export const useCatIndices = () => {
  const reducer: GenericReducer<EuiComboBoxOptionOption[]> = genericReducer;
  const [state, dispatch] = useReducer(reducer, { loading: false });
  const [refresh, setRefresh] = useState({});

  useEffect(() => {
    const abortController = new AbortController();
    dispatch({ type: 'request' });
    getOSDHttp()
      .get(`${DSL_BASE}${DSL_CAT}`, { query: { format: 'json' }, signal: abortController.signal })
      .then((payload: CatIndicesResponse) =>
        dispatch({ type: 'success', payload: payload.map((meta) => ({ label: meta.index! })) })
      )
      .catch((error) => dispatch({ type: 'failure', error }));

    return () => abortController.abort();
  }, [refresh]);

  return { ...state, refresh: () => setRefresh({}) };
};