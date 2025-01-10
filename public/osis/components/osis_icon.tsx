/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButtonIcon } from '@elastic/eui';
import React, { useContext, useMemo } from 'react';
import { HttpSetup } from '../../../../../src/core/public';
import {
  IDataPluginServices,
  QueryEditorExtensionDependencies,
} from '../../../../../src/plugins/data/public';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { OsisModal } from './osis_modal';

interface IOsisContext {
  dependencies: QueryEditorExtensionDependencies;
  http: HttpSetup;
}
export const OsisContext = React.createContext<IOsisContext | null>(null);

export const useOsisContext = () => {
  const context = useContext(OsisContext);
  if (!context) throw new Error('OsisContext is not set.');
  return context;
};

interface OsisIconProps {
  dependencies: QueryEditorExtensionDependencies;
}

export const OsisIcon: React.FC<OsisIconProps> = (props) => {
  const opensearchDashboards = useOpenSearchDashboards<IDataPluginServices>();
  const osisValue: IOsisContext = useMemo(
    () => ({
      dependencies: props.dependencies,
      http: opensearchDashboards.services.http,
    }),
    [props.dependencies]
  );

  return (
    <EuiButtonIcon
      iconType="visMetric"
      onClick={() => {
        const ref = opensearchDashboards.overlays.openModal(
          <OsisContext.Provider value={osisValue}>
            <OsisModal close={() => ref.close()} />
          </OsisContext.Provider>
        );
      }}
    />
  );
};
