/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { ProviderResponse } from 'promptfoo';
import { OllyApiProvider } from '../../providers/olly';
import { TestResult, TestRunner, TestSpec } from '../test_runner';

interface QASpec extends TestSpec {
  question: string;
  expectedAnswer: string;
}

export class QARunner extends TestRunner<QASpec, OllyApiProvider> {
  public buildInput(spec: QASpec): {
    prompt: string;
    context: { vars: Record<string, string | object> } | undefined;
  } {
    return {
      prompt: spec.question,
      context: undefined,
    };
  }

  public compareResults(received: ProviderResponse, spec: QASpec): Promise<TestResult> {
    try {
      console.log(received.output, spec.expectedAnswer);
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
