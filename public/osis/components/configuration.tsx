/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiTextArea } from '@elastic/eui';
import React, { useEffect } from 'react';

interface ConfigurationProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  config: object;
}

export const Configuration: React.FC<ConfigurationProps> = (props) => {
  useEffect(() => {
    if (props.textAreaRef.current)
      props.textAreaRef.current.value = JSON.stringify(props.config, null, 2);
  }, [props.config]);

  return (
    <>
      <EuiTextArea fullWidth inputRef={props.textAreaRef} placeholder="Select a pipeline first" />
    </>
  );
};
