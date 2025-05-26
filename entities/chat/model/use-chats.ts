
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatAllApi, getChatByIdApi } from './api';
import { useUser } from '@/shared/contexts/user-context';
import { ChatHistory } from './types';
import { useParams, useRouter } from "next/navigation"
import { useAuth } from '@/features/auth/model/use-auth';
import { useMessage } from '@/entities/message/model/use-message';
import { clearChatApi } from '@/features/clear-chat/model/api';
import { useMessageContext } from '@/shared/contexts/MessageContext';

export const useChats = () => {
    const { getToken, chatHistory, setChatHistory, setChatTitle, updateChatHistory} = useUser()
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
    const [sidebarVersion, setSidebarVersion] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { messagesContainerRef, ws } = useMessage()
    const { setIsTestMessageShown, isValidChat, setIsValidChat, isCheckingChat,
      setIsCheckingChat} = useMessageContext()
    const { dispatchMessages, messages} = useMessage()
    const params = useParams()
    const chatId = params.id as string
    const router = useRouter()
    const { isLoading: isAuthLoading, isAuthenticated} = useAuth()

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
    const isRequested5 = useRef(false)

    // const updateChatHistory = useCallback(async () => {
    //     if (isRequested5.current) return
    //     isRequested5.current = true
    //     try {
    //         const token = await getToken()
    //         if (!token) return

    //         const response = await getChatAllApi()

    //         const updatedChats = response.data.map((chat: any) => {
    //             const lastMessageDate =
    //             chat.messages.length > 0
    //                 ? new Date(chat.messages[chat.messages.length - 1].created_at)
    //                 : new Date(chat.created_at)
    //             lastMessageDate.setHours(lastMessageDate.getHours() + 3)
        
    //             return {
    //                 id: chat.id,
    //                 title: chat.name,
    //                 preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Нет сообщений",
    //                 date: lastMessageDate,
    //                 messages: chat.messages.length,
    //             }
    //         })
        
    //         const sortedChats = updatedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        
    //         setChatHistory(sortedChats)

    //         if (sortedChats.length > 0) {
    //             localStorage.setItem("lastSavedChat", sortedChats[0].id)
    //         }
    //     } catch (error) {
    //     }
    // }, [getToken])
    const isRequested = useRef(false)
  
    const loadChatHistory = useCallback(async (chatId: string) => {
        if (chatId === "1") return
        if (isRequested.current) return
        isRequested.current = true
        
        setIsLoadingHistory(true)
        try {
            const token = await getToken()
            if (!token) return

            const idChat = localStorage.getItem("lastDeletedChat")
            if (chatId === idChat) return

            const response = await getChatByIdApi(chatId)
            const history = response.data.messages
            dispatchMessages({ type: "SET", payload: history })
            setChatTitle(response.data.name)
            console.log(history)
            setIsTestMessageShown(history.length === 0)
            setIsLoadingHistory(false)
        } catch (error) {
            console.error("Failed to load chat history:", error)
            return null
        } finally {
            setIsLoadingHistory(false)
        }
    }, [getToken])

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
                // updateChatHistory().then(() => updateSidebar())
        
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
        [getToken, updateSidebar],
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
    const isRequested2 = useRef(false)

    const clearChatMessages = useCallback(async (id: string) => {
          try {
            await clearChatApi(id);
            setChatHistory((prev) =>
              prev.map((chat) =>
                chat.id === id ? { ...chat, messages: 0, preview: "Нет сообщений", date: new Date() } : chat
              )
            );
    
            if (id === chatId) {
              dispatchMessages({ type: "CLEAR" });
              setIsTestMessageShown(true);
            }
    
            await loadChatHistory(chatId);
            updateSidebar(); // <-- Добавьте эту строку
          } catch (error) {
            console.error("Failed to clear chat:", error);
          }
    }, [chatId, setChatHistory, dispatchMessages, setIsTestMessageShown, loadChatHistory, updateSidebar]);

    const fetchChats = useCallback(async () => {
        try {
            const token = await getToken()
            if (!token) return
            if (isRequested2.current) return
            isRequested2.current = true
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

    return { loadChatHistory, updateSidebar, initializeWebSocket, isLoadingHistory,
        chatId, chatHistory, sidebarVersion, fetchChats, setChatHistory, isValidChat, checkChatValidity,
        isCheckingChat, setIsValidChat, isLoading, setIsLoading, ws, setIsLoadingHistory, messages,
        clearChatMessages
    };
};
