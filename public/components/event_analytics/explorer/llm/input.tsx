/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFieldText } from '@elastic/eui';
import React, { useRef } from 'react';
import { getOSDHttp } from '../../../../../common/utils';

export const Input: React.FC = () => {
  console.count('Input rerender');
  const ref = useRef<HTMLInputElement>(null);

  const request = async () => {
    const response = await getOSDHttp().post('/api/langchain/llm', {
      body: JSON.stringify({
        question: ref.current?.value,
        index: 'jaeger',
        timeField: 'timestamp',
      }),
    });
    console.info('❗response:', response);
  };

  return (
    <>
      <EuiFieldText inputRef={ref} />
      <button style={{ border: 'solid red', padding: 3 }} onClick={request}>
        TEST
      </button>
    </>
  );
};
