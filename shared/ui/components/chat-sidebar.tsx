"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Plus, Search, Menu } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet"
import { NewChatDialog } from "@/shared/ui/components/new-chat-dialog"
import { ChatOptionsMenu } from "@/features/chat-manager/ui/chat-options-menu"
import { Loader2 } from "lucide-react"
import { useDeleteChat } from "@/features/delete-chat/model/use-deleteChat"
import { useRenameChat } from "@/features/rename_chat/model/use-renameChat"
import { useChats } from "@/entities/chat/model/use-chats"


interface ChatHistory {
  id: string
  title: string
  preview: string
  date: Date
  messages: number
}

interface ChatSidebarProps {
  chatHistory: ChatHistory[];
}

export function ChatSidebar({ chatHistory}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentChatId = pathname.split("/").pop() || ""
  const { deleteChat} = useDeleteChat()
  const {clearChatMessages} = useChats()
  const {renameChatTitle} = useRenameChat()

  useEffect(() => {
    if (pathname === "/chat") {
      const lastSavedChat = localStorage.getItem("lastSavedChat");
      if (lastSavedChat) {
        router.push(`/chat/${lastSavedChat}`);
      } else {
        router.push("/chat/1");
      }
    }
  }, [pathname, router]);

  const filteredChats = (chatHistory || []).filter(
    (chat) =>
      (chat.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (chat.preview?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  );

  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNewChatDialogOpen(true);
  };

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

      <ScrollArea className="flex-1 pr--1">
        <div className="space-y-2  mr--1">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredChats.length > 0 ? (
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
  );

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
  );

  const desktopSidebar = (
    <div className="hidden md:block w-[260px] border-r h-[calc(100vh-4rem)] overflow-hidden">
      <div className="p-4 h-full">{sidebarContent}</div>
    </div>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
}