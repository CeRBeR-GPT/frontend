"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Bot, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { ChatSidebar } from "@/components/chat-sidebar"

interface Message {
  id: number
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function NewChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Привет! Я ваш AI ассистент. Чем я могу вам помочь сегодня?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const chatTitle = "Новый чат"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        content: "Это демонстрационный ответ от AI. В реальном приложении здесь будет ответ от модели GPT.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)

      // In a real app, we would save the chat and redirect to the saved chat
      // For demo, we'll just stay on the page
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>AI Chat</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">{chatTitle}</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium underline underline-offset-4">
              Chat
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:underline underline-offset-4">
              Profile
            </Link>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:px-6 max-w-4xl">
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
                  >
                    <div className="flex items-start gap-3 max-w-[80%]">
                      {message.role === "assistant" && (
                        <Avatar className="mt-1">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Card
                        className={`p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </Card>
                      {message.role === "user" && (
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
                    placeholder="Напишите ваш запрос..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[60px] resize-none pr-14 rounded-xl border-gray-300 focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}