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
  EuiModal,
} from '@elastic/eui';
import { CatIndicesResponse } from '@opensearch-project/opensearch/api/types';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IndexPatternAttributes } from '../../../../../../../src/plugins/data/common';
import { RAW_QUERY } from '../../../../../common/constants/explorer';
import { LANGCHAIN_API } from '../../../../../common/constants/llm';
import { DSL_BASE, DSL_CAT } from '../../../../../common/constants/shared';
import { getOSDHttp } from '../../../../../common/utils';
import { coreRefs } from '../../../../framework/core_refs';
import {
  FeedbackFormData,
  FeedbackModalContent,
} from '../../../llm_chat/components/feedback_modal';
import { GenericReducer, genericReducer } from '../../../llm_chat/hooks/fetch_reducer';
import { changeQuery } from '../../redux/slices/query_slice';

interface Props {
  handleQueryChange: (query: string) => void;
  handleTimeRangePickerRefresh: () => void;
  tabId: string;
}
export const LLMInput: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const questionRef = useRef<HTMLInputElement>(null);
  const { data: indices, loading: indicesLoading } = useCatIndices();
  const { data: indexPatterns, loading: indexPatternsLoading } = useGetIndexPatterns();
  const [generating, setGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<EuiComboBoxOptionOption[]>([
    { label: 'opensearch_dashboards_sample_data_flights' },
  ]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState<FeedbackFormData>({
    input: '',
    output: '',
    correct: undefined,
    expectedOutput: '',
    comment: '',
  });
  const data =
    indexPatterns && indices
      ? [...indexPatterns, ...indices].filter(
          (v1, index, array) => array.findIndex((v2) => v1.label === v2.label) === index
        )
      : undefined;
  const loading = indicesLoading || indexPatternsLoading;

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.value = 'what are the longest flights in the past day';
    }
  }, []);

  // hide if not in a tab
  if (props.tabId === '') return null;

  const request = async () => {
    if (!selectedIndex.length) return;
    try {
      setGenerating(true);
      const response = await getOSDHttp().post(LANGCHAIN_API.PPL_GENERATOR, {
        body: JSON.stringify({
          question: questionRef.current?.value,
          index: selectedIndex[0].label,
        }),
      });
      setFeedbackFormData({
        ...feedbackFormData,
        input: questionRef.current?.value || '',
        output: response,
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
    } catch (error) {
      setFeedbackFormData({
        ...feedbackFormData,
        input: questionRef.current?.value || '',
      });
      coreRefs.toasts?.addError(error, { title: 'Failed to generate PPL query' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <EuiFlexGroup gutterSize="s">
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
          <EuiButton isLoading={generating} onClick={request}>
            Predict
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton iconType="faceHappy" iconSide="right" onClick={() => setIsFeedbackOpen(true)}>
            Feedback
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isFeedbackOpen && (
        <EuiModal onClose={() => setIsFeedbackOpen(false)}>
          <FeedbackModalContent
            metadata={{ type: 'event_analytics', selectedIndex: selectedIndex[0].label }}
            formData={feedbackFormData}
            setFormData={setFeedbackFormData}
            onClose={() => setIsFeedbackOpen(false)}
            displayLabels={{
              correct: 'Did the results from the generated query answer your question?',
            }}
          />
        </EuiModal>
      )}
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

export const useGetIndexPatterns = () => {
  const reducer: GenericReducer<EuiComboBoxOptionOption[]> = genericReducer;
  const [state, dispatch] = useReducer(reducer, { loading: false });
  const [refresh, setRefresh] = useState({});

  useEffect(() => {
    let abort = false;
    dispatch({ type: 'request' });

    coreRefs
      .savedObjectsClient!.find<IndexPatternAttributes>({ type: 'index-pattern', perPage: 10000 })
      .then((payload) => {
        if (!abort)
          dispatch({
            type: 'success',
            payload: payload.savedObjects.map((meta) => ({ label: meta.attributes.title })),
          });
      })
      .catch((error) => {
        if (!abort) dispatch({ type: 'failure', error });
      });

    return () => {
      abort = true;
    };
  }, [refresh]);

  return { ...state, refresh: () => setRefresh({}) };
};
