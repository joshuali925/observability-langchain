/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '@opensearch-project/opensearch';
import { ResponseError } from '@opensearch-project/opensearch/lib/errors';
import _ from 'lodash';
import { ApiProvider } from 'promptfoo';
import { LevenshteinMatcher } from '../../matchers/levenshtein';
import { openSearchClient } from '../../providers/clients/opensearch';
import { OpenSearchProviderResponse } from '../../providers/types';
import { OpenSearchTestIndices } from '../../utils/indices';
import { TestResult, TestRunner, TestSpec } from '../test_runner';

interface PPLSpec extends TestSpec {
  question: string;
  gold_query: string;
  index: string;
}

interface PPLResponse {
  schema: Array<{ name: string; type: string }>;
  datarows: unknown[][];
  total: number;
  size: number;
}

export class PPLRunner extends TestRunner<PPLSpec, ApiProvider> {
  levenshtein = new LevenshteinMatcher();

  protected async beforeAll(clusterStateId: string): Promise<void> {
    await OpenSearchTestIndices.init();
    await OpenSearchTestIndices.deleteAll();
    await OpenSearchTestIndices.create(clusterStateId);
  }

  protected buildInput(spec: PPLSpec): {
    prompt: string;
    context: { vars: Record<string, string | object> } | undefined;
  } {
    return {
      prompt: spec.question,
      context: { vars: { index: spec.index } },
    };
  }

  public async compareResults(
    received: OpenSearchProviderResponse,
    spec: PPLSpec,
  ): Promise<TestResult> {
    try {
      const actual = (await openSearchClient.transport.request({
        method: 'POST',
        path: `/_plugins/_ppl`,
        body: JSON.stringify({
          query: received.output,
        }),
      })) as ApiResponse<PPLResponse>;
      const expected = (await openSearchClient.transport.request({
        method: 'POST',
        path: `/_plugins/_sql`,
        body: JSON.stringify({
          query: spec.gold_query,
        }),
      })) as ApiResponse<PPLResponse>;
      const pass = _.isEqual(actual.body.datarows, expected.body.datarows);
      const score = pass
        ? 1
        : this.levenshtein.calculateScore(
            JSON.stringify(actual.body.datarows),
            JSON.stringify(expected.body.datarows),
          );
      return {
        pass,
        message: () =>
          `expected ${received.output} to have the same response as ${spec.gold_query}.`,
        score,
        extras: {
          exception: null,
        },
      };
    } catch (error) {
      const respError = (error as ResponseError<string>).body;
      const pplError = JSON.parse(respError) as {
        error: { reason: string; details: string; type: string };
        status: number;
      };
      return {
        pass: false,
        message: () => `failed to execute query: ${String(error)}`,
        score: 0,
        extras: {
          exception: pplError.error.type,
        },
      };
    }
  }
}
