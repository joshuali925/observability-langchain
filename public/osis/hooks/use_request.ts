/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Reducer, useEffect, useReducer, useRef, useState } from 'react';

interface State<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

type Action<T> =
  | { type: 'request' }
  | { type: 'success'; payload: State<T>['data'] }
  | { type: 'failure'; error: NonNullable<State<T>['error']> };

type GenericReducer<T = any> = Reducer<State<T>, Action<T>>;
const genericReducer: GenericReducer = (state, action) => {
  switch (action.type) {
    case 'request':
      return { ...state, loading: true };
    case 'success':
      return { loading: false, data: action.payload };
    case 'failure':
      return { loading: false, error: action.error };
    default:
      return state;
  }
};

export const useRequest = <T, U extends unknown[]>(
  request: (controller: AbortController) => Promise<T>,
  ...deps: U
) => {
  const reducer: GenericReducer<T> = genericReducer;
  const [state, dispatch] = useReducer(reducer, { loading: false });
  const [refresh, setRefresh] = useState({});
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    dispatch({ type: 'request' });

    request(abortControllerRef.current)
      .then((payload) => dispatch({ type: 'success', payload }))
      .catch((error) => dispatch({ type: 'failure', error }));

    return () => abortControllerRef.current?.abort();
  }, [refresh, ...deps]);

  return {
    ...state,
    refresh: () => setRefresh({}),
    abort: () => abortControllerRef.current?.abort(),
  };
};
