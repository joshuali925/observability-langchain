/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProviderFactory } from '../providers/provider_factory';
import { PROVIDERS } from '../providers/utils';

describe('semantic similarity tests', () => {
  const olly = ApiProviderFactory.create(PROVIDERS.OLLY);

  test('should pass when strings are semantically similar', async () => {
    const resp = await olly.callApi('what are the indices in my cluster?');
    await expect(resp.output).toMatchSemanticSimilarity('the indices in your cluster are ...');
  });
});
