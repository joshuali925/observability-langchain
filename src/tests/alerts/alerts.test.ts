/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO fix types
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import fs from 'fs';
import path from 'path';
import { PROVIDERS } from '../../providers/constants';
import { ApiProviderFactory } from '../../providers/factory';
import { QARunner } from '../../runners/qa/qa_runner';
import { OpenSearchTestIndices } from '../../utils/indices';

const provider = ApiProviderFactory.create(PROVIDERS.OLLY);
const runner = new QARunner(provider);
const specDirectory = path.join(__dirname, 'specs');
const specFiles = [path.join(specDirectory, 'get_alerts_tests.jsonl')];

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
// command to run in observability-langchain root to delete DS Stores: find . -name '.DS_Store' -type f -delete

// TODO:
// - figure out potential dynamic population of questions with hardcoded dates (or just remove em outright)

populateAlertDocTimestamps();
populateTestCaseTimes();

// TODO use beforeAll hook
void OpenSearchTestIndices.deleteAll();
void OpenSearchTestIndices.create('alerting');

runner.run(specFiles);

function populateAlertDocTimestamps() {
  const one_hour = 1 * 60 * 60 * 1000; // 1 hr -> milliseconds
  const three_hours = 3 * 60 * 60 * 1000; // 3 hrs -> milliseconds

  const alertLines = fs.readFileSync(
    path.join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'indices',
      'alerting',
      '.opendistro-alerting-alerts',
      'documents.ndjson',
    ),
    'utf8',
  );
  const alertObjectsList = alertLines.split('\n').map((line) => JSON.parse(line));

  // each alert needs to happen at a very specifically chosen
  // time for the test cases to make sense
  alertObjectsList.forEach(function (alertObj) {
    const now = Date.now();
    switch (alertObj.id) {
      case '0OgfsOs5t6yqi81f3yj18':
        alertObj.start_time = now - 795021000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = alertObj.start_time + three_hours;
        break;
      case 'k9gf4os5tkqi81f3y988':
        alertObj.start_time = now - 708621000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = alertObj.start_time + three_hours;
        break;
      case 'Xugf4osB7kqi81T0y9pw':
        alertObj.start_time = now - 622221000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = alertObj.start_time + three_hours;
        break;
      case 'uzg0gosB6jqYe1T0y9Aa':
        alertObj.start_time = now - 535821000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = alertObj.start_time + three_hours;
        break;
      case 'QziGl4sB6jqYe1T0_fnD':
        alertObj.start_time = now - 436706000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = null;
        break;
      case 'GThUkYsB6jqYe1T0UOF3':
        alertObj.start_time = now - 282097000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = null;
        alertObj.acknowledged_time = alertObj.start_time + three_hours;
        break;
      case 'ODjvlosB6jqYe1T0MPKU':
        alertObj.start_time = now - 188061000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = null;
        break;
      case 'c1dc6e4b-1f71-4662-b444-a2b257546e3b':
        alertObj.start_time = now - 95375000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = null;
        break;
      case 'dzhPl4sB6jqYe1T0ffaX':
        alertObj.start_time = now - 95349000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = alertObj.start_time + three_hours;
        break;
      case 'hDjvlhfB6jqY61T0PLK5':
        alertObj.start_time = now - 3446000;
        alertObj.last_notification_time = alertObj.start_time + one_hour;
        alertObj.end_time = null;
        break;
      default:
        break;
    }
  });

  fs.writeFileSync(
    path.join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'indices',
      'alerting',
      '.opendistro-alerting-alerts',
      'documents.ndjson',
    ),
    alertObjectsList.map((line) => JSON.stringify(line)).join('\n'),
  );
}

