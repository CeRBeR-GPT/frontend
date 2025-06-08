// features/chat-init/model/use-chat-init.ts
import { useCallback, useMemo, useState } from 'react';
import { useChats } from '@/entities/chat/model/use-chats';
import MessageItem from "@/entities/chat/ui/MessageItem";
import { useCopyMessage } from '@/features/copy-message/model';
import { useTheme } from 'next-themes';
import { throttle } from 'lodash-es';
import { useMessageContext } from '@/shared/contexts/MessageContext';

interface UseChatInitializationProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  ws: React.MutableRefObject<WebSocket | null>;
}

export const useChatInitialization = ({isLoading, setIsLoading, ws} : UseChatInitializationProps) => {
  const { messages, dispatchMessages } = useMessageContext();
  const { handleCopyCode, handleCopyTextMarkdown, copiedCode} = useCopyMessage()
  const { theme } = useTheme()
  
  const { isCheckingChat } = useChats();
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
            return (
                <MessageItem key={`${message.id}`} handleCopyTextMarkdown = {handleCopyTextMarkdown}
                message={message}/>
            );
        }),
    [messages, theme, copiedCode, handleCopyCode, handleSubmit],
  );

  return {
    isCheckingChat,
    renderedMessages, // Возвращаем подготовленные сообщения для рендеринга,
    handleSubmit, input, handleInputChange
  };
};