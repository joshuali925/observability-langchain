/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { registerOsisRoutes } from './osis';

export function defineRoutes(router: IRouter) {
  registerOsisRoutes(router);
}
