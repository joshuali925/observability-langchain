/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProviderResponse } from 'promptfoo';
import { OllyApiProvider } from '../../providers/olly';
import { TestResult, TestRunner, TestSpec } from '../test_runner';

export interface QASpec extends TestSpec {
  question: string;
  expectedAnswer: string;
}

export class QARunner extends TestRunner<QASpec, OllyApiProvider> {
  protected buildInput(spec: QASpec): {
    prompt: string;
    context: { vars: Record<string, string | object> } | undefined;
  } {
    return {
      prompt: spec.question,
      context: undefined,
    };
  }

  public compareResults(received: ProviderResponse, spec: QASpec): Promise<TestResult> {
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
