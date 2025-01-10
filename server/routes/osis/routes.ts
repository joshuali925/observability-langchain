/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

import { IRouter } from 'opensearch-dashboards/server';
import { API } from '../../../common/utils/constants';
import { OsisManager } from './manager';

export function registerOsisRoutes(router: IRouter) {
  const osisManager = new OsisManager();

  router.get(
    {
      path: API.PIPELINES,
      validate: {},
    },
    async (context, request, response) => {
      try {
        const resp = await osisManager.getPipelines();
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({ statusCode: error.statusCode || 500, body: error.message });
      }
    }
  );

  router.get(
    {
      path: `${API.PIPELINE}/{name}`,
      validate: {
        params: schema.object({
          name: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const resp = await osisManager.getPipeline(request.params.name);
        return response.ok({ body: resp });
      } catch (error) {
        return response.custom({ statusCode: error.statusCode || 500, body: error.message });
      }
    }
  );
}
