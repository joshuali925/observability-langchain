/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter, Router, HashRouter, Switch, Route } from 'react-router-dom';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

import Discover from './discover';
import APM from './apm/apm';

interface InsightsDiscoverAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const InsightsDiscoverApp = ({
  basename,
  notifications,
  http,
  navigation,
}: InsightsDiscoverAppDeps) => {
  // Use React hooks to manage state.

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <HashRouter basename={basename}>
      <Switch>
        <Route exact path={'/'}>
          <div style={{ margin: 5 }}>
            <Discover />
          </div>
        </Route>
        <Route exact path={'/apm'}>
          <div style={{ margin: 5 }}>
            <APM />
        </div>
        </Route>
      </Switch>
    </HashRouter>
  );
};
