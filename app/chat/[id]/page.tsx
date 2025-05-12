"use client"
import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Bot, ArrowDown } from "lucide-react"
// import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "../../../widgets/user-menu/user-menu"
import { ChatSidebar } from "@/components/chat-sidebar"
import { NavLinks } from "@/components/nav-links"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import "katex/dist/katex.min.css"
import  Markdown from "@/components/markdown-with-latex"
import { throttle } from "lodash-es"
import MessageItem from "@/components/MessageItem"
import MessageInput from "@/components/MessageInput"
import { clearChatApi, deleteChatApi, editChatNameApi,getChatByIdApi } from "@/api/api"
import { useAuth } from "@/features/auth/model/use-auth"
import { useUserData } from "@/entities/user/model/use-user"
import { useChats } from "@/entities/chat/model/use-chats"
import { useMessage } from "@/entities/message/model/use-message"

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface Message {
  id: number
  text: string
  message_belong: "user" | "assistant"
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  preview: string
  date: Date
  messages: number
}

const providersByPlan = {
  default: ["default", "deepseek"],
  premium: ["default", "deepseek", "gpt_4o_mini"],
  business: ["default", "deepseek", "gpt_4o_mini", "gpt_4o", "gpt_4"],
}

MessageItem.displayName = "MessageItem"
MessageInput.displayName = "MessageInput"

