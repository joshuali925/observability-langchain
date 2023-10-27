/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenSearchTestIndices } from './utils/indices';

void (async () => {
  await OpenSearchTestIndices.deleteAll();
  await OpenSearchTestIndices.create();
})();
