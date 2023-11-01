/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable jest/no-export */

import fs from 'fs';
import { ApiProvider } from 'promptfoo';

export interface TestSpec {
  id: string;
  clusterStateId: string;
}

export interface TestResult extends jest.CustomMatcherResult {
  score: number;
}

export abstract class TestRunner<
  T extends TestSpec = TestSpec,
  U extends ApiProvider = ApiProvider,
> {
  // TODO this should also accept and use something to set up cluster state based on id
  constructor(private readonly apiProvider: ApiProvider) {
    this.apiProvider = apiProvider as U;
  }

  public async beforeAll(): Promise<void> {}
  public async afterAll(): Promise<void> {}
  public async beforeEach(): Promise<void> {}
  public async afterEach(): Promise<void> {}

  public parseTestSpecs(filePath: string): T[] {
    const jsonLines = fs.readFileSync(filePath, 'utf8');
    return jsonLines
      .split('\n')
      .filter((line) => line)
      .map((line) => JSON.parse(line) as T);
  }

  public runSpecs(specs: T[]) {
    // TODO setup cluster state before running test
    it.each(specs.sort((a, b) => a.clusterStateId.localeCompare(b.clusterStateId)))(
      'Test-id $id',
      async (spec) => {
        const received = await this.run(spec);
        await expect(received).toMatchRunnerExpectations(spec, this);
      },
    );
  }

  public async run(spec: T) {
    const input = this.buildInput(spec);
    const received = (await this.apiProvider.callApi(input.prompt, input.context)) as Awaited<
      ReturnType<U['callApi']>
    >;
    if (received.error) throw new Error(received.error);
    if (!received.output) throw new Error('result is empty');

    return received;
  }

  public abstract buildInput(spec: T): {
    prompt: Parameters<ApiProvider['callApi']>[0];
    context: Parameters<ApiProvider['callApi']>[1];
  };

  public abstract compareResults(
    received: Awaited<ReturnType<U['callApi']>>,
    spec: T,
  ): Promise<TestResult>;
}
