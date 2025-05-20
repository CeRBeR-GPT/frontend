import { useCallback } from "react";
import { deleteChatApi } from "./api";
import { useChats } from "@/entities/chat/model/use-chats";
import { useRouter } from "next/navigation";
import { useUser } from "@/shared/contexts/user-context";

export const useDeleteChat = () => {
    const router = useRouter()

    const { getToken } = useUser()
    const {setChatHistory, chatHistory, chatId, updateSidebar, setIsLoading, ws} = useChats()
    const deleteChat = useCallback( async (id: string) => {
        router.push(`/chat/${id}`)
        try {
            setIsLoading(true)

            await deleteChatApi(id)
            localStorage.setItem("lastDeletedChat", id || "")
            const remainingChats = chatHistory.filter((chat) => chat.id !== id)
            setChatHistory(remainingChats)
            const lastSavedChat = localStorage.getItem("lastSavedChat")
            if (lastSavedChat === id) {
                localStorage.setItem("lastSavedChat", remainingChats.length > 0 ? remainingChats[0].id : "1")
            }

            if (id === chatId) {
                const nextChatId = remainingChats.length > 0 ? remainingChats[0].id : "1"
                if (ws.current) {
                    ws.current.close(1000, "Chat deleted")
                    ws.current = null
                }

                router.push(`/chat/${nextChatId}`)
            }

            updateSidebar()
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    },
        [chatId, chatHistory, getToken, router, updateSidebar],
    )

    const handleChatDeleted = useCallback(
        (nextChatId: string | null) => {
          if (nextChatId) {
            router.push(`/chat/${nextChatId}`)
          } else {
            router.push("/chat/1")
          }
        },
        [router],
    )

    return { deleteChat, handleChatDeleted };
};
