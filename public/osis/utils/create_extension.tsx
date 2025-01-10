/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { of } from 'rxjs';
import { CoreSetup } from '../../../../../src/core/public';
import {
  DataPublicPluginSetup,
  QueryEditorExtensionConfig,
} from '../../../../../src/plugins/data/public';
import { OsisIcon } from '../components/osis_icon';

export const createOsisExtension = (
  core: CoreSetup,
  data: DataPublicPluginSetup
): QueryEditorExtensionConfig => {
  return {
    id: 'osis-pipeline',
    order: 1001,
    isEnabled$: () => of(true),
    getSearchBarButton: (dependencies) => {
      return <OsisIcon dependencies={dependencies} />;
    },
  };
};
