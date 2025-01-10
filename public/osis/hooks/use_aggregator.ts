/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';

type AggregationType =
  | 'remove_duplicates'
  | 'put_all'
  | 'count'
  | 'histogram'
  | 'rate_limiter'
  | 'percent_sampler';

interface BaseConfig {
  action: AggregationType;
  identificationKeys: string[];
  groupDuration?: string;
}

interface RemoveDuplicatesConfig extends BaseConfig {
  action: 'remove_duplicates';
}

interface PutAllConfig extends BaseConfig {
  action: 'put_all';
  selectedFields: string[];
}

interface CountConfig extends BaseConfig {
  action: 'count';
  countKey: string;
  startTimeKey: string;
  outputFormat: 'otel_metrics' | 'raw';
}

interface HistogramConfig extends BaseConfig {
  action: 'histogram';
  key: string;
  keyPrefix: string;
  units: string;
  recordMinMax: boolean;
  buckets: number[];
  outputFormat: 'otel_metrics' | 'raw';
}

interface RateLimiterConfig extends BaseConfig {
  action: 'rate_limiter';
  eventsPerSecond: number;
  whenExceeds: 'block' | 'drop';
}

interface PercentSamplerConfig extends BaseConfig {
  action: 'percent_sampler';
  percent: number;
}

type AggregatorConfig =
  | RemoveDuplicatesConfig
  | PutAllConfig
  | CountConfig
  | HistogramConfig
  | RateLimiterConfig
  | PercentSamplerConfig;

export function useAggregator() {
  const [config, setConfig] = useState<AggregatorConfig>();

  return {
    config,
  };
}
