/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiEmptyPrompt, EuiLink } from '@elastic/eui';
import React from 'react';

export const InviteMessage: React.FC = () => {
  // using https://mailtolinkgenerator.com/
  const mailtoLink =
    'mailto:opensearch-assistant@amazon.com?subject=Requesting%20invite%20to%20OpenSearch%20Assistant%20Playground';

  return (
    <EuiEmptyPrompt
      iconType="search"
      title={<h2>You do not have access to the Assistant</h2>}
      titleSize="s"
      body={
        <p>
          Please send an email to{' '}
          <EuiLink href={mailtoLink} external>
            opensearch-assistant@amazon.com
          </EuiLink>{' '}
          to request access.
        </p>
      }
      actions={
        <EuiButton color="primary" fill href={mailtoLink}>
          Request invite
        </EuiButton>
      }
    />
  );
};
