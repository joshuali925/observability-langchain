/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable jest/no-export */

import fs from 'fs';
import { ApiProvider } from 'promptfoo';
import { OpenSearchTestIndices } from '../utils/indices';

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
    // TODO:
    // - prepare alerting config index too, make sure get monitors api matches search alerting-config index, then copypasta monitors into mappings and docs like u did w alerting, replace IDs of alerts with these ones
    // - dynamically populate timestamps of alerts in test script

    // OpenSearchTestIndices.deleteAll();
    // OpenSearchTestIndices.create("alerting");
    it.each(specs.sort((a, b) => a.clusterStateId.localeCompare(b.clusterStateId)))(
      'Test-id $id',
      async (spec) => {
        const received = await this.run(spec);
        await expect(received).toMatchRunnerExpectations(spec, this);
      },
    );
    // OpenSearchTestIndices.deleteAll();
  }

  public async run(spec: T) {
    const input = this.buildInput(spec);
    // const received = (await this.apiProvider.callApi(input.prompt, input.context)) as Awaited<
    //   ReturnType<U['callApi']>
    // >;
  

    const promise = this.apiProvider.callApi(input.prompt, input.context);
    console.log("promise retrieved");
    const raw = await promise;
    console.log("raw retrieved");
    const received = raw as Awaited<ReturnType<U['callApi']>>;
    console.log("received retrieved");

    // TODO: json syntax error stops code from reaching here
    // api call to olly is successful, and retrieval of response
    // is successful too
    // i think wats happening is that the promise resolves into the value "Not Found", and
    // the json parser attempts to parse "Not Found" as json but just gets N instead at position 0.

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
