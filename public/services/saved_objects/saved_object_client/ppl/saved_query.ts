/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EVENT_ANALYTICS,
  OBSERVABILITY_BASE,
  SAVED_OBJECTS,
  SAVED_QUERY,
} from '../../../../../common/constants/shared';
import { IField } from '../../../../../common/types/explorer';
import { getOSDHttp } from '../../../../../common/utils';
import { PPLQueryCreateResponse } from '../types';
import { PPLSavedObjectClient } from './ppl_client';

interface CommonParams {
  query: string;
  fields: IField[];
  dateRange: [string, string];
  name: string;
  timestamp: string;
}

type CreateQueryParams = CommonParams;
type UpdateQueryParams = CommonParams & {
  objectId: string;
};

export class PPLSavedQueryClient extends PPLSavedObjectClient {
  private static instance: PPLSavedQueryClient;

  async create(params: CreateQueryParams): Promise<PPLQueryCreateResponse> {
    return await this.client.post(
      `${OBSERVABILITY_BASE}${EVENT_ANALYTICS}${SAVED_OBJECTS}${SAVED_QUERY}`,
      {
        body: JSON.stringify(
          this.buildRequestBody({
            query: params.query,
            fields: params.fields,
            dateRange: params.dateRange,
            name: params.name,
            timestamp: params.timestamp,
          })
        ),
      }
    );
  }

  async update(params: UpdateQueryParams): Promise<any> {
    return await this.client.put(
      `${OBSERVABILITY_BASE}${EVENT_ANALYTICS}${SAVED_OBJECTS}${SAVED_QUERY}`,
      {
        body: JSON.stringify(
          this.buildRequestBody({
            query: params.query,
            fields: params.fields,
            dateRange: params.dateRange,
            name: params.name,
            timestamp: params.timestamp,
            objectId: params.objectId,
          })
        ),
      }
    );
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this(getOSDHttp());
    }
    return this.instance;
  }
}
