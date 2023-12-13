/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { matchesSimilarity } from '../../matchers/matchers';
import { ApiProviderFactory } from '../../providers/factory';
import { OpenSearchProviderResponse } from '../../providers/types';
import { QARunner, QASpec } from '../../runners/qa/qa_runner';
import { TestResult } from '../../runners/test_runner';

const provider = ApiProviderFactory.create();
const runner = new (class CatIndicesRunner extends QARunner {
  public async compareResults(
    received: OpenSearchProviderResponse,
    spec: QASpec,
  ): Promise<TestResult> {
    const result = await matchesSimilarity(received.output || '', spec.expectedAnswer);
    console.info(
      `Received: ${received.output}\nExpected: ${spec.expectedAnswer}\nScore: ${result.score}`,
    );
    return {
      pass: result.pass,
      message: () =>
        `Received: ${received.output}\nExpected: ${spec.expectedAnswer}\nReason: ${result.reason}`,
      score: result.score,
    };
  }
})(provider);
const specDirectory = path.join(__dirname, 'specs');
const specFiles = [path.join(specDirectory, 'olly_cat_eval.jsonl')];

runner.run(specFiles);
