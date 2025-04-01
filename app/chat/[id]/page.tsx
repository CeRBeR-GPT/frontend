"use client"
import React from "react"
import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Bot, User, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { NavLinks } from "@/components/nav-links"
import { ChatOptionsMenu } from "@/components/chat-options-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import axios from "axios"
import { useTheme } from "next-themes"
import "katex/dist/katex.min.css"
import { MarkdownWithLatex } from "@/components/markdown-with-latex"
import { throttle } from "lodash-es"
import ProviderSelectorDropdown from "@/components/provider-selector-dropdown"

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

const MessageItem = React.memo(
  ({
    message,
    theme,
    onCopy,
    copiedCode,
  }: {
    message: Message
    theme: string | undefined
    onCopy: (code: string) => void
    copiedCode: string | null
  }) => {
    return (
      <div
        className={`flex ${
          message.message_belong === "user" ? "justify-end" : "justify-start"
        } animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
      >
        <div className="flex items-start gap-3 max-w-[98%] sm:gap-3 sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          {message.message_belong === "assistant" && (
            <Avatar className="mt-1">
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <Card
            className={`p-3 ${message.message_belong === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownWithLatex content={message.text} theme={theme} onCopy={onCopy} copiedCode={copiedCode} />
            </div>
          </Card>
          {message.message_belong === "user" && (
            <Avatar className="mt-1">
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    )
  },
)

MessageItem.displayName = "MessageItem"

const MessageInput = React.memo(
  ({
    value,
    onChange,
    onSubmit,
    isLoading,
    selectedProvider,
    availableProviders,
    onProviderChange,
  }: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    onSubmit: (e: React.FormEvent) => void
    isLoading: boolean
    selectedProvider: string
    availableProviders: string[]
    onProviderChange: (provider: string) => void
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      textarea.style.height = "auto"
      const newHeight = Math.max(60, Math.min(textarea.scrollHeight, 200))
      textarea.style.height = `${newHeight}px`
    }, [])

    useEffect(() => {
      adjustTextareaHeight()
    }, [value, adjustTextareaHeight])
    return (
      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background pt-2 w-full max-w-full">
        <div className="relative flex items-end gap-2 w-full">
          <div className="flex-shrink-0">
            <ProviderSelectorDropdown
              selectedProvider={selectedProvider}
              availableProviders={availableProviders}
              onProviderChange={onProviderChange}
            />
          </div>
          <div className="relative flex-grow w-full">
            <Textarea
              ref={textareaRef}
              placeholder="Напишите ваш запрос..."
              value={value}
              onChange={onChange}
              className="min-h-[60px] max-h-[200px] resize-none pr-14 rounded-xl border-gray-300 focus:border-primary w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              className="absolute right-2 bottom-2 rounded-full w-10 h-10 p-0"
              disabled={!value.trim() || isLoading}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Отправить</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          AI может допускать ошибки. Проверяйте важную информацию.
        </p>
      </form>
    )
  },
)

MessageInput.displayName = "MessageInput"

function messagesReducer(state: Message[], action: { type: string; payload?: any }) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload]
    case "SET":
      return action.payload
    case "CLEAR":
      return [
        {
          id: 1,
          text: "# Привет! Я ваш AI ассистент.",
          message_belong: "assistant",
          timestamp: new Date(),
        },
      ]
    default:
      return state
  }
}

