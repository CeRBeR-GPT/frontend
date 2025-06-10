"use client"
import React, { useEffect } from "react"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Card } from "@/shared/ui/card"
import { Bot, ArrowDown } from "lucide-react"
import { ChatSidebar } from "@/features/chat-manager/ui"
import { Toaster } from "@/shared/ui/toaster"
import "katex/dist/katex.min.css"
import  {Markdown} from "@/features/markdown-renderer/ui"
import MessageItem from "@/entities/chat/ui/MessageItem"
import { useChats } from "@/entities/chat/model"
import { scrollToBottom } from "@/shared/utils"
import { useLockBodyScroll, useScrollVisibility, useAutoScroll } from "@/shared/hooks"
import { useChatInitialization } from "@/features/chat-init/model"
import { useAuth, useMessageContext, useUser } from "@/shared/contexts"
import { useRouter } from "next/navigation"
import { getToken } from "@/shared/utils"
import { useMessage } from "@/entities/message/model"
import MessageInput from "@/entities/chat/ui/MessageInput"

MessageItem.displayName = "MessageItem"
MessageInput.displayName = "MessageInput"

export default function ChatPage() {
  const token = getToken();
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/auth/login")
    }
  }, [token])
  
  const { messages, shouldShowInput, isTestMessageShown } = useMessageContext();
  const { messagesContainerRef } = useMessage()
  const { chatHistory } = useUser()
  const { chatId,isValidChat,sidebarVersion,ws,isLoadingHistory,isLoading,setIsLoading, initializeChatsData } = useChats()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  useLockBodyScroll();

  const { showButton: showScrollToBottom } = useScrollVisibility( messagesContainerRef, [messages.length],
    { showOffset: 50,throttleDelay: 100 } );

  useAutoScroll(messagesContainerRef, [messages, isLoadingHistory], { delay: 100, smooth: true });
  useAutoScroll(messagesContainerRef, [isLoadingHistory, messages.length], { delay: 150, smooth: true, 
    onlyIfNotLoading: false });
  useAutoScroll(messagesContainerRef, [chatId, isAuthenticated], { delay: 200, smooth: false });

  useEffect(() => {
      initializeChatsData()
  }, [chatId, isAuthenticated, isAuthLoading, router])

  const { isCheckingChat, renderedMessages, handleSubmit, input, handleInputChange } = useChatInitialization({
    isLoading, setIsLoading, ws });

  if (isAuthLoading || !isAuthenticated) { return null }

  return (
    <div  className="flex flex-col min-h-screen">
  <Toaster />
  <div className="flex flex-1 overflow-hidden">
    <ChatSidebar key={`sidebar-${sidebarVersion}`} chatHistory={chatHistory}/>
    {isCheckingChat ? (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ) : !isValidChat ? (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-3 bg-muted">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown content="# Привет! Я ваш AI ассистент. Выберите чат или создайте новый!"/>
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
                            <Markdown content="# Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?"/>
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
                    <MessageInput value = {input} onSubmit={handleSubmit} onChange = {handleInputChange}/>
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