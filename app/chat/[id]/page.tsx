'use client';

import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import 'katex/dist/katex.min.css';
import { ArrowDown, Bot } from 'lucide-react';

import { useChats } from '@/entities/chat/hooks';
import MessageInput from '@/entities/chat/components/MessageInput';
import MessageItem from '@/entities/chat/components/MessageItem';
import { useMessage } from '@/entities/message/hooks';
import { useChatInitialization } from '@/features/chat-init/hooks';
import { ChatSidebar } from '@/features/chat-manager/components';
import { Markdown } from '@/features/markdown-renderer/components';
import { useAuth, useMessageContext, useUser } from '@/shared/contexts';
import { useAutoScroll, useLockBodyScroll, useScrollVisibility } from '@/shared/hooks';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Card } from '@/shared/ui/card';
import { Toaster } from '@/shared/components/ui/toaster';
import { scrollToBottom } from '@/shared/utils';
import { getToken } from '@/shared/utils';

MessageItem.displayName = 'MessageItem';
MessageInput.displayName = 'MessageInput';

export default function ChatPage() {
  const token = getToken();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token]);

  const { messages, shouldShowInput, isTestMessageShown } = useMessageContext();
  const { messagesContainerRef } = useMessage();
  const { chatHistory } = useUser();
  const {
    chatId,
    isValidChat,
    sidebarVersion,
    ws,
    isLoadingHistory,
    isLoading,
    setIsLoading,
    initializeChatsData,
  } = useChats();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  useLockBodyScroll();

  const { showButton: showScrollToBottom } = useScrollVisibility(
    messagesContainerRef,
    [messages.length],
    { showOffset: 50, throttleDelay: 100 }
  );

  useAutoScroll(messagesContainerRef, [messages, isLoadingHistory], { delay: 100, smooth: true });
  useAutoScroll(messagesContainerRef, [isLoadingHistory, messages.length], {
    delay: 150,
    smooth: true,
    onlyIfNotLoading: false,
  });
  useAutoScroll(messagesContainerRef, [chatId, isAuthenticated], { delay: 200, smooth: false });

  useEffect(() => {
    initializeChatsData();
  }, [chatId, isAuthenticated, isAuthLoading, router]);

  const { isCheckingChat, renderedMessages, handleSubmit, input, handleInputChange } =
    useChatInitialization({
      isLoading,
      setIsLoading,
      ws,
    });

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar key={`sidebar-${sidebarVersion}`} chatHistory={chatHistory} />
        {isCheckingChat ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : !isValidChat ? (
          <div className="flex flex-1 items-center justify-center">
            <Card className="bg-muted p-3">
              <div className="prose dark:prose-invert max-w-none">
                <Markdown content="# Привет! Я ваш AI ассистент. Выберите чат или создайте новый!" />
              </div>
            </Card>
          </div>
        ) : (
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto max-w-5xl px-0 py-6 md:px-6 lg:max-w-6xl">
              <div className="flex h-[calc(100vh-7rem)] w-full flex-col">
                {isLoadingHistory ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div
                      ref={messagesContainerRef}
                      className="mb-4 flex-1 space-y-4 overflow-y-auto px-2 sm:px-4"
                    >
                      {showScrollToBottom && (
                        <button
                          onClick={() => scrollToBottom(messagesContainerRef)}
                          className="fixed bottom-24 right-4 z-10 rounded-full border bg-background p-2 shadow-lg transition-colors hover:bg-muted md:right-14 lg:right-24"
                          aria-label="Прокрутить вниз"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                      )}

                      {isTestMessageShown && messages.length === 0 && (
                        <div className="flex justify-start duration-300 animate-in fade-in-0 slide-in-from-bottom-3">
                          <div className="flex max-w-[80%] items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarFallback>
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <Card className="bg-muted p-3">
                              <div className="prose dark:prose-invert max-w-none">
                                <Markdown content="# Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?" />
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}

                      {renderedMessages}

                      {isLoading && (
                        <div className="flex justify-start duration-300 animate-in fade-in-0 slide-in-from-bottom-3">
                          <div className="flex max-w-[80%] items-start gap-3">
                            <Avatar className="mt-1">
                              <AvatarFallback>
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <Card className="bg-muted p-3">
                              <div className="flex space-x-2">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.4s]" />
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>

                    {shouldShowInput && (
                      <div className="sticky bottom-0 border-t bg-background">
                        <MessageInput
                          value={input}
                          onSubmit={handleSubmit}
                          onChange={handleInputChange}
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
  );
}
