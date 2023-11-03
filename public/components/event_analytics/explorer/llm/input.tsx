/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiSpacer,
} from '@elastic/eui';
import { CatIndicesResponse } from '@opensearch-project/opensearch/api/types';
import React, { Reducer, useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IndexPatternAttributes } from '../../../../../../../src/plugins/data/common';
import { RAW_QUERY } from '../../../../../common/constants/explorer';
import { DSL_BASE, DSL_CAT } from '../../../../../common/constants/shared';
import { getOSDHttp } from '../../../../../common/utils';
import { coreRefs } from '../../../../framework/core_refs';
import { changeQuery } from '../../redux/slices/query_slice';
import { FeedbackFormData, FeedbackModalContent } from './feedback_modal';

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
    { label: 'sso_logs-*-*' },
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
      questionRef.current.value = 'Are there any errors in my logs?';
    }
  }, []);

  // hide if not in a tab
  if (props.tabId === '') return props.children;

  const request = async () => {
    if (!selectedIndex.length) return;
    try {
      setGenerating(true);
      const response = await getOSDHttp().post('/api/assistant/generate_ppl', {
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
      <EuiSpacer size="s" />
      {props.children}
      <EuiAccordion id="ppl-assistant" buttonContent="Query assist" initialIsOpen={true}>
        <EuiFlexGroup gutterSize="s" style={{ paddingTop: 10 }}>
          <EuiFlexItem grow={false} style={{ width: 20 }} />
          <EuiFlexItem>
            <EuiFieldText
              placeholder="Ask a question"
              prepend={['Question']}
              fullWidth
              inputRef={questionRef}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              isLoading={generating}
              onClick={request}
              iconType="returnKey"
              iconSide="right"
              fill
              style={{ width: 100 }}
            >
              Go
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => setIsFeedbackOpen(true)}
              iconType="faceHappy"
              iconSide="right"
            >
              Feedback
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiAccordion>
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

interface State<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

type Action<T> =
  | { type: 'request' }
  | { type: 'success'; payload: State<T>['data'] }
  | { type: 'failure'; error: NonNullable<State<T>['error']> };

// TODO use instantiation expressions when typescript is upgraded to >= 4.7
export type GenericReducer<T = any> = Reducer<State<T>, Action<T>>;
export const genericReducer: GenericReducer = (state, action) => {
  switch (action.type) {
    case 'request':
      return { data: state.data, loading: true };
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

export const SubmitPPLButton: React.FC<{ pplQuery: string }> = (props) => {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitFormData, setSubmitFormData] = useState<FeedbackFormData>({
    input: props.pplQuery,
    output: '',
    correct: true,
    expectedOutput: '',
    comment: '',
  });

  useEffect(() => {
    setSubmitFormData({
      input: props.pplQuery,
      output: '',
      correct: true,
      expectedOutput: '',
      comment: '',
    });
  }, [props.pplQuery]);

  return (
    <>
      <EuiButton iconType="faceHappy" iconSide="right" onClick={() => setIsSubmitOpen(true)}>
        Submit PPL Query
      </EuiButton>
      {isSubmitOpen && (
        <EuiModal onClose={() => setIsSubmitOpen(false)}>
          <FeedbackModalContent
            metadata={{ type: 'ppl_submit' }}
            formData={submitFormData}
            setFormData={setSubmitFormData}
            onClose={() => setIsSubmitOpen(false)}
            displayLabels={{
              formHeader: 'Submit PPL Query',
              input: 'Your PPL Query',
              inputPlaceholder: 'PPL Query',
              output: 'Please write a Natural Language Question for the above Query',
              outputPlaceholder: 'Natural Language Question',
            }}
          />
        </EuiModal>
      )}
    </>
  );
};
