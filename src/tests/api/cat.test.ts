/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { matchesSimilarity } from '../../matchers/matchers';
import { PythonMatcher } from '../../matchers/python';
import { ApiProviderFactory } from '../../providers/factory';
import { OpenSearchProviderResponse } from '../../providers/types';
import { QARunner, QASpec } from '../../runners/qa/qa_runner';
import { TestResult } from '../../runners/test_runner';

const provider = ApiProviderFactory.create();
const runner = new (class CatIndicesRunner extends QARunner {
  rougeMatcher = new PythonMatcher('rouge/rouge.py');

  public async evaluate(received: OpenSearchProviderResponse, spec: QASpec): Promise<TestResult> {
    const result = await matchesSimilarity(received.output || '', spec.expectedAnswer);
    const rougeScores = await this.rougeMatcher.calculateScore(
      received.output || '',
      spec.expectedAnswer,
      { rouge: ['rouge1', 'rouge2', 'rouge3', 'rougeL'] },
    );
    console.info(`Received: ${received.output}`);
    console.info(`Expected: ${spec.expectedAnswer}`);
    console.info(`Similarity score: ${result.score}`);
    console.info(`Rouge scores: ${JSON.stringify(rougeScores.scores, null, 2)}`);
    return {
      pass: result.pass,
      message: () => result.reason,
      score: result.score,
      extras: { rougeScores: rougeScores.scores },
    };
  }
})(provider);
const specDirectory = path.join(__dirname, 'specs');
const specFiles = [path.join(specDirectory, 'olly_cat_eval.jsonl')];

runner.run(specFiles);