// caveat to check for: this populates the test cases with dates and times with respect to the time of test framework execution
// because of time range shifts depending on when this test framework is executed, questions that concern a specific date might become skewed
// because the dynamically populated time offsets of the alerts might lead into the day before the day intended for testing.
// current remedy will be to rely on the fact that answers from olly are evaluated manually, so it is left to the evaluator's judgment to
// determine if the answer from Olly is valid or not given the context at the time of execution
// That being said, the alerts were generated assuming the current time was 5pm (see HEAD_EXAMPLE), so if the tests are executed at or
// around 5pm, these frameshifts are unlikely to cause issues, which makes this time a useful reference point/anchor
// as a last resort, if the frameshifts really end up becoming a problem, one could set the time on their local machine to 5pm.
function populateTestCaseTimes() {
  const alertLines = fs.readFileSync(
    path.join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'indices',
      'alerting',
      '.opendistro-alerting-alerts',
      'documents.ndjson',
    ),
    'utf8',
  );
  const alertObjectsList = alertLines.split('\n').map((line) => JSON.parse(line));

  const testLines = fs.readFileSync(
    path.join(__dirname, 'specs', 'get_alerts_tests.jsonl'),
    'utf8',
  );
  const testObjectsList = testLines.split('\n').map((line) => JSON.parse(line));

  testObjectsList.forEach(function (testObj) {
    switch (testObj.id) {
      case 'ui_PZbaYHYFD_fgoVjkzd': {
        const alert = alertObjectsList.find((alert) => alert.id === 'uzg0gosB6jqYe1T0y9Aa');
        const date = trimDay(new Date(alert.start_time).toDateString());
        testObj.question = `How many alerts were triggered on ${date}?`;
        testObj.expectedAnswer = `1 alert was triggered on ${date}. The alert has ID uzg0gosB6jqYe1T0y9Aa and was triggered by monitor random_query_monitor.`;
        break;
      }
      case 'ejbPZp9WEgYiyUH7VwPwk': {
        const alert = alertObjectsList.find((alert) => alert.id === 'dzhPl4sB6jqYe1T0ffaX');
        const date = trimDay(new Date(alert.start_time).toDateString());
        testObj.expectedAnswer = `2 monitors triggered alerts on ${date} - random_doc_monitor and random_comp_monitor.`;
        break;
      }
      case 'B_aIDTWPmk0VnO1bfFfNk': {
        const alert = alertObjectsList.find((alert) => alert.id === 'GThUkYsB6jqYe1T0UOF3');
        const date = trimDayAndTime(new Date(alert.acknowledged_time).toString());
        testObj.expectedAnswer = `Yes, 1 alert has been acknowledged in the last 3 days. The alert with ID GThUkYsB6jqYe1T0UOF3 was acknowledged on ${date}.`;
        break;
      }
      case 'E7YDumUyLlZyLmTiZxzCT': {
        const alert = alertObjectsList.find((alert) => alert.id === 'dzhPl4sB6jqYe1T0ffaX');
        const date = trimDayAndTime(new Date(alert.start_time).toString());
        testObj.expectedAnswer = `The composite monitor random_comp_monitor last triggered alert dzhPl4sB6jqYe1T0ffaX on ${date}.`;
        break;
      }
      case 'u0jg-xCfiW7jOmghnyVMM': {
        const alert = alertObjectsList.find((alert) => alert.id === 'QziGl4sB6jqYe1T0_fnD');
        const date = trimDayAndTime(new Date(alert.start_time).toString());
        testObj.expectedAnswer = `The error alert QziGl4sB6jqYe1T0_fnD started on ${date}.`;
        break;
      }
      case 'NYliAiH18aVrM-wacy0Vs': {
        const alert = alertObjectsList.find((alert) => alert.id === 'QziGl4sB6jqYe1T0_fnD');
        const date = trimDay(new Date(alert.start_time).toDateString());
        testObj.question = `What are the names of the monitors that triggered alerts on ${date}?`;
        testObj.expectedAnswer = `The monitor random_query_monitor triggered an alert on ${date}.`;
        break;
      }
      case 'vzdAN1QaoIFCcS8jQmI-R': {
        const alert = alertObjectsList.find((alert) => alert.id === 'Xugf4osB7kqi81T0y9pw');
        const date = trimDayAndTime(new Date(alert.start_time).toString());
        testObj.expectedAnswer = `The alert with ID \"Xugf4osB7kqi81T0y9pw\" started triggering on ${date}.`;
        break;
      }
      case 'rTZb6QqiQgNA1lVxysmDX': {
        const alert = alertObjectsList.find((alert) => alert.id === 'QziGl4sB6jqYe1T0_fnD');
        const date = trimDayAndTime(new Date(alert.start_time).toString());
        testObj.expectedAnswer = `The most recent error alert with ID QziGl4sB6jqYe1T0_fnD began on ${date}.`;
        break;
      }
      case 'HvnENM6nO1bTy5CknxEtO': {
        const alert = alertObjectsList.find((alert) => alert.id === 'uzg0gosB6jqYe1T0y9Aa');
        const date = trimDayAndTime(new Date(alert.last_notification_time).toString());
        testObj.expectedAnswer = `The last notification time for alert uzg0gosB6jqYe1T0y9Aa was on ${date}.`;
        break;
      }
      case 'MrSeNM6Cq-hva6JhpmlYF': {
        const alert = alertObjectsList.find((alert) => alert.id === 'hDjvlhfB6jqY61T0PLK5');
        const date = trimDayAndTime(new Date(alert.start_time).toString());
        testObj.expectedAnswer = `The most recent alert with ID hDjvlhfB6jqY61T0PLK5 was triggered on ${date}.`;
        break;
      }
      case 'dxhFcfgh98R8_i0xO80ke': {
        const alert = alertObjectsList.find((alert) => alert.id === 'GThUkYsB6jqYe1T0UOF3');
        const date = trimDayAndTime(new Date(alert.acknowledged_time).toString());
        testObj.expectedAnswer = `The alert with ID GThUkYsB6jqYe1T0UOF3 was acknowledged on ${date}.`;
        break;
      }
      default:
        break;
    }
  });

  fs.writeFileSync(
    path.join(__dirname, 'specs', 'get_alerts_tests.jsonl'),
    testObjectsList.map((line) => JSON.stringify(line)).join('\n'),
  );
}

// only for Date.toDateString()s
// Date.toDateString() comes in format DayOfWeek Month Day Year, this
// just trims the leading DayOfWeek, leaving only Month Day Year
function trimDay(date: string) {
  return date.substring(4);
}

// only for Date.toString()s
// Date.toString() comes in format DayOfWeek Month Day Year Time, and then the timezone,
// this trims the leading DayOfWeek, the time's seconds place, and the trailing timezone information
function trimDayAndTime(date: string) {
  const dateAndFullTime = date.split(' ').slice(1, 5).join(' '); // trim day of week and timezone info
  return dateAndFullTime.substring(0, dateAndFullTime.length - 3); // trim seconds off of time
}
