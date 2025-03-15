"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, Menu } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NewChatDialog } from "@/components/new-chat-dialog"
import { ChatOptionsMenu } from "@/components/chat-options-menu"
import { toast } from "@/components/ui/use-toast"

// Mock chat history data
interface ChatHistory {
  id: string
  title: string
  preview: string
  date: Date
  messages: number
}

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentChatId = pathname.split("/").pop() || ""

  // Simulate loading chat history
  useEffect(() => {
    // In a real app, this would be an API call
    const mockChatHistory: ChatHistory[] = [
      {
        id: "chat1",
        title: "Разработка веб-приложения",
        preview: "Как создать современное веб-приложение с использованием React и Next.js?",
        date: new Date(2023, 10, 15, 14, 30),
        messages: 12,
      },
      {
        id: "chat2",
        title: "Искусственный интеллект",
        preview: "Расскажи о последних достижениях в области искусственного интеллекта",
        date: new Date(2023, 10, 14, 9, 45),
        messages: 8,
      },
      {
        id: "chat3",
        title: "Рецепт пасты карбонара",
        preview: "Как приготовить настоящую итальянскую пасту карбонара?",
        date: new Date(2023, 10, 12, 18, 20),
        messages: 5,
      },
      {
        id: "chat4",
        title: "Изучение JavaScript",
        preview: "Какие ресурсы лучше всего подходят для изучения JavaScript с нуля?",
        date: new Date(2023, 10, 10, 11, 15),
        messages: 15,
      },
      {
        id: "chat5",
        title: "Путешествие в Японию",
        preview: "Что стоит посетить в Японии во время двухнедельного путешествия?",
        date: new Date(2023, 10, 8, 16, 40),
        messages: 10,
      },
    ]
    setChatHistory(mockChatHistory)
  }, [])

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const deleteChat = (id: string) => {
    // В реальном приложении здесь был бы запрос к API для удаления чата
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))

    // Если удаляемый чат - текущий, перенаправляем на страницу нового чата
    if (currentChatId === id) {
      router.push("/chat/new")
    }

    toast({
      title: "Чат удален",
      description: "Чат был успешно удален",
    })
  }

  const clearChatMessages = (id: string) => {
    // В реальном приложении здесь был бы запрос к API для очистки сообщений
    // Для демонстрации просто показываем уведомление
    toast({
      title: "Сообщения очищены",
      description: "Все сообщения в чате были удалены",
    })

    // Если это текущий чат, можно обновить страницу или состояние
    if (currentChatId === id) {
      // В реальном приложении здесь можно было бы обновить состояние сообщений
    }
  }

  const renameChatTitle = (id: string, newTitle: string) => {
    // В реальном приложении здесь был бы запрос к API для обновления названия
    setChatHistory((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)))

    toast({
      title: "Название обновлено",
      description: "Название чата было успешно изменено",
    })
  }

  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsNewChatDialogOpen(true)
  }

  const sidebarContent = (
    <div className="flex flex-col gap-4 h-full">
      <Button className="w-full gap-2" onClick={handleNewChatClick}>
        <Plus className="w-4 h-4" />
        Новый чат
      </Button>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Поиск чатов..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="pr-3 space-y-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Link href={`/chat/${chat.id}`} key={chat.id} onClick={() => setIsOpen(false)}>
                <Card
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${currentChatId === chat.id ? "bg-muted" : ""}`}
                >
                  <CardContent className="p-3 flex justify-between items-start">
                    <div className="space-y-1 flex-1 mr-2">
                      <h3 className="font-medium text-sm line-clamp-1">{chat.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{chat.preview}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(chat.date, { addSuffix: true, locale: ru })}</span>
                        <span>•</span>
                        <span>{chat.messages} сообщ.</span>
                      </div>
                    </div>
                    <ChatOptionsMenu
                      chatId={chat.id}
                      chatTitle={chat.title}
                      onDelete={deleteChat}
                      onClear={clearChatMessages}
                      onRename={renameChatTitle}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Чаты не найдены</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>История чатов пуста</p>
              <p className="text-sm">Начните новый чат, чтобы задать вопрос</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <NewChatDialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen} />
    </div>
  )

  // Mobile sidebar (sheet)
  const mobileSidebar = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-4">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  )

  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden md:block w-[260px] border-r h-[calc(100vh-4rem)] overflow-hidden">
      <div className="p-4 h-full">{sidebarContent}</div>
    </div>
  )

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  )
}


