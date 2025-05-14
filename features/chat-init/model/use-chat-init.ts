
// features/chat-init/model/use-chat-init.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/use-auth';
import { useChats } from '@/entities/chat/model/use-chats';
import { useMessage } from '@/entities/message/model/use-message';

export const useChatInit = async () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    chatId,
    loadChatHistory,
    initializeWebSocket,
    fetchChats,
    ws,
    setChatTitle,
  } = useChats();
  const {
    dispatchMessages,
    setIsTestMessageShown,
  } = useMessage();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const initializeChat = async () => {
      dispatchMessages({ type: "CLEAR" });
      setChatTitle("Новый чат");
      
      const history = await loadChatHistory(chatId);
      if (history) {
        dispatchMessages({ type: "SET", payload: history.messages });
        setChatTitle(history.title);
        setIsTestMessageShown(history.isEmpty);
      }
      
      await initializeWebSocket(chatId);
      await fetchChats();
    };

    initializeChat();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chatId, isAuthenticated, isAuthLoading]);
};