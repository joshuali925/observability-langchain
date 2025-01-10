/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OsisIntegrationPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OsisIntegrationPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}

export interface AppPluginSetupDependencies {
  data: DataPublicPluginSetup;
}
