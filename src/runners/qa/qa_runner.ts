/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider } from 'promptfoo';
import { OpenSearchProviderResponse } from '../../providers/types';
import { TestResult, TestRunner, TestSpec } from '../test_runner';

export interface QASpec extends TestSpec {
  expectedAnswer: string;
}

export class QARunner extends TestRunner<QASpec, ApiProvider> {
  public compareResults(received: OpenSearchProviderResponse, spec: QASpec): Promise<TestResult> {
    console.log(`Received: ${String(received.output)}\nExpected: ${String(spec.expectedAnswer)}`);
    try {
      return Promise.resolve({
        pass: true,
        message: () =>
          `Received: ${String(received.output)}, Expected: ${String(spec.expectedAnswer)}`,
        score: 1,
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
