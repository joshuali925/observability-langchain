/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OllyApiProvider } from '../providers/olly';

describe('semantic similarity tests', () => {
  const api = new OllyApiProvider();

  test('should pass when strings are semantically similar', async () => {
    const resp = await api.callApi('what are the indices in my cluster?');
    await expect(resp.output).toMatchSemanticSimilarity('the indices in your cluster are ...');
  });
});
