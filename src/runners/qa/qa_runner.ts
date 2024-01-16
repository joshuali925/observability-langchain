/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider } from 'promptfoo';
import { LevenshteinMatcher } from '../../matchers/levenshtein';
import { OpenSearchProviderResponse } from '../../providers/types';
import { TestResult, TestRunner, TestSpec } from '../test_runner';

export interface QASpec extends TestSpec {
  expectedAnswer: string;
}

export class QARunner extends TestRunner<QASpec, ApiProvider> {
  levenshtein = new LevenshteinMatcher();

  public async evaluate(received: OpenSearchProviderResponse, spec: QASpec): Promise<TestResult> {
    const score = (
      await this.levenshtein.calculateScore(received.output || '', spec.expectedAnswer)
    ).score;
    console.info(`Received: ${received.output}`);
    console.info(`Expected: ${spec.expectedAnswer}`);
    console.info(`Edit distance: ${score}\n`);
    try {
      return Promise.resolve({
        pass: true,
        message: () =>
          `Received: ${String(received.output)}, Expected: ${String(spec.expectedAnswer)}`,
        score: score,
      });
    } catch (error) {
      return Promise.resolve({
        pass: false,
        message: () => `failed to execture ${String(error)}`,
        score: 0,
      });
    }
  }
}
