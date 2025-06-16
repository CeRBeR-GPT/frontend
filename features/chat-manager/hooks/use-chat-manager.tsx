import { useChats } from '@/entities/chat/hooks/use-chats';
import { ChatHistory } from '@/entities/chat/types';
import { useMessage } from '@/entities/message/hooks';
import { useMessageContext, useUser } from '@/shared/contexts';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { chatManagerApi } from '../api';

export const useChatManager = ({ chatId }: { chatId: string }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { setChatTitle } = useUser();
  const { updateChatHistory } = useChats();
  const { dispatchMessages } = useMessage();
  const { setIsTestMessageShown } = useMessageContext();

  const router = useRouter();

  const { getToken, setChatHistory, chatHistory } = useUser();
  const { updateSidebar, setIsLoading, ws, loadChatHistory } = useChats();

  const handleDelete = () => {
    deleteChat(chatId);
    setIsDeleteDialogOpen(false);
  };

  const deleteChat = useCallback(
    async (id: string) => {
      router.push(`/chat/${id}`);
      try {
        setIsLoading(true);

        await chatManagerApi.deleteChat(id);
        localStorage.setItem('lastDeletedChat', id || '');
        const remainingChats = chatHistory.filter((chat) => chat.id !== id);
        setChatHistory(remainingChats);
        const lastSavedChat = localStorage.getItem('lastSavedChat');
        if (lastSavedChat === id) {
          localStorage.setItem(
            'lastSavedChat',
            remainingChats.length > 0 ? remainingChats[0].id : '1'
          );
        }

        if (id === chatId) {
          const nextChatId = remainingChats.length > 0 ? remainingChats[0].id : '1';
          if (ws.current) {
            ws.current.close(1000, 'Chat deleted');
            ws.current = null;
          }

          router.push(`/chat/${nextChatId}`);
        }

        updateSidebar();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, chatHistory, getToken, router, updateSidebar]
  );

  const handleClear = () => {
    clearChatMessages(chatId);
    setIsClearDialogOpen(false);
  };

  const clearChatMessages = useCallback(
    async (id: string) => {
      try {
        await chatManagerApi.clearChat(id);
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

  const handleRename = (newTitle: string) => {
    renameChatTitle(chatId, newTitle);
    setIsEditDialogOpen(false);
  };

  const renameChatTitle = async (id: string, newTitle: string) => {
    try {
      await chatManagerApi.editChatName(id, newTitle);

      setChatHistory((prev: ChatHistory[]) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
      );
      setChatTitle(newTitle);
      updateSidebar();
      updateChatHistory().then(() => updateSidebar());
    } catch (error) {}
  };

  return {
    handleDelete,
    handleClear,
    handleRename,
    isDeleteDialogOpen,
    isClearDialogOpen,
    isEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsClearDialogOpen,
    setIsEditDialogOpen,
    renameChatTitle,
    deleteChat,
  };
};
