"use client"
import React from "react"
import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Bot, User, ArrowDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useAuth } from "@/hooks/use-auth"
import { NavLinks } from "@/components/nav-links"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import axios from "axios"
import { useTheme } from "next-themes"
import "katex/dist/katex.min.css"
import  Markdown from "@/components/markdown-with-latex"
import { throttle } from "lodash-es"
import ProviderSelectorDropdown from "@/components/provider-selector-dropdown"
//import Markdown from "react-markdown"

interface Window {
  webkitSpeechRecognition: any
  SpeechRecognition: any
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface ChatPageProps {
  params: {
    id: string
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
        <div className="flex items-start gap-3 w-full max-w-[98%] sm:gap-3 sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          {/* Скрываем аватарки на мобильных устройствах */}
          {message.message_belong === "assistant" && (
            <Avatar className="mt-1 hidden sm:block">
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <Card
            className={`p-3 w-full overflow-hidden ${
              message.message_belong === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}
          >
            <div className="prose dark:prose-invert max-w-none overflow-x-auto [&_table]:w-full [&_table]:table-auto [&_pre]:overflow-x-auto [&_img]:max-w-full">
              <Markdown content={message.text} theme={theme} onCopy={onCopy} copiedCode={copiedCode} />
            </div>
          </Card>
          {/* Скрываем аватарки на мобильных устройствах */}
          {message.message_belong === "user" && (
            <Avatar className="mt-1 hidden sm:block">
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
    const [isRecording, setIsRecording] = useState(false)
    const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing">("idle")
    const recognitionRef = useRef<any>(null)

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

    const startRecording = useCallback(() => {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        toast({
          title: "Не поддерживается",
          description: "Ваш браузер не поддерживает распознавание речи",
          variant: "destructive",
        })
        return
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.lang = "ru-RU"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          setIsRecording(true)
          setRecordingStatus("recording")
        }

        recognition.onresult = (event: any) => {
          setRecordingStatus("processing")
          const transcript = event.results[0][0].transcript

          // Update the textarea with the transcribed text
          if (textareaRef.current) {
            const currentValue = textareaRef.current.value
            const newValue = currentValue ? `${currentValue} ${transcript}` : transcript

            // Create a synthetic event to update the state
            const syntheticEvent = {
              target: { value: newValue },
            } as React.ChangeEvent<HTMLTextAreaElement>

            onChange(syntheticEvent)
          }
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsRecording(false)
          setRecordingStatus("idle")

          toast({
            title: "Ошибка распознавания",
            description: `Ошибка: ${event.error}`,
            variant: "destructive",
          })
        }

        recognition.onend = () => {
          setIsRecording(false)
          setRecordingStatus("idle")
        }

        recognition.start()
      } catch (error) {
        console.error("Speech recognition error:", error)
        setIsRecording(false)
        setRecordingStatus("idle")

        toast({
          title: "Ошибка",
          description: "Не удалось запустить распознавание речи",
          variant: "destructive",
        })
      }
    }, [onChange])

    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }, [])

    return (
      <form onSubmit={onSubmit} className="sticky bottom-0 bg-background pt-2 w-full max-w-full pb-safe">
        <div className="relative flex items-end gap-2 w-full px-2">
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
              className="min-h-[60px] max-h-[200px] resize-none pr-28 rounded-xl border-gray-300 focus:border-primary w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(e)
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors ${
                  recordingStatus === "recording"
                    ? "bg-red-500 text-white animate-pulse"
                    : recordingStatus === "processing"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
                disabled={isLoading}
                aria-label={isRecording ? "Остановить запись" : "Начать запись голоса"}
              >
                {recordingStatus === "recording" ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                ) : recordingStatus === "processing" ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                )}
              </button>
              <Button type="submit" className="rounded-full w-10 h-10 p-0" disabled={!value.trim() || isLoading}>
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Отправить</span>
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 px-2">
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
  const [scrollUpdateTrigger, setScrollUpdateTrigger] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const [scrollPosition, setScrollPosition] = useState(0);
  const [rootKey, setRootKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      await fetchChats(); 
      setRootKey(prev => prev + 1); 
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log("Setting up scroll listener")
    
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
      console.log("Cleaning up scroll listener")
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

  useEffect( () => {
    setScrollUpdateTrigger(1);
    console.log(scrollUpdateTrigger)
  }, [scrollUpdateTrigger])

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
      await axios.put(
        `https://api-gpt.energy-cerber.ru/chat/${id}?new_name=${newTitle}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setChatHistory((prev: ChatHistory[]) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)),
      )
      setChatTitle(newTitle)

      toast({
        title: "Название обновлено",
        description: "Название чата было успешно изменено",
      })
    } catch (error) {
      console.error("Ошибка при переименовании чата:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить название чата",
        variant: "destructive",
      })
    }
  }

  const ws = useRef<WebSocket | null>(null)
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
      //setIsLoadingHistory(true)
      if (isRequested.current) return
      isRequested.current = true

      if (chatId === "1") return

      try {
        const token = await getToken()
        if (!token) return

        const idChat = localStorage.getItem("lastDeletedChat")
        if (chatId === idChat) {
          return
        }

        const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const history = response.data.messages
        dispatchMessages({ type: "SET", payload: history })
        setChatTitle(response.data.name)
        setIsTestMessageShown(history.length === 0)
        setIsLoadingHistory(false)
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

  const clearChatMessages = useCallback(
    async (id: string) => {
      const token = await getToken()
      try {
        await axios.delete(`https://api-gpt.energy-cerber.ru/chat/${id}/clear`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Обновляем историю чатов
        setChatHistory((prev: ChatHistory[]) =>
          prev.map((chat) =>
            chat.id === id ? { ...chat, messages: 0, preview: "Нет сообщений", date: new Date() } : chat,
          ),
        )

        // Если очищаем текущий чат - сбрасываем сообщения
        if (id === chatId) {
          dispatchMessages({ type: "CLEAR" })
          setIsTestMessageShown(true)
        }

        toast({
          title: "Сообщения очищены",
          description: "Все сообщения в чате были удалены",
        })

        // Принудительно перезагружаем историю чата
        await loadChatHistory(chatId)
      } catch (error) {
        console.error("Error clearing chat messages:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось очистить сообщения",
          variant: "destructive",
        })
      }
    },
    [chatId, getToken, loadChatHistory],
  )

  const initializeWebSocket = useCallback(
    async (chatId: string) => {
      if (chatId === "1") return

      try {
        const token = await getToken()
        if (!token) return

        const provider = localStorage.getItem("selectedProvider")
        const wsUrl = `wss://api-gpt.energy-cerber.ru/chat/ws/${chatId}?token=${token}&provider=${provider}`

        console.log("ChatId", chatId)
        const idChat = localStorage.getItem("lastDeletedChat")
        if (chatId === idChat) {
          return
        }

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

  const deleteChat = useCallback(
    async (id: string) => {
      const token = await getToken()
      router.push(`/chat/${id}`)
      try {
        setIsLoading(true)

        // 1. Удаляем чат на сервере
        await axios.delete(`https://api-gpt.energy-cerber.ru/chat/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        localStorage.setItem("lastDeletedChat", id || "")
        // 2. Обновляем локальное состояние
        const remainingChats = chatHistory.filter((chat) => chat.id !== id)
        setChatHistory(remainingChats)

        // 3. Обновляем localStorage
        const lastSavedChat = localStorage.getItem("lastSavedChat")
        if (lastSavedChat === id) {
          localStorage.setItem("lastSavedChat", remainingChats.length > 0 ? remainingChats[0].id : "1")
        }

        // 4. Если удаляется текущий открытый чат - перенаправляем и закрываем WebSocket
        if (id === chatId) {
          const nextChatId = remainingChats.length > 0 ? remainingChats[0].id : "1"

          // Закрываем WebSocket перед перенаправлением
          if (ws.current) {
            ws.current.close(1000, "Chat deleted")
            ws.current = null
          }

          // Перенаправляем на новый чат
          router.push(`/chat/${nextChatId}`)
        }

        toast({
          title: "Чат удален",
          description: "Чат был успешно удален",
        })

        // 5. Обновляем sidebar
        updateSidebar()
      } catch (error) {
        console.error("Error deleting chat:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось удалить чат",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [chatId, chatHistory, getToken, router, updateSidebar],
  )

  const isRequested1 = useRef(false)

  const fetchChats = useCallback(async () => {
    try {
      const token = await getToken()
      if (!token) return
      if (isRequested1.current) return
      isRequested1.current = true
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

  const shouldShowInput = useMemo(() => {
    return !(messages.length === 1 && messages[0].text === "# Привет! Я ваш AI ассистент.")
  }, [messages])

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
        <MessageItem key={`${message.id}-${scrollPosition}`} message={message} theme={theme} onCopy={handleCopyCode} copiedCode={copiedCode} />
      )),
    [messages, theme, copiedCode, handleCopyCode, scrollPosition],
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
    <div key={`root-${rootKey}`} className="flex flex-col min-h-screen">
      <Toaster />
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span className="hidden sm:inline">AI Chat</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">{chatTitle === "Новый чат" ? "" : chatTitle}</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
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
          renameChatTitle={renameChatTitle}
          clearChatMessages={clearChatMessages}
          deleteChat={deleteChat}
        />

        {chatHistory.length > 0 ? (
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-0 py-6 md:px-6 max-w-5xl lg:max-w-6xl">
              <div className="flex flex-col h-[calc(100vh-7rem)] w-full">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 sm:px-4">
                      {showScrollToBottom && (
                        <button
                          onClick={scrollToBottom}
                          className="fixed right-4 bottom-24 md:right-14 lg:right-24 z-10 p-2 rounded-full bg-background border shadow-lg hover:bg-muted transition-colors"
                          aria-label="Прокрутить вниз"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                      )}
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
                                <Markdown
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
                    {shouldShowInput && (
                      <div className="sticky bottom-0 bg-background border-t">
                        <MessageInput
                          key={`messages-${scrollUpdateTrigger}`}
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
        ) : null}
      </div>
    </div>
  )
}