export default function ChatPage() {
  const { theme } = useTheme()
  const params = useParams()
  const router = useRouter()
  const chatId = params.id as string
  const { isAuthenticated, isLoading: isAuthLoading, getToken, userData } = useAuth()

  const [input, setInput] = useState("")
  const [messages, dispatchMessages] = useReducer(messagesReducer, [])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [chatTitle, setChatTitle] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isTestMessageShown, setIsTestMessageShown] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [sidebarVersion, setSidebarVersion] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<string>("default")
  const [availableProviders, setAvailableProviders] = useState<string[]>([])

  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden");
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, []);

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

  const ws = useRef<WebSocket | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isRequested = useRef(false)

  const updateSidebar = useCallback(() => {
    setSidebarVersion((v) => v + 1)
  }, [])

  const updateChatHistory = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return

      const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

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
      console.error("Error updating chat history:", error)
    }
  }, [getToken])

  const loadChatHistory = useCallback(
    async (chatId: string) => {
      setIsLoadingHistory(true)
      if (isRequested.current) return
      isRequested.current = true

      if (chatId === "1") return

      try {
        const token = await getToken()
        if (!token) return

        const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const history = response.data.messages
        dispatchMessages({ type: "SET", payload: history })
        setChatTitle(response.data.name)
        setIsTestMessageShown(history.length === 0)
      } catch (error) {
        console.error("Failed to load chat history:", error)
        toast({
          title: "Ошибка загрузки истории",
          description: "Не удалось загрузить историю сообщений.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingHistory(false)
      }
    },
    [getToken],
  )

  const initializeWebSocket = useCallback(
    async (chatId: string) => {
      if (chatId === "1") return

      try {
        const token = await getToken()
        if (!token) return

        const provider = localStorage.getItem("selectedProvider")
        const wsUrl = `wss://api-gpt.energy-cerber.ru/chat/ws/${chatId}?token=${token}&provider=${provider}`

        ws.current = new WebSocket(wsUrl)

        ws.current.onopen = () => {
          console.log("WebSocket connection established")
        }

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

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error)
          toast({
            title: "Ошибка WebSocket",
            description: "Не удалось подключиться к серверу.",
            variant: "destructive",
          })
        }

        ws.current.onclose = (event) => {
          console.log("WebSocket connection closed:", event)
          if (event.code !== 1000) {
            toast({
              title: "Соединение закрыто",
              description: "Попытка переподключения...",
              variant: "destructive",
            })
            setTimeout(() => initializeWebSocket(chatId), 5000)
          }
        }
      } catch (error) {
        console.error("WebSocket initialization error:", error)
      }
    },
    [getToken, updateSidebar, updateChatHistory],
  )

  const fetchChats = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return

      const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

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

      if (sortedChats.length > 0) {
        localStorage.setItem("lastSavedChat", sortedChats[0].id)
      } else {
        localStorage.removeItem("lastSavedChat")
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить чаты",
        variant: "destructive",
      })
    }
  }, [getToken])

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

  const handleClearChat = useCallback(() => {
    dispatchMessages({ type: "CLEAR" })
    toast({
      title: "Сообщения очищены",
      description: "Все сообщения в чате были удалены",
    })
  }, [])

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

        if (ws.current) {
          ws.current.send(input)
        }
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

  const handleDeleteChat = useCallback(
    (id: string) => {
      toast({
        title: "Чат удален",
        description: "Чат был успешно удален",
      })
      //router.push("/chat/new")
    },
    [router],
  )

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    setChatTitle(newTitle)
    toast({
      title: "Название обновлено",
      description: "Название чата было успешно изменено",
    })
  }, [])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: "Код скопирован",
      description: "Код был успешно скопирован в буфер обмена.",
    })
    setTimeout(() => setCopiedCode(null), 2000)
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

  const renderedMessages = useMemo(
    () =>
      messages.map((message) => (
        <MessageItem key={message.id} message={message} theme={theme} onCopy={handleCopyCode} copiedCode={copiedCode} />
      )),
    [messages, theme, copiedCode, handleCopyCode],
  )

  const handleProviderChange = useCallback(
    (provider: string) => {
      setSelectedProvider(provider)
      localStorage.setItem("selectedProvider", provider)

      toast({
        title: "Провайдер изменен",
        description: `Провайдер изменен на ${provider}`,
      })
    },
    [chatId, initializeWebSocket],
  )

  if (isAuthLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>AI Chat</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">{chatTitle === "Новый чат" ? "" : chatTitle}</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="md:hidden">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            {chatId !== "new" && (
              <div className="md:hidden">
                <ChatOptionsMenu
                  chatId={chatId}
                  chatTitle={chatTitle}
                  onDelete={handleDeleteChat}
                  onClear={handleClearChat}
                  onRename={handleRenameChat}
                />
              </div>
            )}
            <NavLinks />
            <ThemeToggle />
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
        />

        {chatHistory.length > 0 ? (
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 md:px-6 max-w-5xl lg:max-w-6xl">
              <div className="flex flex-col h-[calc(100vh-6rem)] w-full">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                      {isTestMessageShown && messages.length === 0 ? (
                        <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                          <div className="flex items-start gap-3 max-w-[80%]">
                            <Avatar className="mt-1">
                              <AvatarFallback>
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <Card className="p-3 bg-muted">
                              <div className="prose dark:prose-invert max-w-none">
                                <MarkdownWithLatex
                                  content="# Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?"
                                  theme={theme}
                                  onCopy={handleCopyCode}
                                  copiedCode={copiedCode}
                                />
                              </div>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        renderedMessages
                      )}
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
                    <MessageInput
                      value={input}
                      onChange={handleInputChange}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      selectedProvider={selectedProvider}
                      availableProviders={availableProviders}
                      onProviderChange={handleProviderChange}
                    />
                  </>
                )}
              </div>
            </div>
          </main>
        ) : null}
      </div>
    </div>
  )
}