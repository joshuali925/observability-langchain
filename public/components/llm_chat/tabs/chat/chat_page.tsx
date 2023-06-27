/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlyoutBody, EuiFlyoutFooter, EuiPage, EuiPageBody, EuiSpacer } from '@elastic/eui';
import classNames from 'classnames';
import { produce } from 'immer';
import React, { useContext, useEffect, useState } from 'react';
import { ChatContext, ChatStateContext } from '../../chat_header_button';
import { useGetChat } from '../../hooks/use_get_chat';
import { ChatInputControls } from './chat_input_controls';
import { ChatPageContent } from './chat_page_content';

interface ChatPageProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatPage: React.FC<ChatPageProps> = (props) => {
  const chatContext = useContext(ChatContext)!;
  const chatStateContext = useContext(ChatStateContext)!;
  const [showGreetings, setShowGreetings] = useState(true);
  const { data: chat, loading: messagesLoading, error: messagesLoadingError } = useGetChat();

  useEffect(() => {
    if (chat && !chatStateContext.chatState.persisted) {
      chatStateContext.setChatState(
        produce((draft) => {
          draft.messages = chat.attributes.messages;
          draft.persisted = true;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  const inputDisabled = messagesLoading || chatStateContext.chatState.llmResponding;
  const fullScreenClassNames = classNames({
    'llm-chat-fullscreen': chatContext.isFlyoutFullScreen,
  });

  return (
    <>
      <EuiFlyoutBody>
        <EuiPage className={fullScreenClassNames}>
          <EuiPageBody component="div">
            <ChatPageContent
              showGreetings={showGreetings}
              setShowGreetings={setShowGreetings}
              messagesLoading={messagesLoading}
              messagesLoadingError={messagesLoadingError}
              inputDisabled={inputDisabled}
            />
          </EuiPageBody>
        </EuiPage>
      </EuiFlyoutBody>
      <EuiFlyoutFooter className={fullScreenClassNames}>
        <EuiSpacer />
        <ChatInputControls disabled={inputDisabled} input={props.input} setInput={props.setInput} />
        <EuiSpacer />
      </EuiFlyoutFooter>
    </>
  );
};
