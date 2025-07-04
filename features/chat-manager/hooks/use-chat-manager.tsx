import { useChats } from '@/entities/chat/hooks/use-chats';
import { ChatHistory } from '@/entities/chat/types';
import { useMessage } from '@/entities/message/hooks';
import { useMessageContext, useUser } from '@/shared/contexts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { chatManagerApi } from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useChatManager = ({ chatId }: { chatId: string }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { setChatTitle } = useUser();
  const { dispatchMessages } = useMessage();
  const { setIsTestMessageShown } = useMessageContext();
  const { updateChatHistory, initializeWebSocket } = useChats();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { setChatHistory, chatHistory } = useUser();
  const { setIsLoading, ws } = useChats();

  const handleDelete = () => {
    deleteChat(chatId);
    setIsDeleteDialogOpen(false);
  };

  const { mutate: deleteChat } = useMutation({
    mutationFn: (id: string) => {
      router.push(`/chat/${id}`);
      setIsLoading(true);
      return chatManagerApi.deleteChat(id);
    },
    onSuccess: (_, id) => {
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
        initializeWebSocket(nextChatId);
        router.push(`/chat/${nextChatId}`);
      }

      setIsLoading(false);
      // queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
      updateChatHistory();
    },
  });

  const handleClear = () => {
    clearChatMessages(chatId);
    setIsClearDialogOpen(false);
  };

  const { mutate: clearChatMessages } = useMutation({
    mutationFn: (id: string) => chatManagerApi.clearChat(id),
    onSuccess: (_, id) => {
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

      queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
    },
  });

  const handleRename = (newTitle: string) => {
    mutate(newTitle);
    setIsEditDialogOpen(false);
  };

  const { mutate } = useMutation({
    mutationFn: (newTitle: string) => chatManagerApi.editChatName(chatId, newTitle),
    onSuccess: (_, newTitle) => {
      setChatHistory((prev: ChatHistory[]) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      );

      setChatTitle(newTitle);

      queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
    },
  });

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
    deleteChat,
  };
};