export default function ChatPage() {
  const { chatId, updateChatHistory, setChatHistory, chatHistory, checkChatValidity, isValidChat,
    setIsValidChat, isCheckingChat, updateSidebar, sidebarVersion, chatTitle, setChatTitle, fetchChats
   } = useChats()
  const { messages, dispatchMessages} = useMessage()
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const {userData, getToken } = useUserData()
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isTestMessageShown, setIsTestMessageShown] = useState<boolean>(true)
  const [selectedProvider, setSelectedProvider] = useState<string>("default")
  const [availableProviders, setAvailableProviders] = useState<string[]>([])
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false)
  const { toast } = useToast()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [rootKey, setRootKey] = useState<number>(0);
  const [CopiedText,setCopiedText] = useState<string | null>(null)

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

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
  
    let lastScrollTop = container.scrollTop
  
    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 50
      const isScrollingDown = scrollTop > lastScrollTop
      lastScrollTop = scrollTop
      const hasMoreContentBelow = scrollHeight > clientHeight + scrollTop
      setShowScrollToBottom(isScrollingDown && hasMoreContentBelow && !isAtBottom)
    }
  
    container.addEventListener("scroll", handleScrollEvent)
    return () => {
      container.removeEventListener("scroll", handleScrollEvent)
    }
  }, [messagesContainerRef.current, messages.length])

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [])

  useEffect(() => {
    if (!messagesContainerRef.current || isLoadingHistory) return
    const scrollToBottom = () => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }

    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, isLoadingHistory])

  useEffect(() => {
    if (!isLoadingHistory && messages.length > 0) {
      const timer = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [isLoadingHistory, messages.length, chatId])

  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden")
    return () => {
      document.documentElement.classList.remove("overflow-hidden")
    }
  }, [])

  useEffect(() => {
    if (userData) {
      const providers = providersByPlan[userData.plan as keyof typeof providersByPlan] || providersByPlan.default
      setAvailableProviders(providers)
      const savedProvider = localStorage.getItem("selectedProvider")
      if (savedProvider && providers.includes(savedProvider)) {
        setSelectedProvider(savedProvider)
      } else {
        setSelectedProvider(providers[0])
        localStorage.setItem("selectedProvider", providers[0])
      }
    }
  }, [userData])

  const renameChatTitle = async (id: string, newTitle: string) => {
    const token = await getToken()
    try {
      await editChatNameApi(id, newTitle)

      setChatHistory((prev: ChatHistory[]) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)),
      )
      setChatTitle(newTitle)
    } catch (error) {
    }
  }

  const ws = useRef<WebSocket | null>(null)
  const isRequested = useRef(false)

  const loadChatHistory = useCallback(
    async (chatId: string) => {
      if (isRequested.current) return
      isRequested.current = true

      if (chatId === "1") return

      try {
        const token = await getToken()
        if (!token) return

        const idChat = localStorage.getItem("lastDeletedChat")
        if (chatId === idChat) return

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

  const clearChatMessages = useCallback(
    async (id: string) => {
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
    [chatId, getToken, loadChatHistory],
  )

  useEffect(() => {
    checkChatValidity();
  }, [chatHistory, chatId]);

  const initializeWebSocket = useCallback(
    async (chatId: string) => {
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

      } catch (error) {
      }
    },
    [getToken, updateSidebar, updateChatHistory],
  )

  const deleteChat = useCallback(
    async (id: string) => {
      const token = await getToken()
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

  const isRequested1 = useRef(false)

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const throttledSubmit = useMemo(
    () =>
      throttle((input: string) => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
          id: Date.now(),
          text: input,
          message_belong: "user",
          timestamp: new Date(),
        }

        dispatchMessages({ type: "ADD", payload: userMessage })
        setIsLoading(true)
        setInput("")

        if (ws.current) { ws.current.send(input) }
      }, 500),
    [isLoading],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      throttledSubmit(input)
    },
    [input, throttledSubmit],
  )

  useEffect(() => {
    if (chatHistory.length > 0 && chatId !== "1") {
      const exists = chatHistory.some(chat => chat.id === chatId)
      setIsValidChat(exists)
    }
  }, [chatHistory, chatId])

  // Обновленное условие отображения поля ввода
  const shouldShowInput = useMemo(() => {
    return isValidChat && !isCheckingChat && (messages.length > 0 || isTestMessageShown)
  }, [isValidChat, isCheckingChat, messages.length, isTestMessageShown])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: "Код скопирован",
      description: "Код был успешно скопирован в буфер обмена.",
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  const handleCopyTextMarkdown = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedText(code)
    toast({
      title: "Текст скопирован",
      description: "Текст скопирован в буфер обмена.",
    })
    setTimeout(() => setCopiedText(null), 2000)
  }, [])

  useEffect(() => {
    if (!messagesContainerRef.current || isLoadingHistory) return

    const scrollToBottom = () => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }

    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, isLoadingHistory])

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    dispatchMessages({ type: "CLEAR" })
    setChatTitle("Новый чат")

    const fetchData = async () => {
      await loadChatHistory(chatId)
      await initializeWebSocket(chatId)
      await fetchChats()
    }

    fetchData()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [chatId, isAuthenticated, isAuthLoading, router, loadChatHistory, initializeWebSocket, fetchChats])

  const renderedMessages = useMemo(() =>
      messages.map((message) => (
        <MessageItem key={`${message.id}`} handleCopyTextMarkdown = {handleCopyTextMarkdown} message={message} theme={theme} onCopy={handleCopyCode} copiedCode={copiedCode} />
      )),
    [messages, theme, copiedCode, handleCopyCode],
  )

  const handleProviderChange = useCallback( (provider: string) => {
      setSelectedProvider(provider)
      localStorage.setItem("selectedProvider", provider)
      initializeWebSocket(chatId)
    },
    [chatId, initializeWebSocket],
  )

  if (isAuthLoading || !isAuthenticated) { return null }

  return (
    <div key={`root-${rootKey}`} className="flex flex-col min-h-screen">
  <Toaster />
  <header className="border-b sticky top-0 z-10 bg-background">
    <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline">CeRBeR-AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <span>/</span>
          <span className="font-medium text-foreground">
            {chatTitle === "Новый чат" ? "" : chatTitle}
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-4">
        <NavLinks />
        {/* <ThemeToggle /> */}
        <UserMenu />
      </nav>
    </div>
  </header>

  <div className="flex flex-1 overflow-hidden">
    <ChatSidebar
      key={`sidebar-${sidebarVersion}`}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      onChatDeleted={handleChatDeleted}
      renameChatTitle={renameChatTitle}
      clearChatMessages={clearChatMessages}
      deleteChat={deleteChat}
    />

    {isCheckingChat ? (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ) : !isValidChat ? (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-3 bg-muted">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown
                handleCopyTextMarkdown={handleCopyTextMarkdown}
                content="# Привет! Я ваш AI ассистент. Выберите чат или создайте новый!"
                theme={theme}
                onCopy={handleCopyCode}
                copiedCode={copiedCode}
              />
            </div>
        </Card>
      </div>
    ) : (
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-0 py-6 md:px-6 max-w-5xl lg:max-w-6xl">
          <div className="flex flex-col h-[calc(100vh-7rem)] w-full">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div 
                  ref={messagesContainerRef} 
                  className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 sm:px-4"
                >
                  {showScrollToBottom && (
                    <button
                      onClick={scrollToBottom}
                      className="fixed right-4 bottom-24 md:right-14 lg:right-24 z-10 p-2 rounded-full bg-background border shadow-lg hover:bg-muted transition-colors"
                      aria-label="Прокрутить вниз"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  )}

                  {isTestMessageShown && messages.length === 0 && (
                    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <Avatar className="mt-1">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Card className="p-3 bg-muted">
                          <div className="prose dark:prose-invert max-w-none">
                            <Markdown
                              handleCopyTextMarkdown={handleCopyTextMarkdown}
                              content="# Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?"
                              theme={theme}
                              onCopy={handleCopyCode}
                              copiedCode={copiedCode}
                            />
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {renderedMessages}

                  {isLoading && (
                    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <Avatar className="mt-1">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Card className="p-3 bg-muted">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>

                {shouldShowInput && (
                  <div className="sticky bottom-0 bg-background border-t">
                    <MessageInput
                      value={input}
                      onChange={handleInputChange}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      selectedProvider={selectedProvider}
                      availableProviders={availableProviders}
                      onProviderChange={handleProviderChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    )}
  </div>
</div>
  )
}