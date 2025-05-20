import { useCallback } from "react";
import { clearChatApi } from "./api";
import { ChatHistory } from "./types";
import { useChats } from "@/entities/chat/model/use-chats";
import { useMessage } from "@/entities/message/model/use-message";
import { useUser } from "@/shared/contexts/user-context";

export const useClearChat = () => {

    const { getToken } = useUser()
    const { setChatHistory, chatId} = useChats()
    const { dispatchMessages, setIsTestMessageShown} = useMessage()
    const { loadChatHistory } = useChats()
    
    const clearChatMessages = useCallback( async (id: string) => {
          try {
            await clearChatApi(id)
    
            setChatHistory((prev: ChatHistory[]) =>
              prev.map((chat) =>
                chat.id === id ? { ...chat, messages: 0, preview: "Нет сообщений", date: new Date() } : chat,
              )
            )
    
            if (id === chatId) {
                dispatchMessages({ type: "CLEAR" })
                setIsTestMessageShown(true)
            }
    
            await loadChatHistory(chatId)
          } catch (error) {
          }
        },
        [chatId, getToken, ],
      )


    return { clearChatMessages };
};
