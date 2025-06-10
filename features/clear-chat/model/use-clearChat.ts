import { useCallback } from 'react';

import { useChats } from '@/entities/chat/model/use-chats';
import { useMessage } from '@/entities/message/model';
import { useUser } from '@/shared/contexts';
import { useMessageContext } from '@/shared/contexts';

import { clearChatApi } from './api';

export const useClearChat = () => {
  const { setChatHistory } = useUser();
  const { chatId } = useChats();
  const { dispatchMessages } = useMessage();
  const { loadChatHistory, updateSidebar } = useChats();
  const { setIsTestMessageShown } = useMessageContext();

  const clearChatMessages = useCallback(
    async (id: string) => {
      try {
        await clearChatApi(id);
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === id
              ? { ...chat, messages: 0, preview: 'Нет сообщений', date: new Date() }
              : chat
          )
        );

        if (id === chatId) {
          dispatchMessages({ type: 'CLEAR' });
          setIsTestMessageShown(true);
        }

        await loadChatHistory(chatId);
        updateSidebar();
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    },
    [
      chatId,
      setChatHistory,
      dispatchMessages,
      setIsTestMessageShown,
      loadChatHistory,
      updateSidebar,
    ]
  );

  return { clearChatMessages };
};
