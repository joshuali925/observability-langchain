/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiCode,
  EuiCopy,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React, { useEffect, useRef, useState } from 'react';
import { LANGCHAIN_API } from '../../../../../common/constants/langchain';
import { getOSDHttp } from '../../../../../common/utils';

interface Props {
  handleQueryChange: (query: string) => void;
}

export const LLMInput: React.FC<Props> = (props) => {
  const indexRef = useRef<HTMLInputElement>(null);
  const timeFieldRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (indexRef.current) {
      indexRef.current.value = 'opensearch_dashboards_sample_data_flights';
    }
    if (questionRef.current) {
      questionRef.current.value = 'How many flights were there in the past hour';
      questionRef.current.value = 'what are the longest flights in the past day';
    }
  }, []);

  const request = async () => {
    const response = await getOSDHttp().post(LANGCHAIN_API.PPL_GENERATOR, {
      body: JSON.stringify({
        question: questionRef.current?.value,
        index: indexRef.current?.value,
        timeField: '',
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
          <EuiFieldText prepend={['Index']} fullWidth inputRef={indexRef} />
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
