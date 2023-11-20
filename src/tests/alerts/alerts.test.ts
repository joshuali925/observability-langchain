/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { PROVIDERS } from '../../providers/constants';
import { ApiProviderFactory } from '../../providers/factory';
import { QARunner } from '../../runners/qa/qa_runner';

const provider = ApiProviderFactory.create(PROVIDERS.OLLY);
const runner = new QARunner(provider);
const specDirectory = path.join(__dirname, '..', 'specs');
const specFiles = [path.join(specDirectory, 'get_alerts_tests.jsonl')].map((path) => ({ path }));

// was run once to generate the alerts tests in a test framework-compatible format
// const jsonLines = fs.readFileSync('/Users/toepkerd/Documents/Olly-Project/observability-langchain/src/tests/specs/raw_alerting_tests.jsonl', 'utf8');
// const s = jsonLines
//     .split('\n')
//     .filter((line) => line)
//     .map((line) => JSON.parse(line));
// fs.writeFile(
//   '/Users/toepkerd/Documents/Olly-Project/observability-langchain/src/tests/specs/get_alerts_tests.jsonl',
//   s
//     .map((line) => JSON.stringify({ id: nanoid(), clusterStateId: 'alerting', question: line.Input, expectedAnswer: line.Output, }))
//     .join('\n'),
//   function(err) {
//     if (err) {
//       return console.error(err);
//     }
//   }
// );

describe.each(specFiles)('$path', ({ path }) => {
  beforeAll(() => runner.beforeAll());
  afterAll(() => runner.afterAll());
  beforeEach(() => runner.beforeEach());
  afterEach(() => runner.afterEach());

  const specs = runner.parseTestSpecs(path);
  void runner.runSpecs(specs);
});