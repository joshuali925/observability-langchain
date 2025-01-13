/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from 'opensearch-dashboards/server';
import { API } from '../../../common/utils/constants';
import { OsisError } from './errors';
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
        const osisError = new OsisError(error);
        return osisError.createErrorResponse();
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
        const resp = await osisManager.getPipeline({ PipelineName: request.params.name });
        return response.ok({ body: resp });
      } catch (error) {
        const osisError = new OsisError(error);
        return osisError.createErrorResponse();
      }
    }
  );

  router.put(
    {
      path: `${API.PIPELINE}/{name}`,
      validate: {
        params: schema.object({
          name: schema.string(),
        }),
        body: schema.object({
          config: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const resp = await osisManager.updatePipeline({
          PipelineName: request.params.name,
          PipelineConfigurationBody: request.body.config,
        });
        return response.ok({ body: resp });
      } catch (error) {
        const osisError = new OsisError(error);
        return osisError.createErrorResponse();
      }
    }
  );
}
