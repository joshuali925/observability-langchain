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

  public async compareResults(
    received: OpenSearchProviderResponse,
    spec: QASpec,
  ): Promise<TestResult> {
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

/* Sample Rouge Usage */
// const runner = new (class CatIndicesRunner extends QARunner {
//   rougeMatcher = new PythonMatcher('rouge/rouge.py');

//   public async compareResults(
//     received: OpenSearchProviderResponse,
//     spec: QASpec,
//   ): Promise<TestResult> {
//     const result = await matchesSimilarity(received.output || '', spec.expectedAnswer);
//     const rougeScores = await this.rougeMatcher.calculateScore(
//       received.output || '',
//       spec.expectedAnswer,
//       { rouge: ['rouge1', 'rouge2', 'rouge3', 'rougeL'] },
//     );
//     console.info(`Received: ${received.output}`);
//     console.info(`Expected: ${spec.expectedAnswer}`);
//     console.info(`Similarity score: ${result.score}`);
//     console.info(`Rouge scores: ${JSON.stringify(rougeScores.scores, null, 2)}`);
//     return {
//       pass: result.pass,
//       message: () => result.reason,
//       score: result.score,
//       extras: { rougeScores: rougeScores.scores },
//     };
//   }
// })(provider);

/* Sample Bert Usage */
// const runner = new (class CatIndicesRunner extends QARunner {
//   bertMatcher = new PythonMatcher('bert/bert.py');

//   public async compareResults(
//     received: OpenSearchProviderResponse,
//     spec: QASpec,
//   ): Promise<TestResult> {
//     const result = await matchesSimilarity(received.output || '', spec.expectedAnswer);
//     const bertScores = await this.bertMatcher.calculateScore(
//       received.output || '',
//       spec.expectedAnswer,
//     );
//     console.info(`Received: ${received.output}`);
//     console.info(`Expected: ${spec.expectedAnswer}`);
//     console.info(`Similarity score: ${result.score}`);
//     console.info(`Bert scores: ${JSON.stringify(bertScores.scores, null, 2)}`);
//     return {
//       pass: result.pass,
//       message: () => result.reason,
//       score: result.score,
//       extras: { bertScores: bertScores.scores },
//     };
//   }
// })(provider);

/* Sample Meteor Usage */
// const runner = new (class CatIndicesRunner extends QARunner {
//   meteorMatcher = new PythonMatcher('meteor/meteor.py');

//   public async compareResults(
//     received: OpenSearchProviderResponse,
//     spec: QASpec,
//   ): Promise<TestResult> {
//     const result = await matchesSimilarity(received.output || '', spec.expectedAnswer);
//     const meteorScore = await this.meteorMatcher.calculateScore(
//       received.output || '',
//       spec.expectedAnswer,
//     );
//     console.info(`Received: ${received.output}`);
//     console.info(`Expected: ${spec.expectedAnswer}`);
//     console.info(`Similarity score: ${result.score}`);
//     console.info(`Meteor score: ${meteorScore.score}`);
//     return {
//       pass: result.pass,
//       message: () => result.reason,
//       score: result.score,
//       extras: { meteorScore: meteorScore.score },
//     };
//   }
// })(provider);
