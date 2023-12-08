/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable jest/no-export */

import fs from 'fs';
import fsPromises from 'node:fs/promises';
import path from 'path';
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
  constructor(private readonly apiProvider: ApiProvider) {
    this.apiProvider = apiProvider as U;
  }

  protected async beforeAll(clusterStateId: string): Promise<void> {}
  protected async afterAll(clusterStateId: string): Promise<void> {}
  protected async beforeEach(clusterStateId: string): Promise<void> {}
  protected async afterEach(clusterStateId: string): Promise<void> {}

  public parseTestSpecs(filePath: string): T[] {
    const jsonLines = fs.readFileSync(filePath, 'utf8');
    return jsonLines
      .split('\n')
      .filter((line) => line)
      .map((line) => JSON.parse(line) as T);
  }

  public run(specFiles: string[]) {
    describe.each(specFiles)('%s', (path) => {
      const specs = this.parseTestSpecs(path);
      void this.runSpecs(specs);
    });
  }

  public runSpecs(specs: T[]) {
    const clusterStateIdToSpec: Record<string, T[]> = {};
    specs.forEach((spec) => {
      if (clusterStateIdToSpec[spec.clusterStateId] === undefined)
        clusterStateIdToSpec[spec.clusterStateId] = [];
      clusterStateIdToSpec[spec.clusterStateId].push(spec);
    });
    describe.each(Object.keys(clusterStateIdToSpec))('Cluster state %s', (clusterStateId) => {
      beforeAll(async () => {
        return this.beforeAll(clusterStateId);
      });
      afterAll(() => this.afterAll(clusterStateId));
      beforeEach(() => this.beforeEach(clusterStateId));
      afterEach(() => this.afterEach(clusterStateId));
      it.each(clusterStateIdToSpec[clusterStateId])('Test-id $id', async (spec) => {
        console.info(`Running test: ${spec.id}`);
        const received = await this.runSpec(spec);
        await expect(received).toMatchRunnerExpectations(spec, this);
      });
    });
  }

  public async runSpec(spec: T) {
    const input = this.buildInput(spec);
    const received = (await this.apiProvider.callApi(input.prompt, input.context)) as Awaited<
      ReturnType<U['callApi']>
    >;
    if (received.error) throw new Error(received.error);
    if (!received.output) throw new Error('result is empty');

    return received;
  }

  protected async persistMetadata(metadata: object) {
    const resultPath = path.join(
      __dirname,
      '..',
      '..',
      'results',
      this.constructor.name,
      `${Date.now()}.jsonl`,
    );
    await fsPromises.mkdir(path.dirname(resultPath), { recursive: true });
    return fsPromises.appendFile(
      resultPath,
      JSON.stringify({
        ...metadata,
        executed_at: new Date().toISOString(),
      }) + '\n',
    );
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
