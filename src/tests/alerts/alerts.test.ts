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
import { OpenSearchTestIndices } from '../../utils/indices';

const provider = ApiProviderFactory.create(PROVIDERS.OLLY);
const runner = new QARunner(provider);
const specDirectory = path.join(__dirname, '..', 'specs');
const specFiles = [path.join(specDirectory, 'get_alerts_tests.jsonl')].map((path) => ({ path }));

// was run once to generate the alerts tests in a test framework-compatible format
// const jsonLines = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'self-instruct', 'raw_alerting_tests.jsonl'), 'utf8');
// const s = jsonLines
//     .split('\n')
//     .filter((line) => line)
//     .map((line) => JSON.parse(line));
// s is a list, each element is a JSON object representing each line of the original raw_alerting_tests.jsonl

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

// REMEMBER: if npm run test doesnt output "deleted all test indices" followed by "created index .opendistro...", that means
// it got stuck trying to interpret a .DS_Store as an index dir. Delete all DS_Stores in the repo, and npm run test
// will go back to deleting and creating indices as before

populateTimestamps();

OpenSearchTestIndices.deleteAll();
OpenSearchTestIndices.create("alerting");
// OpenSearchTestIndices.createAlertingIndices();

describe.each(specFiles)('$path', ({ path }) => {
  beforeAll(() => runner.beforeAll());
  afterAll(() => runner.afterAll());
  beforeEach(() => runner.beforeEach());
  afterEach(() => runner.afterEach());

  const specs = runner.parseTestSpecs(path); // parses the get_alerts_tests.jsonl
  void runner.runSpecs(specs); // reads in the test cases and actually sends them to olly
});

function populateTimestamps() {
  const alertLines = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', 'indices', 'alerting', '.opendistro-alerting-alerts', 'documents.ndjson'), 'utf8');
  const alertObjectsList = alertLines.split('\n').map((line) => JSON.parse(line));

  alertObjectsList.forEach(function (alertObj) {
    switch(alertObj.id) {
      case "0OgfsOs5t6yqi81f3yj18":
        alertObj.start_time = Date.now();
        alertObj.last_notification_time = Date.now();
        alertObj.end_time = Date.now();
        break;
      default:
        break;
    }
  });

  fs.writeFile(
    path.join(__dirname, '..', '..', '..', 'data', 'indices', 'alerting', '.opendistro-alerting-alerts', 'documents.ndjson'),
    alertObjectsList.map((line) => JSON.stringify(line)).join('\n'),
    function(err) {
      if (err) return console.error(err);
    }
  );
}