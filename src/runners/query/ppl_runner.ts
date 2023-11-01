/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '@opensearch-project/opensearch';
import _ from 'lodash';
import { ProviderResponse } from 'promptfoo';
import { openSearchClient } from '../../providers/clients/opensearch';
import { PPLGeneratorApiProvider } from '../../providers/ppl_generator';
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
      return {
        pass,
        message: () => `expected ${received.output} to pass PPL Rubric with ${spec.gold_query}.`,
        score: 1,
      };
    } catch (error) {
      return {
        pass: false,
        message: () => `failed to execute query: ${String(error)}`,
        score: 0,
      };
    }
  }
}
