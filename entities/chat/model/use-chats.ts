

import { useCallback, useRef, useState } from 'react';
import { getChatAllApi, getChatByIdApi } from './api';
import { useUserData } from '@/entities/user/model/use-user';
import { ChatHistory } from './types';
import { useMessage } from '@/entities/message/model/use-message';
import { useParams } from "next/navigation"

export const useChats = () => {
    const { getToken } = useUserData()
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
    const [chatTitle, setChatTitle] = useState<string>("")
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
    const [sidebarVersion, setSidebarVersion] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isValidChat, setIsValidChat] = useState<boolean>(true)
    const [isCheckingChat, setIsCheckingChat] = useState<boolean>(true)

    const { dispatchMessages, setIsTestMessageShown } = useMessage()
    const ws = useRef<WebSocket | null>(null)
    const params = useParams()
    const chatId = params.id as string
    console.log(chatId)

    const updateSidebar = useCallback(() => {
        setSidebarVersion((v) => v + 1)
    }, [])

    const updateChatHistory = useCallback(async () => {
        try {
            const token = await getToken()
            if (!token) return

            const response = await getChatAllApi()

            const updatedChats = response.data.map((chat: any) => {
                const lastMessageDate =
                chat.messages.length > 0
                    ? new Date(chat.messages[chat.messages.length - 1].created_at)
                    : new Date(chat.created_at)
                lastMessageDate.setHours(lastMessageDate.getHours() + 3)
        
                return {
                    id: chat.id,
                    title: chat.name,
                    preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Нет сообщений",
                    date: lastMessageDate,
                    messages: chat.messages.length,
                }
            })
        
            const sortedChats = updatedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
            console.log(sortedChats, "data")
        
            setChatHistory(sortedChats)

            if (sortedChats.length > 0) {
                localStorage.setItem("lastSavedChat", sortedChats[0].id)
            }
        } catch (error) {
        }
    }, [getToken])

    const loadChatHistory = useCallback( async (chatId: string) => {
        //   if (isRequested.current) return
        //   isRequested.current = true
    
        if (chatId === "1") return

        try {
            const token = await getToken()
            if (!token) return

            const idChat = localStorage.getItem("lastDeletedChat")
            if (chatId === idChat) {
                return
            }

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
    },[getToken])

    const initializeWebSocket = useCallback( async (chatId: string) => {
          if (chatId === "1") return
    
          try {
            const token = await getToken()
            if (!token) return
    
            const provider = localStorage.getItem("selectedProvider")
            const wsUrl = `wss://api-gpt.energy-cerber.ru/chat/ws/${chatId}?token=${token}&provider=${provider}`
    
            const idChat = localStorage.getItem("lastDeletedChat")
            if (chatId === idChat) { return }
            if (!isValidChat) return
    
            ws.current = new WebSocket(wsUrl)
            ws.current.onmessage = (event) => {
                dispatchMessages({
                type: "ADD",
                payload: {
                    id: Date.now(),
                    text: event.data,
                    message_belong: "assistant",
                    timestamp: new Date(),
                },
                })
    
                setIsLoading(false)
                updateSidebar()
                updateChatHistory().then(() => updateSidebar())
        
                // setTimeout(() => {
                //     messagesContainerRef.current?.scrollTo({
                //     top: messagesContainerRef.current.scrollHeight,
                //     behavior: "smooth",
                //     })
                // }, 50) 
            }
    
          } catch (error) {
          }
        },
        [getToken, updateSidebar, updateChatHistory],
    )

    const checkChatValidity = () => {
      if (chatId === "1") {
        setIsValidChat(true);
        setIsCheckingChat(false);
        return;
      }
  
      if (chatHistory.length === 0) {
        setIsValidChat(false);
        setIsCheckingChat(false);
        return;
      }
  
      const exists = chatHistory.some(chat => chat.id === chatId);
      setIsValidChat(exists);
      setIsCheckingChat(false);
    };

    const fetchChats = useCallback(async () => {
        try {
            const token = await getToken()
            if (!token) return
            //   if (isRequested1.current) return
            //   isRequested1.current = true
            const response = await getChatAllApi()
        
            const formattedChats = response.data.map((chat: any) => {
                const lastMessageDate =
                chat.messages.length > 0
                    ? new Date(chat.messages[chat.messages.length - 1].created_at)
                    : new Date(chat.created_at)
                lastMessageDate.setHours(lastMessageDate.getHours() + 3)
        
                return {
                    id: chat.id,
                    title: chat.name,
                    preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Нет сообщений",
                    date: lastMessageDate,
                    messages: chat.messages.length,
                }
            })
        
            const sortedChats = formattedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
            setChatHistory(sortedChats)
            console.log(sortedChats, "chats")
        
            const chatExists = sortedChats.some((chat: ChatHistory) => chat.id === chatId)
            setIsValidChat(chatExists || chatId === "1")
            setIsCheckingChat(false)
        
            if (sortedChats.length > 0) {
                localStorage.setItem("lastSavedChat", sortedChats[0].id)
            } else {
                localStorage.removeItem("lastSavedChat")
            }
        } catch (error) {
        }
      }, [getToken])

    return { loadChatHistory, updateSidebar, updateChatHistory,  initializeWebSocket, isLoadingHistory, chatTitle,
        chatId, chatHistory, sidebarVersion, setChatTitle, fetchChats, setChatHistory, isValidChat, checkChatValidity,
        isCheckingChat, setIsValidChat, isLoading, setIsLoading
    };
};
