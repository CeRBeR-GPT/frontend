
import { useChats } from "@/entities/chat/model/use-chats";
import { ChatHistory } from "./types";
import { editChatNameApi } from "./api";
import { useUser } from "@/shared/contexts/user-context";

export const useRenameChat = () => {
    const { setChatHistory, setChatTitle, updateChatHistory} = useUser()
    // const { setChatTitle } = useChats()
    const { updateSidebar } = useChats()
    const renameChatTitle = async (id: string, newTitle: string) => {
        try {
            await editChatNameApi(id, newTitle)

            setChatHistory((prev: ChatHistory[]) =>
                prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)),
            )
            setChatTitle(newTitle)
            updateSidebar()
            updateChatHistory().then(() => updateSidebar())
        } catch (error) {
        }
    }   
    

    return { renameChatTitle };
};

