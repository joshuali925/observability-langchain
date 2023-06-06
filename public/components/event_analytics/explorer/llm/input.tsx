/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiCode,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiCopy,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { CatIndicesResponse } from '@opensearch-project/opensearch/api/types';
import React, { Reducer, useEffect, useReducer, useRef, useState } from 'react';
import { LANGCHAIN_API } from '../../../../../common/constants/llm';
import { DSL_BASE, DSL_CAT } from '../../../../../common/constants/shared';
import { getOSDHttp } from '../../../../../common/utils';

interface Props {
  handleQueryChange: (query: string) => void;
}
export const LLMInput: React.FC<Props> = (props) => {
  const questionRef = useRef<HTMLInputElement>(null);
  const { data, loading } = useCatIndices();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<EuiComboBoxOptionOption[]>([
    { label: 'opensearch_dashboards_sample_data_flights' },
  ]);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.value = 'what are the longest flights in the past day';
    }
  }, []);

  const request = async () => {
    if (!selectedIndex.length) return;
    const response = await getOSDHttp().post(LANGCHAIN_API.PPL_GENERATOR, {
      body: JSON.stringify({
        question: questionRef.current?.value,
        index: selectedIndex[0].label,
      }),
    });
    console.info('❗response:', response);
    setQuery(response.query);
    props.handleQueryChange(response.query);
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={1}>
          <EuiComboBox
            placeholder="Select an index"
            fullWidth
            isClearable={false}
            prepend={['Index']}
            singleSelection={{ asPlainText: true }}
            isLoading={loading}
            options={data}
            selectedOptions={selectedIndex}
            onChange={(index) => setSelectedIndex(index)}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFieldText prepend={['Question']} fullWidth inputRef={questionRef} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={request}>Predict</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      {query ? (
        <>
          <EuiSpacer size="s" />
          <EuiText>
            Copy/paste the query below to test:{' '}
            <EuiCopy textToCopy={query}>
              {(copy) => (
                <EuiButtonIcon aria-label="Copy PPL query" iconType="copyClipboard" onClick={copy}>
                  Click to copy
                </EuiButtonIcon>
              )}
            </EuiCopy>
          </EuiText>
          <EuiText>
            <EuiCode>{query}</EuiCode>
          </EuiText>
        </>
      ) : null}
      <EuiSpacer />
    </>
  );
};

interface State<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}
type Action<T> =
  | { type: 'request' }
  | { type: 'success'; payload: State<T>['data'] }
  | { type: 'failure'; error: Required<State<T>['error']> };
type GenericReducer<T = any> = Reducer<State<T>, Action<T>>;
const genericReducer: GenericReducer = (state, action) => {
  switch (action.type) {
    case 'request':
      return { loading: true };
    case 'success':
      return { loading: false, data: action.payload };
    case 'failure':
      return { loading: false, error: action.error };
    default:
      return state;
  }
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
