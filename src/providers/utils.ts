/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PROVIDERS = {
  OLLY: 'olly_chat',
  ML_COMMONS: 'ml_commons',
} as const;

export const OPENSEARCH_CONFIG = {
  URL: process.env.OPENSEARCH_URL || 'https://localhost:9200',
  OSD_URL: process.env.DASHBOARDS_URL || 'http://localhost:5601',
  USERNAME: process.env.USERNAME || 'admin',
  PASSWORD: process.env.PASSWORD || 'admin',
};

export const getAuthHeader = (): { Authorization: string } | undefined => {
  if (!OPENSEARCH_CONFIG.USERNAME || !OPENSEARCH_CONFIG.PASSWORD) {
    return undefined;
  }
  return {
    Authorization: 'Basic ' + btoa(`${OPENSEARCH_CONFIG.USERNAME}:${OPENSEARCH_CONFIG.PASSWORD}`),
  };
};
