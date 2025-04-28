"use client"

import { editChatNameApi, getChatByIdApi } from "@/api/api"
import { createContext, useContext, useState, useCallback, useMemo, useRef, useReducer } from "react"
import { useAuth } from "@/hooks/use-auth"

interface ChatHistory {
    id: string
    title: string
    preview: string
    date: Date
    messages: number
}

interface Message {
    id: number
    text: string
    message_belong: "user" | "assistant"
    timestamp: Date
}

type ProfileContextType = {
    sidebarVersion: number
    chatHistory: ChatHistory[]
    setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>
    renameChatTitle: (id: string, newTitle: string) => Promise<void>
    chatTitle: string
    setChatTitle: React.Dispatch<React.SetStateAction<string>>
}

function messagesReducer(state: Message[], action: { type: string; payload?: any }) {
    switch (action.type) {
      case "ADD":
        return [...state, action.payload]
      case "SET":
        return action.payload
      case "CLEAR":
        return []
      default:
        return state
    }
}

const ChatsContext = createContext<ProfileContextType | undefined>(undefined)

export function ChatsProvider({ children }: { children: React.ReactNode }) {
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
    const [sidebarVersion, setSidebarVersion] = useState(0)
    const [messages, dispatchMessages] = useReducer(messagesReducer, [])
    const [chatTitle, setChatTitle] = useState("")
    const { getToken } = useAuth()

    const renameChatTitle = useCallback(async (id: string, newTitle: string) => {
        try {
            await editChatNameApi(id, newTitle)
            setChatHistory(prev => 
                prev.map(chat => chat.id === id ? { ...chat, title: newTitle } : chat))
            setChatTitle(newTitle)
        } catch (error) {
            console.error("Failed to rename chat:", error)
            throw error
        }
    }, [])

    const isRequested = useRef(false)

    const loadChatHistory = useCallback( async (chatId: string) => {
        if (isRequested.current) return
        isRequested.current = true

        if (chatId === "1") return

        try {
        const token = await getToken()
        if (!token) return

        const idChat = localStorage.getItem("lastDeletedChat")
        if (chatId === idChat) {return}

        const response = await getChatByIdApi(chatId)

        const history = response.data.messages
        dispatchMessages({ type: "SET", payload: history })
        setChatTitle(response.data.name)
        setIsTestMessageShown(history.length === 0)
        setIsLoadingHistory(false)
        } catch (error) {
        } finally {
        setIsLoadingHistory(false)
        }
    },
    [getToken],
    )

    const value = useMemo(() => ({
        sidebarVersion,
        chatHistory,
        setChatHistory,
        renameChatTitle,
        chatTitle,
        setChatTitle
    }), [sidebarVersion, chatHistory, chatTitle, renameChatTitle])

    return (
        <ChatsContext.Provider value={value}>
            {children}
        </ChatsContext.Provider>
    )
}

export const useChats = () => {
    const context = useContext(ChatsContext)
    if (context === undefined) {
        throw new Error("useChats must be used within a ChatsProvider")
    }
    return context
}