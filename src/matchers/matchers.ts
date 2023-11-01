/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApiProvider, GradingConfig } from 'promptfoo';
import { assertions } from 'promptfoo';
import { PROVIDERS } from '../providers/constants';
import { ApiProviderFactory } from '../providers/factory';
import { TestResult, TestRunner, TestSpec } from '../runners/test_runner';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchSemanticSimilarity(expected: string, threshold?: number): Promise<R>;
      toPassLLMRubric(expected: string, gradingConfig: GradingConfig): Promise<R>;
      toMatchRunnerExpectations<T extends TestSpec, U extends ApiProvider>(
        spec: T,
        runner: TestRunner<T, U>,
      ): Promise<R>;
    }
  }
}

export interface Matcher<T = unknown> {
  calculateScore(received: T, expected: T, threshold: number): Promise<jest.CustomMatcherResult>;
}

const { matchesSimilarity, matchesLlmRubric } = assertions;

export function installJestMatchers() {
  expect.extend({
    async toMatchRunnerExpectations<T extends TestSpec, U extends ApiProvider>(
      received: Awaited<ReturnType<U['callApi']>>,
      spec: T,
      runner: TestRunner<T, U>,
    ): Promise<TestResult> {
      return runner.compareResults(received, spec);
    },

    async toMatchSemanticSimilarity(
      received: string,
      expected: string,
      threshold: number = 0.8,
    ): Promise<jest.CustomMatcherResult> {
      const result = await matchesSimilarity(received, expected, threshold, undefined, {
        provider: ApiProviderFactory.create(PROVIDERS.ML_COMMONS),
      });
      const pass = received === expected || result.pass;
      if (pass) {
        return {
          message: () => `expected ${received} not to match semantic similarity with ${expected}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to match semantic similarity with ${expected}, but it did not. Reason: ${result.reason}`,
          pass: false,
        };
      }
    },

    async toPassLLMRubric(
      received: string,
      expected: string,
      gradingConfig: GradingConfig,
    ): Promise<jest.CustomMatcherResult> {
      const gradingResult = await matchesLlmRubric(expected, received, {
        provider: ApiProviderFactory.create(PROVIDERS.ML_COMMONS),
        ...gradingConfig,
      });
      if (gradingResult.pass) {
        return {
          message: () => `expected ${received} not to pass LLM Rubric with ${expected}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to pass LLM Rubric with ${expected}, but it did not. Reason: ${gradingResult.reason}`,
          pass: false,
        };
      }
    },
  });
}
