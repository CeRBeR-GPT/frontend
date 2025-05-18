// features/chat-init/model/use-chat-init.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/use-auth';
import { useChats } from '@/entities/chat/model/use-chats';
import { useMessage } from '@/entities/message/model/use-message';
import MessageItem from "@/components/MessageItem";
import { useCopyMessage } from '@/features/copy-message/model/use-copyMessage';
import { useTheme } from 'next-themes';
import { throttle } from 'lodash-es';

export const useChatInitialization = (messages, isLoading, setIsLoading, dispatchMessages, ws) => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { handleCopyCode, handleCopyTextMarkdown, copiedCode} = useCopyMessage()
  const { theme } = useTheme()
  
  const {
    chatId,
    loadChatHistory,
    initializeWebSocket,
    fetchChats,
    setChatTitle,
    isCheckingChat
  } = useChats();
  
  const {
    setIsTestMessageShown,
  } = useMessage();

  const [input, setInput] = useState<string>("")
    
  const throttledSubmit = useMemo(() =>
    throttle((inputText: string) => {
      if (!inputText.trim() || isLoading) return;

      const userMessage = {
        id: Date.now(),
        text: inputText,
        message_belong: "user" as const,
        timestamp: new Date(),
      };

      dispatchMessages({ type: "ADD", payload: userMessage });
      setIsLoading(true);
      setInput("");

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
        setInput(e.target.value)
  }, [])

  const renderedMessages = useMemo(() =>
        messages.map((message) => {
            console.log("message:", message); // Лог каждого message
            return (
                <MessageItem key={`${message.id}`} handleCopyTextMarkdown = {handleCopyTextMarkdown}
                message={message} theme={theme}
                onCopy={handleCopyCode} copiedCode={copiedCode} />
            );
        }),
    [messages, theme, copiedCode, handleCopyCode, handleSubmit],
  );

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

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

  return {
    isCheckingChat,
    renderedMessages, // Возвращаем подготовленные сообщения для рендеринга,
    handleSubmit, input, handleInputChange
  };
};