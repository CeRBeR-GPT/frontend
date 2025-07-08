// features/chat-init/model/use-chat-init.ts
import { useCallback, useMemo, useState } from 'react';

import { useTheme } from 'next-themes';

import { throttle } from 'lodash-es';

import { useChats } from '@/entities/chat/hooks/use-chats';
import MessageItem from '@/entities/chat/components/MessageItem';
import { useMessageContext } from '@/shared/contexts';

import { UseChatInitializationProps } from '../types/types';

export const useChatInitialization = ({
  isLoading,
  setIsLoading,
  ws,
}: UseChatInitializationProps) => {
  const { messages, dispatchMessages } = useMessageContext();
  const { theme } = useTheme();

  const { isCheckingChat } = useChats();
  const [input, setInput] = useState<string>('');

  const throttledSubmit = useMemo(
    () =>
      throttle((inputText: string) => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
          id: Date.now(),
          text: inputText,
          message_belong: 'user' as const,
          timestamp: new Date(),
        };

        dispatchMessages({ type: 'ADD', payload: userMessage });
        setIsLoading(true);
        setInput('');

        if (ws.current) {
          ws.current.send(inputText);
        }
      }, 500),
    [isLoading, dispatchMessages, setIsLoading, setInput, ws]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      throttledSubmit(input);
    },
    [input, throttledSubmit]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const renderedMessages = useMemo(
    () =>
      messages.map((message) => {
        return <MessageItem key={`${message.id}`} message={message} />;
      }),
    [messages, theme, handleSubmit]
  );

  return {
    isCheckingChat,
    renderedMessages,
    handleSubmit,
    input,
    handleInputChange,
  };
};
