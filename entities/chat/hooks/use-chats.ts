import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useMessage } from '@/entities/message/hooks';
import { useAuth, useUser } from '@/shared/contexts';
import { useMessageContext } from '@/shared/contexts';
import { chatApi } from '../api';

export const useChats = () => {
  const { getToken, chatHistory, setChatHistory, setChatTitle } = useUser();
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [sidebarVersion, setSidebarVersion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { messagesContainerRef, ws } = useMessage();
  const { setIsTestMessageShown, isValidChat, setIsValidChat, isCheckingChat, setIsCheckingChat } =
    useMessageContext();
  const { dispatchMessages, messages } = useMessage();
  const params = useParams();
  const chatId = params.id as string;
  const router = useRouter();
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const initializeChatsData = () => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (chatId === '1') {
      dispatchMessages({ type: 'CLEAR' });
      setIsTestMessageShown(true);
      setChatTitle('Новый чат');
      return;
    }

    const loadData = async () => {
      await initializeWebSocket(chatId);
    };
    loadData();
  };

  const updateSidebar = useCallback(() => {
    setSidebarVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    checkChatValidity();
  }, [chatHistory, chatId]);

  const {
    data,
    isLoading: isChatLoading,
    refetch: refetchChatById,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (chatId === '1') return null;

      const token = await getToken();
      if (!token) return null;

      const idChat = localStorage.getItem('lastDeletedChat');
      if (chatId === idChat) return null;

      return chatApi.getById(chatId);
    },
  });

  useEffect(() => {
    if (!data) return;
    const history = data.data.messages;
    dispatchMessages({ type: 'SET', payload: history });
    setChatTitle(data.data.name);
    setIsTestMessageShown(history.length === 0);
  }, [data]);

  useEffect(() => {
    setIsLoadingHistory(isChatLoading);
  }, [isChatLoading]);

  const initializeWebSocket = useCallback(
    async (chatId: string) => {
      if (chatId === '1') return;
      try {
        const token = await getToken();
        if (!token) return;

        const provider = localStorage.getItem('selectedProvider');
        const wsUrl = `wss://api-gpt.energy-cerber.ru/chat/ws/${chatId}?token=${token}&provider=${provider}`;

        const idChat = localStorage.getItem('lastDeletedChat');
        // if (chatId === idChat) {
        //   return;
        // }
        // if (!isValidChat) return

        ws.current = new WebSocket(wsUrl);
        ws.current.onmessage = (event) => {
          dispatchMessages({
            type: 'ADD',
            payload: {
              id: Date.now(),
              text: event.data,
              message_belong: 'assistant',
              timestamp: new Date(),
            },
          });

          setIsLoading(false);
          updateSidebar();

          Promise.all([
            updateChatHistory(), // Обновляет список чатов (all)
            refetchChatById(), // Обновляет текущий чат (by id)
          ]).then(() => updateSidebar());

          setTimeout(() => {
            messagesContainerRef.current?.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 50);
        };

        ws.current.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
        };
      } catch (error) {}
    },
    [getToken, updateSidebar, refetchChatById]
  );

  const checkChatValidity = () => {
    if (chatId === '1') {
      setIsValidChat(true);
      setIsCheckingChat(false);
      return;
    }

    if (chatHistory.length === 0) {
      setIsValidChat(false);
      setIsCheckingChat(false);
      return;
    }

    const exists = chatHistory.some((chat) => chat.id === chatId);
    setIsValidChat(exists);
    setIsCheckingChat(false);
  };

  const {
    data: chatsData,
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatApi.getAll(),
    select: (data) => {
      const formattedChats = data.data.map((chat: any) => {
        const lastMessageDate =
          chat.messages.length > 0
            ? new Date(chat.messages[chat.messages.length - 1].created_at)
            : new Date(chat.created_at);
        lastMessageDate.setHours(lastMessageDate.getHours() + 3);
        return {
          id: chat.id,
          title: chat.name,
          preview:
            chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : 'Нет сообщений',
          date: lastMessageDate,
          messages: chat.messages.length,
        };
      });

      return formattedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
    },
  });

  const updateChatHistory = useCallback(async () => {
    await refetchChats();
  }, [refetchChats]);

  const stableChatsData = useMemo(() => chatsData, [JSON.stringify(chatsData)]);

  useEffect(() => {
    if (stableChatsData) {
      setChatHistory(stableChatsData);
    }
  }, [stableChatsData, setChatHistory]);

  return {
    chatsData,
    isLoadingChats,
    loadChatHistory: refetchChatById,
    updateSidebar,
    initializeWebSocket,
    isLoadingHistory,
    chatId,
    chatHistory,
    sidebarVersion,
    setChatHistory,
    isValidChat,
    checkChatValidity,
    isCheckingChat,
    setIsValidChat,
    isLoading,
    setIsLoading,
    ws,
    setIsLoadingHistory,
    messages,
    updateChatHistory,
    initializeChatsData,
  };
};
