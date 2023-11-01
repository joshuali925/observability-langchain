/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { PROVIDERS } from '../providers/constants';
import { ApiProviderFactory } from '../providers/factory';
import { readCsvSync } from '../utils/csv';
import { OpenSearchTestIndices } from '../utils/indices';

const getCsvFiles = (dir: string, files: { path: string }[] = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const csvPath = `${dir}/${file}`;
    if (fs.lstatSync(csvPath).isDirectory()) {
      getCsvFiles(csvPath, files);
    } else if (csvPath.endsWith('.csv')) {
      files.push({ path: path.relative(CSV_DIR, csvPath) });
    }
  });
  return files;
};

const olly = ApiProviderFactory.create(PROVIDERS.OLLY);
const CSV_DIR = `${__dirname}/specs`;
const csvFiles = getCsvFiles(CSV_DIR);

describe.skip.each(csvFiles)('$path', ({ path }) => {
  const testCases = readCsvSync<{ input: string; expected: string }>(`${CSV_DIR}/${path}`);

  beforeAll(async () => {
    await OpenSearchTestIndices.deleteAll();
    await OpenSearchTestIndices.create();
  });

  afterAll(async () => {
    await OpenSearchTestIndices.deleteAll();
  });

  it.each(testCases)('$input', async ({ input, expected }) => {
    const resp = await olly.callApi(input);
    await expect(resp.output).toMatchSemanticSimilarity(expected);
  });
});
