/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { createOsisExtension } from './osis/utils';
import {
  AppPluginSetupDependencies,
  OsisIntegrationPluginSetup,
  OsisIntegrationPluginStart,
} from './types';

export class OsisIntegrationPlugin
  implements Plugin<OsisIntegrationPluginSetup, OsisIntegrationPluginStart> {
  public setup(core: CoreSetup, { data }: AppPluginSetupDependencies): OsisIntegrationPluginSetup {
    data.__enhance({ editor: { queryEditorExtension: createOsisExtension(core, data) } });
    return {};
  }

  public start(core: CoreStart): OsisIntegrationPluginStart {
    return {};
  }

  public stop() {}
}
