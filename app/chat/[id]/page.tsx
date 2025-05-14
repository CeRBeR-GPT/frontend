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
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import "katex/dist/katex.min.css"
import  Markdown from "@/components/markdown-with-latex"
import { throttle } from "lodash-es"
import MessageItem from "@/components/MessageItem"
import MessageInput from "@/components/MessageInput"
import { clearChatApi, deleteChatApi } from "@/api/api"
import { useAuth } from "@/features/auth/model/use-auth"
import { useUserData } from "@/entities/user/model/use-user"
import { useChats } from "@/entities/chat/model/use-chats"

import { useRenameChat } from "@/features/rename_chat/model/use-clearChat"
import { useDeleteChat } from "@/features/delete-chat/model/use-deleteChat"
import { useChangeProvider } from "@/features/change-provider/model/use-changeProvider"
import { useCopyMessage } from "@/features/copy-message/model/use-copyMessage"
import { useMessage } from "@/entities/message/model/use-message"
import { scrollToBottom } from "@/shared/utils/scrollToButton"
import { useClearChat } from "@/features/clear-chat/model/use-clearChat"

interface Message {
  id: number
  text: string
  message_belong: "user" | "assistant"
  timestamp: Date
}

MessageItem.displayName = "MessageItem"
MessageInput.displayName = "MessageInput"

export default function ChatPage() {
  const { chatId, updateChatHistory, setChatHistory, chatHistory, checkChatValidity, isValidChat,
    isCheckingChat, updateSidebar, sidebarVersion, chatTitle, setChatTitle, fetchChats, ws, initializeWebSocket,
    shouldShowInput, isLoadingHistory, loadChatHistory, isLoading, setIsLoading} = useChats()
  const { clearChatMessages } = useClearChat()

  const { messages, dispatchMessages, messagesContainerRef, input, setInput, handleInputChange, renderedMessages,
    isTestMessageShown, setIsTestMessageShown
  } = useMessage()
  const { renameChatTitle } = useRenameChat()
  const { deleteChat } = useDeleteChat()
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { getToken } = useUserData()

  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false)

  const { handleProviderChange, selectedProvider, availableProviders } = useChangeProvider()
  const { handleCopyCode, handleCopyTextMarkdown, copiedCode } = useCopyMessage()

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

  useEffect(() => {
    if (!messagesContainerRef.current || isLoadingHistory) return

    const timer = setTimeout(() => scrollToBottom(messagesContainerRef), 100)
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
    checkChatValidity();
  }, [chatHistory, chatId]);


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
    if (!messagesContainerRef.current || isLoadingHistory) return

    const timer = setTimeout( ()=>scrollToBottom(messagesContainerRef), 100)
    return () => clearTimeout(timer)

  }, [messages, isLoadingHistory])

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const initializeChat = async () => {
      dispatchMessages({ type: "CLEAR" })
      setChatTitle("Новый чат")
      
      const history = await loadChatHistory(chatId)
      if (history) {
        dispatchMessages({ type: "SET", payload: history.messages })
        setChatTitle(history.title)
        setIsTestMessageShown(history.isEmpty)
      }
      
      await initializeWebSocket(chatId)
      await fetchChats()
    }

    initializeChat()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [chatId, isAuthenticated, isAuthLoading])

  if (isAuthLoading || !isAuthenticated) { return null }

  return (
    <div  className="flex flex-col min-h-screen">
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
                      onClick={() => scrollToBottom(messagesContainerRef)}
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