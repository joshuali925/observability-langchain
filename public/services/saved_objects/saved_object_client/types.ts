/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedQuery, SavedVisualization } from '../../../../common/types/explorer';
import { SAVED_QUERY, SAVED_VISUALIZATION } from '../../../../common/constants/explorer';

interface IdObject {
  objectId: string;
}

export type SavedObjectsCreateResponse = IdObject;
export type SavedObjectsUpdateResponse = IdObject;
export type PPLQueryCreateResponse = IdObject;

interface ObservabilitySavedObjectBase {
  createdTimeMs: number;
  lastUpdatedTimeMs: number;
  objectId: string;
  tenant?: string;
}

export interface ObservabilitySavedVisualization extends ObservabilitySavedObjectBase {
  [SAVED_VISUALIZATION]: SavedVisualization;
}

export interface ObservabilitySavedQuery extends ObservabilitySavedObjectBase {
  [SAVED_QUERY]: SavedQuery;
}

export type ObservabilitySavedObject = ObservabilitySavedVisualization | ObservabilitySavedQuery;

export type SavedObjectsGetParams = IdObject;

export interface SavedObjectsGetResponse<
  T extends ObservabilitySavedObject = ObservabilitySavedObject
> {
  startIndex?: number;
  totalHits?: number;
  totalHitRelation?: 'eq' | 'gte';
  observabilityObjectList: T[];
}

export type SavedObjectsDeleteParams = IdObject;

export interface SavedObjectsDeleteBulkParams {
  objectIdList: string[];
}

export interface SavedObjectsDeleteResponse {
  deleteResponseList: {
    [objectId: string]: string; // org.opensearch.rest.RestStatus, e.g. 'OK'
  };
}
