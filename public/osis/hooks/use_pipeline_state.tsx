/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PipelineSummary } from '@aws-sdk/client-osis';
import React, { useContext, useMemo, useReducer } from 'react';
import { SourceIndex } from '../utils/pipeline_config';

export type AggregationType = 'count' | 'histogram';

interface BaseConfig {
  action: AggregationType;
  identificationKeys: string[];
  groupDuration?: string;
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

export type AggregatorConfig = CountConfig | HistogramConfig;

interface PipelineState {
  pipeline?: PipelineSummary;
  sourceIndex?: SourceIndex;
  destIndex: string;
  newPipelineName: string;
  aggregatorConfig: Partial<AggregatorConfig>;
}

type PipelineStateAction =
  | { type: 'reset' }
  | { type: 'selectPipeline'; payload: PipelineState['pipeline'] }
  | { type: 'setAggregatorAction'; payload: PipelineState['aggregatorConfig']['action'] }
  | {
      type: 'setAggregatorProperty';
      payload: Partial<PipelineState['aggregatorConfig']>;
    }
  | { type: 'setState'; payload: Partial<PipelineState> };

interface IPipelineStateContext {
  state: PipelineState;
  dispatch: React.Dispatch<PipelineStateAction>;
}
const PipelineStateContext = React.createContext<IPipelineStateContext | null>(null);

const initialState: PipelineState = {
  destIndex: '',
  newPipelineName: '',
  aggregatorConfig: {
    action: undefined,
    identificationKeys: [],
  },
};

const stateReducer: React.Reducer<PipelineState, PipelineStateAction> = (state, action) => {
  switch (action.type) {
    case 'reset': {
      return initialState;
    }

    case 'selectPipeline': {
      return { ...initialState, pipeline: action.payload };
    }

    case 'setAggregatorAction': {
      return {
        ...state,
        aggregatorConfig: {
          identificationKeys: state.aggregatorConfig.identificationKeys,
          action: action.payload,
        },
      };
    }

    case 'setAggregatorProperty': {
      return {
        ...state,
        aggregatorConfig: {
          ...state.aggregatorConfig,
          ...action.payload,
        },
      };
    }

    case 'setState': {
      return { ...state, ...action.payload };
    }
  }
};

export const PipelineStateProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const contextValue: IPipelineStateContext = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <PipelineStateContext.Provider value={contextValue}>
      {props.children}
    </PipelineStateContext.Provider>
  );
};

export const usePipelineState = () => {
  const context = useContext(PipelineStateContext);
  if (!context) throw new Error('PipelineStateContext is not set.');
  return context;
};
