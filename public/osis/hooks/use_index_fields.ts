/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IFieldType } from '../../../../../src/plugins/data/common';
import { useOsisContext } from '../components/osis_icon';
import { useRequest } from './use_request';

interface Field {
  type?: string;
  fields?: Record<string, Field>;
  properties?: Record<string, Field>;
}

function flattenMapping(mapping: { properties: Field }, parentField: string = ''): IFieldType[] {
  const result: IFieldType[] = [];

  function processField(field: Field, fieldName: string, parentPath: string = '') {
    const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;

    if (field.type) result.push({ name: fullPath, type: field.type });

    if (field.fields) {
      Object.entries(field.fields).forEach(([nestedName, nestedField]) => {
        if (nestedField.type)
          result.push({ name: `${fullPath}.${nestedName}`, type: nestedField.type });
      });
    }

    if (field.properties) {
      Object.entries(field.properties).forEach(([propName, propField]) => {
        processField(propField, propName, fullPath);
      });
    }
  }

  Object.entries(mapping.properties).forEach(([fieldName, field]) => {
    processField(field, fieldName);
  });

  return result;
}

export const useIndexFields = (index: string | undefined) => {
  const context = useOsisContext();
  return useRequest((controller) => {
    if (index) {
      return context.http
        .post('/api/console/proxy', {
          query: {
            path: `${index}/_mappings`,
            method: 'GET',
            dataSourceId: context.dependencies.query.dataset?.dataSource?.id,
          },
          signal: controller.signal,
        })
        .then((response) =>
          // @ts-ignore need type for mappings
          Object.entries(response).flatMap(([_, field]) => flattenMapping(field.mappings))
        );
    }
    return Promise.resolve(undefined);
  }, index);
};
