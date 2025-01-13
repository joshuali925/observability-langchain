/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceException } from '@smithy/smithy-client';
import { opensearchDashboardsResponseFactory } from '../../../../../src/core/server';

export class OsisError extends Error {
  statusCode: number = 500;

  constructor(error: unknown) {
    super('OsisError');
    if (error instanceof ServiceException) {
      this.statusCode =
        error.$metadata.httpStatusCode === 500 ? 503 : error.$metadata.httpStatusCode ?? 503;
      try {
        this.message = JSON.stringify({
          ...error,
          message: error.message,
          statusCode: this.statusCode,
        });
      } catch (_stringifyError) {
        this.message = JSON.stringify({
          message: error.message,
          requestId: error.$metadata.requestId,
          statusCode: this.statusCode,
        });
      }
    } else if (error instanceof Error) {
      this.message = error.message;
    } else {
      this.message = `Unknown error: ${String(error)}`;
    }
  }

  createErrorResponse = () =>
    opensearchDashboardsResponseFactory.custom({ body: this.message, statusCode: this.statusCode });
}
