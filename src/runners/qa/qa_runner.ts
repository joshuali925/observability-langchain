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

  public async compareResults(received: ProviderResponse, spec: QASpec): Promise<TestResult> {
    try {
      console.log(received.output, spec.expectedAnswer);
      return {
        pass: true,
        message: () =>
          `Received: ${String(received.output)}, Expected: ${String(spec.expectedAnswer)}`,
        score: 1,
      };
    } catch (error) {
      return {
        pass: false,
        message: () => `failed to execture ${String(error)}`,
        score: 0,
      };
    }
  }
// for putting into an outputs file for manual eval
//   const outputDirectory = path.join(__dirname, '..', '..', 'tests', 'outputs');
//       const outputFile = path.join(outputDirectory, 'olly_cat_eval_output.jsonl');
//       await fs.writeFile(
//         outputFile,
//         JSON.stringify({ id: spec.id, clusterStateId: spec.clusterStateId, question: spec.question, expectedAnswer: spec.expectedAnswer, actualAnswer: received.output }),
//         function(err) {
//           if (err) {
//             return console.error(err);
//           }
//         }
//       );
}