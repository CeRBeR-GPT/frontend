import { useCallback } from "react";
import { clearChatApi } from "./api";
import { ChatHistory } from "./types";
import { useUserData } from "@/entities/user/model/use-user";
import { useChats } from "@/entities/chat/model/use-chats";
import { useMessage } from "@/entities/message/model/use-message";


export const useClearChat = () => {

    const { getToken } = useUserData()
    const { setChatHistory, chatId} = useChats()
    const { dispatchMessages, setIsTestMessageShown} = useMessage()
    
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
    
            // await loadChatHistory(chatId)
          } catch (error) {
          }
        },
        [chatId, getToken, ],
      )


    return { clearChatMessages };
};
