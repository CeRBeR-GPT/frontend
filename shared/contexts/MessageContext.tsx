'use client'

import { createContext, useContext, useReducer, ReactNode } from "react";
// import { Message } from "../features/chat-init/types";

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
  

  return (
    <MessageContext.Provider value={{ messages, dispatchMessages }}>
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