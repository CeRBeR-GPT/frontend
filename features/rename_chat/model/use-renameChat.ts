import { useChats } from '@/entities/chat/hooks';
import { useUser } from '@/shared/contexts';

import { editChatNameApi } from '../api/api';
import { ChatHistory } from '../types/types';

export const useRenameChat = () => {
  const { setChatHistory, setChatTitle } = useUser();
  // const { setChatTitle } = useChats()
  const { updateSidebar, updateChatHistory } = useChats();
  const renameChatTitle = async (id: string, newTitle: string) => {
    try {
      await editChatNameApi(id, newTitle);

      setChatHistory((prev: ChatHistory[]) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
      );
      setChatTitle(newTitle);
      updateSidebar();
      updateChatHistory().then(() => updateSidebar());
    } catch (error) {}
  };

  return { renameChatTitle };
};
