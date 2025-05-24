
import { useChats } from "@/entities/chat/model/use-chats";
import { ChatHistory } from "./types";
import { editChatNameApi } from "./api";

export const useRenameChat = () => {
    const { setChatHistory, setChatTitle } = useChats()
    const {loadChatHistory, chatId, updateSidebar} = useChats()
    const renameChatTitle = async (id: string, newTitle: string) => {
        try {
            await editChatNameApi(id, newTitle)

            setChatHistory((prev: ChatHistory[]) =>
                prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)),
            )
            setChatTitle(newTitle)
            updateSidebar()
        } catch (error) {
        }
    }   
    

    return { renameChatTitle };
};

