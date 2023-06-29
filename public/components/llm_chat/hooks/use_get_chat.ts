/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useContext, useEffect, useReducer } from 'react';
import {
  HttpFetchQuery,
  SavedObjectsFindOptions,
  SimpleSavedObject,
} from '../../../../../../src/core/public';
import { SavedObjectsFindResponse } from '../../../../../../src/core/server';
import { CHAT_API } from '../../../../common/constants/llm';
import {
  CHAT_SAVED_OBJECT,
  IChat,
} from '../../../../common/types/observability_saved_object_attributes';
import { ChatContext, CoreServicesContext } from '../chat_header_button';
import { genericReducer, GenericReducer } from './fetch_reducer';

export const useGetChat = () => {
  const chatContext = useContext(ChatContext)!;
  const coreServicesContext = useContext(CoreServicesContext)!;
  const reducer: GenericReducer<SimpleSavedObject<IChat>> = genericReducer;
  const [state, dispatch] = useReducer(reducer, { loading: false });

  useEffect(() => {
    // savedObjectsClient does not support abort signal
    let abort = false;
    dispatch({ type: 'request' });
    if (!chatContext.chatId) {
      dispatch({ type: 'success', payload: undefined });
      return;
    }

    coreServicesContext.savedObjectsClient
      .get<IChat>(CHAT_SAVED_OBJECT, chatContext.chatId)
      .then((payload) => {
        if (!abort) dispatch({ type: 'success', payload });
      })
      .catch((error) => {
        if (!abort) dispatch({ type: 'failure', error });
      });

    return () => {
      abort = true;
    };
  }, [chatContext.chatId]);

  return { ...state };
};

export const useBulkGetChat = (options: Partial<SavedObjectsFindOptions> = {}) => {
  const coreServicesContext = useContext(CoreServicesContext)!;
  const reducer: GenericReducer<SavedObjectsFindResponse<IChat>> = genericReducer;
  const [state, dispatch] = useReducer(reducer, { loading: false });

  useEffect(() => {
    const abortController = new AbortController();
    dispatch({ type: 'request' });

    coreServicesContext.http
      .get<SavedObjectsFindResponse<IChat>>(CHAT_API.HISTORY, {
        query: options as HttpFetchQuery,
        signal: abortController.signal,
      })
      .then((payload) => dispatch({ type: 'success', payload }))
      .catch((error) => dispatch({ type: 'failure', error }));

    return () => {
      abortController.abort();
    };
  }, [options]);

  return { ...state };
};
