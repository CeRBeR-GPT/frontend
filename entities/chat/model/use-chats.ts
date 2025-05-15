

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChatAllApi, getChatByIdApi } from './api';
import { useUserData } from '@/entities/user/model/use-user';
import { ChatHistory } from './types';
import { useParams, useRouter } from "next/navigation"
import { useAuth } from '@/features/auth/model/use-auth';
import { useMessage } from '@/entities/message/model/use-message';

export const useChats = () => {
    const { getToken } = useUserData()
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
    const [chatTitle, setChatTitle] = useState<string>("")
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
    const [sidebarVersion, setSidebarVersion] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isValidChat, setIsValidChat] = useState<boolean>(true)
    const [isCheckingChat, setIsCheckingChat] = useState<boolean>(true)
    const { messagesContainerRef, ws } = useMessage()

    const { dispatchMessages, setIsTestMessageShown, messages, isTestMessageShown } = useMessage()
    const params = useParams()
    const chatId = params.id as string
    const router = useRouter()
    const { isLoading: isAuthLoading, isAuthenticated} = useAuth()

    const shouldShowInput = useMemo(() => {
        return isValidChat && !isCheckingChat && (messages.length > 0 || isTestMessageShown)
      }, [isValidChat, isCheckingChat, messages.length, isTestMessageShown])

    useEffect(() => {
        if (isAuthLoading) return
        if (!isAuthenticated) {
          router.push("/auth/login")
          return
        }
      
        if (chatId === "1") {
          dispatchMessages({ type: "CLEAR" })
          setIsTestMessageShown(true)
          setChatTitle("Новый чат")
          return
        }
      
        const loadData = async () => {
          await loadChatHistory(chatId)
          await initializeWebSocket(chatId)
          await fetchChats()
        }
        loadData()
      }, [chatId, isAuthenticated, isAuthLoading, router])

    const updateSidebar = useCallback(() => {
        setSidebarVersion((v) => v + 1)
    }, [])

    useEffect(() => {
        checkChatValidity();
    }, [chatHistory, chatId]);

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
        
            setChatHistory(sortedChats)

            if (sortedChats.length > 0) {
                localStorage.setItem("lastSavedChat", sortedChats[0].id)
            }
        } catch (error) {
        }
    }, [getToken])
  
    const loadChatHistory = useCallback(async (chatId: string) => {
        if (chatId === "1") return
        
        setIsLoadingHistory(true)
        try {
            const token = await getToken()
            if (!token) return

            const idChat = localStorage.getItem("lastDeletedChat")
            if (chatId === idChat) return

            const response = await getChatByIdApi(chatId)
            return {
                messages: response.data.messages,
                title: response.data.name,
                isEmpty: response.data.messages.length === 0
            }
        } catch (error) {
            console.error("Failed to load chat history:", error)
            return null
        } finally {
            setIsLoadingHistory(false)
        }
    }, [getToken])

    const initializeWebSocket = useCallback( async (chatId: string) => {
        console.log("Hereee")
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
        
                setTimeout(() => {
                    messagesContainerRef.current?.scrollTo({
                    top: messagesContainerRef.current.scrollHeight,
                    behavior: "smooth",
                })
                }, 50) 
            }

            ws.current.onopen = () => {
                console.log('WebSocket connected');
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
            };
    
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
        isCheckingChat, setIsValidChat, isLoading, setIsLoading, ws, shouldShowInput, setIsLoadingHistory
    };
};
