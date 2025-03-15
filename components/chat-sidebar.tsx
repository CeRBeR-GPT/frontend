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
import axios from "axios"

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

  const getToken = () => localStorage.getItem('access_token')
  const token = getToken()

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const chats = response.data

        const formattedChats = chats.map((chat: any) => {
          const date = new Date(chat.created_at)
          date.setHours(date.getHours() + 3)

          return {
            id: chat.id,
            title: chat.name,
            preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Нет сообщений",
            date: date,
            messages: chat.messages.length,
          }
        })

        const sortedChats = formattedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        if (sortedChats.length > 0) {
          const lastChat = sortedChats[0].id
          localStorage.setItem("lastSavedChat", JSON.stringify(lastChat))
        }

        setChatHistory(sortedChats)
      } catch (error) {
        console.error("Error fetching chats:", error)
      }
    }

    fetchChats()
  }, [token])

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const deleteChat = async (id: string) => {
    try {
      await axios.delete(`https://api-gpt.energy-cerber.ru/chat/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setChatHistory((prev) => prev.filter((chat) => chat.id !== id))

      if (currentChatId === id) {
        router.push("/chat/new")
      }

      toast({
        title: "Чат удален",
        description: "Чат был успешно удален",
      })
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить чат",
        variant: "destructive",
      })
    }
  }

  const clearChatMessages = async (id: string) => {
    try {
      await axios.post(`https://api-gpt.energy-cerber.ru/chat/${id}/clear`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === id ? { ...chat, messages: 0, preview: "Нет сообщений" } : chat
        )
      )

      toast({
        title: "Сообщения очищены",
        description: "Все сообщения в чате были удалены",
      })
    } catch (error) {
      console.error("Error clearing chat messages:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось очистить сообщения",
        variant: "destructive",
      })
    }
  }

  const renameChatTitle = async (id: string, newTitle: string) => {
    console.log("Функция renameChatTitle вызвана с id:", id, "и newTitle:", newTitle)
    try {
      const response = await axios.put(
        `https://api-gpt.energy-cerber.ru/chat/${id}?new_name=${newTitle}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log("Ответ сервера:", response.data)
  
      setChatHistory((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
      )
  
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


