/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs/promises';
import path from 'path';
import { MappingTypeMapping, SearchResponse } from '@opensearch-project/opensearch/api/types';
import { openSearchClient } from '../providers/clients/opensearch';

export class OpenSearchTestIndices {
  static indicesDir = path.join(__dirname, '../../data/indices');

  public static async create(names?: string[]) {
    if (names) return Promise.all(names.map((name) => this.createIndex(name)));
    const indices = await fs.readdir(this.indicesDir);
    return Promise.all(indices.map((name) => this.createIndex(name)));
  }

  public static async deleteAll() {
    const indices = await fs.readdir(this.indicesDir);
    return openSearchClient.indices.delete({ index: indices, ignore_unavailable: true });
  }

  private static async createIndex(name: string) {
    const mappingsPath = path.join(OpenSearchTestIndices.indicesDir, name, 'mappings.json');
    const documentsPath = path.join(OpenSearchTestIndices.indicesDir, name, 'documents.ndjson');
    try {
      await Promise.all(
        [mappingsPath, documentsPath].map((file) => fs.access(file, fs.constants.F_OK)),
      );
    } catch (error) {
      console.warn(`Skipping creating index '${name}': ${String(error)}`);
      return;
    }

    const mappings = JSON.parse(await fs.readFile(mappingsPath, 'utf-8')) as MappingTypeMapping;
    await openSearchClient.indices.create({ index: name, body: { mappings } });

    const ndjson = await fs.readFile(documentsPath, 'utf-8');
    const bulkBody = ndjson
      .split('\n')
      .filter((doc) => doc)
      .flatMap((doc) => [{ index: { _index: name } }, JSON.parse(doc) as object]);
    if (bulkBody.length > 0) await openSearchClient.bulk({ refresh: true, body: bulkBody });
  }

  public static async dumpIndices(...names: string[]) {
    return Promise.all(
      names.map(async (name) => {
        await fs.mkdir(path.join(OpenSearchTestIndices.indicesDir, name), { recursive: true });
        const mappings = await openSearchClient.indices.get_mapping<{
          [name: string]: { mappings: MappingTypeMapping };
        }>({
          index: name,
        });
        const documents = await openSearchClient.search<SearchResponse>({ index: name, size: 10 });
        await fs.writeFile(
          path.join(OpenSearchTestIndices.indicesDir, name, 'mappings.json'),
          JSON.stringify(mappings.body[name].mappings),
        );
        await fs.writeFile(
          path.join(OpenSearchTestIndices.indicesDir, name, 'documents.ndjson'),
          documents.body.hits.hits.map((hit) => JSON.stringify(hit._source)).join('\n'),
        );
      }),
    );
  }
}
