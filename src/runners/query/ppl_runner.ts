/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '@opensearch-project/opensearch';
import { ResponseError } from '@opensearch-project/opensearch/lib/errors';
import _ from 'lodash';
import { ProviderResponse } from 'promptfoo';
import { LevenshteinMatcher } from '../../matchers/levenshtein';
import { openSearchClient } from '../../providers/clients/opensearch';
import { PPLGeneratorApiProvider } from '../../providers/ppl_generator';
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

export class PPLRunner extends TestRunner<PPLSpec, PPLGeneratorApiProvider> {
  levenshtein = new LevenshteinMatcher();

  protected async beforeAll(clusterStateId: string): Promise<void> {
    await OpenSearchTestIndices.init();
    await OpenSearchTestIndices.deleteAll();
    await OpenSearchTestIndices.create(clusterStateId);
  }

  public buildInput(spec: PPLSpec): {
    prompt: string;
    context: { vars: Record<string, string | object> } | undefined;
  } {
    return {
      prompt: spec.question,
      context: { vars: { index: spec.index } },
    };
  }

  public async compareResults(received: ProviderResponse, spec: PPLSpec): Promise<TestResult> {
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
      await this.persistMetadata({
        id: spec.id,
        input: spec.question,
        output: received.output,
        expected: spec.gold_query,
        score,
        exception: null,
      });
      return {
        pass,
        message: () => `expected ${received.output} to pass PPL Rubric with ${spec.gold_query}.`,
        score,
      };
    } catch (error) {
      const respError = (error as ResponseError<string>).body;
      const pplError = JSON.parse(respError) as {
        error: { reason: string; details: string; type: string };
        status: number;
      };
      await this.persistMetadata({
        id: spec.id,
        input: spec.question,
        output: received.output,
        expected: spec.gold_query,
        score: 0,
        exception: pplError.error.type,
      });
      return {
        pass: false,
        message: () => `failed to execute query: ${String(error)}`,
        score: 0,
      };
    }
  }
}
