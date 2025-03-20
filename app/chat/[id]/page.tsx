'use client'

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Bot, User, ArrowLeft, Copy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { ChatSidebar } from "@/components/chat-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { NavLinks } from "@/components/nav-links";
import { ChatOptionsMenu } from "@/components/chat-options-menu";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import hljs from "highlight.js"; // Импортируем highlight.js
import "highlight.js/styles/github.css"; // Светлая тема

interface Message {
  id: number;
  text: string;
  message_belong: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatTitle, setChatTitle] = useState("");

  const ws = useRef<WebSocket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Получение токена из localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  };

  const token = getToken();

  // Загрузка истории чата
  const loadChatHistory = async (chatId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(
        `https://api-gpt.energy-cerber.ru/chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const history = response.data.messages;
      setMessages(history);
      setChatTitle(response.data.name);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast({
        title: "Ошибка загрузки истории",
        description: "Не удалось загрузить историю сообщений.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Инициализация WebSocket
  const initializeWebSocket = (chatId: string) => {
    const wsUrl = `wss://api-gpt.energy-cerber.ru/chat/ws/${chatId}?token=${token}`;
    console.log("WebSocket URL:", wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.current.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      const newMessage: Message = {
        id: messages.length + 1,
        text: event.data,
        message_belong: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Ошибка WebSocket",
        description: "Не удалось подключиться к серверу.",
        variant: "destructive",
      });
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      if (event.code !== 1000) {
        toast({
          title: "Соединение закрыто",
          description: "Попытка переподключения...",
          variant: "destructive",
        });
        setTimeout(() => initializeWebSocket(chatId), 5000);
      }
    };
  };

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Инициализация чата при загрузке
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (chatId === "new") {
      setMessages([
        {
          id: 1,
          text: "Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?",
          message_belong: "assistant",
          timestamp: new Date(),
        },
      ]);
      setChatTitle("Новый чат");
      return;
    }

    const fetchData = async () => {
      await loadChatHistory(chatId);
      initializeWebSocket(chatId);
    };

    fetchData();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chatId, isAuthenticated, router]);

  // Отправка сообщения
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      message_belong: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    if (ws.current) {
      ws.current.send(input);
    }
  };

  // Удаление чата
  const handleDeleteChat = (id: string) => {
    toast({
      title: "Чат удален",
      description: "Чат был успешно удален",
    });
    router.push("/chat/new");
  };

  // Очистка сообщений в чате
  const handleClearChat = (id: string) => {
    setMessages([
      {
        id: 1,
        text: "Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?",
        message_belong: "assistant",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Сообщения очищены",
      description: "Все сообщения в чате были удалены",
    });
  };

  // Переименование чата
  const handleRenameChat = (id: string, newTitle: string) => {
    setChatTitle(newTitle);
    toast({
      title: "Название обновлено",
      description: "Название чата было успешно изменено",
    });
  };

  // Копирование кода
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Код скопирован",
      description: "Код был успешно скопирован в буфер обмена.",
    });
  };

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/chat/chat1" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>AI Chat</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">{chatTitle}</span>
              {chatId !== "new" && (
                <ChatOptionsMenu
                  chatId={chatId}
                  chatTitle={chatTitle}
                  onDelete={handleDeleteChat}
                  onClear={handleClearChat}
                  onRename={handleRenameChat}
                />
              )}
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="md:hidden">
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
        <ChatSidebar/>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 max-w-4xl">
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto mb-4 space-y-4 p-4"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.message_belong === "user" ? "justify-end" : "justify-start"
                        } animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
                      >
                        <div className="flex items-start gap-3 max-w-[80%]">
                          {message.message_belong === "assistant" && (
                            <Avatar className="mt-1">
                              <AvatarFallback>
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <Card
                            className={`p-3 ${
                              message.message_belong === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <ReactMarkdown
                              components={{
                                code({ node, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : 'plaintext';
                                  const highlightedCode = hljs.highlightAuto(String(children), [language]).value;

                                  return match ? (
                                    <div className="relative">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-2 top-2 h-8 w-8"
                                        onClick={() => handleCopyCode(String(children))}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                        <code
                                          className={`hljs language-${language}`}
                                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                        />
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
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
                    ))}
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
                  <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background pt-2">
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        placeholder="Напишите ваш запрос..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-[60px] resize-none pr-14 rounded-xl border-gray-300 focus:border-primary overflow-hidden"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        rows={1}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-2 bottom-2 rounded-full"
                        disabled={!input.trim() || isLoading}
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span className="sr-only">Отправить</span>
                      </Button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      AI может допускать ошибки. Проверяйте важную информацию.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}