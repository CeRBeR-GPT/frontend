'use client'

import { createContext, useContext, useReducer, ReactNode, useMemo, useState } from "react";

interface Message {
    id: number
    text: string
    message_belong: "user" | "assistant"
    timestamp: Date
}

type MessageAction =
  | { type: "ADD"; payload: Message }
  | { type: "SET"; payload: Message[] }
  | { type: "CLEAR" };

type MessageContextType = {
  messages: Message[];
  dispatchMessages: (action: MessageAction) => void;
  shouldShowInput: boolean;
  isValidChat: boolean;
  setIsValidChat: React.Dispatch<React.SetStateAction<boolean>>;
  isCheckingChat: boolean;
  setIsCheckingChat: React.Dispatch<React.SetStateAction<boolean>>;
  isTestMessageShown: boolean;
  setIsTestMessageShown: React.Dispatch<React.SetStateAction<boolean>>;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Редуктор (аналогичный вашему)
function messagesReducer(state: Message[], action: MessageAction): Message[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "SET":
      return Array.isArray(action.payload) ? action.payload : [];
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// Провайдер контекста
export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, dispatchMessages] = useReducer(messagesReducer, []);
  const [isValidChat, setIsValidChat] = useState<boolean>(true)
  const [isCheckingChat, setIsCheckingChat] = useState<boolean>(true)
  const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true);

  const shouldShowInput = useMemo(() => {
      return isValidChat && !isCheckingChat && (messages.length > 0 || isTestMessageShown)
  }, [isValidChat, isCheckingChat, messages.length, isTestMessageShown])
  
  return (
    <MessageContext.Provider value={
      { messages, dispatchMessages, 
        shouldShowInput, isValidChat,
        setIsValidChat, isCheckingChat, setIsCheckingChat,
        isTestMessageShown, setIsTestMessageShown 
      }
    }>
      {children}
    </MessageContext.Provider>
  );
};

// Хук для доступа к контексту
export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};