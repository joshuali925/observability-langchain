/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import rouge from 'rouge';
import { Matcher } from './matchers';

// TODO fix https://github.com/kenlimmj/rouge/issues/5
export class RougeMatcher implements Matcher<string> {
  private rougeMethod: (typeof rouge)[keyof typeof rouge];
  constructor(public readonly baseType: 'rouge-n' | 'rouge-l' | 'rouge-s') {
    const fnName = baseType[baseType.length - 1] as 'n' | 'l' | 's';
    this.rougeMethod = rouge[fnName];
  }

  public calculateScore(received: string, expected: string): number {
    return this.rougeMethod(received, expected);
  }
}
