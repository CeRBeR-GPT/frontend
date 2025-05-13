import { editChatNameApi } from "@/api/api";
import { useChats } from "@/entities/chat/model/use-chats";
import { ChatHistory } from "./types";

export const useRenameChat = () => {
    const { setChatHistory, setChatTitle } = useChats()
    const renameChatTitle = async (id: string, newTitle: string) => {
        try {
            await editChatNameApi(id, newTitle)

            setChatHistory((prev: ChatHistory[]) =>
                prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)),
            )
            setChatTitle(newTitle)
        } catch (error) {
        }
    }   
    

    return { renameChatTitle };
};

