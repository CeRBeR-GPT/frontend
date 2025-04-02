"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Loader2 } from "lucide-react"

interface ChatHistory {
  id: string
  title: string
  preview: string
  date: Date
  messages: number
}

interface ChatSidebarProps {
  chatHistory: ChatHistory[];
  setChatHistory: (value: ChatHistory[] | ((prev: ChatHistory[]) => ChatHistory[])) => void;
  onChatDeleted?: (nextChatId: string | null) => void;
  onClearChat?: (id: string) => void;
  renameChatTitle: (id: string, newTitle: string) => void;
  clearChatMessages: (id: string) => void
  deleteChat: (id: string) => void;
}

export function ChatSidebar({ chatHistory, setChatHistory, onChatDeleted, onClearChat, renameChatTitle, clearChatMessages, deleteChat }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentChatId = pathname.split("/").pop() || ""
  const getToken = () => localStorage.getItem('access_token')
  const token = getToken()

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

  // const deleteChat = async (id: string) => {
  //   try {
  //     await axios.delete(`https://api-gpt.energy-cerber.ru/chat/${id}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const remainingChats = chatHistory.filter(chat => chat.id !== id);
  //     setChatHistory(remainingChats);

  //     const lastSavedChat = localStorage.getItem("lastSavedChat");
  //     if (lastSavedChat === id) {
  //       if (remainingChats.length > 0) {
  //         localStorage.setItem("lastSavedChat", remainingChats[0].id);
  //       } else {
  //         //localStorage.removeItem("lastSavedChat");
  //       }
  //     }

  //     let nextChatId: string | null = null;
  //     if (remainingChats.length > 0) {
  //       nextChatId = remainingChats[0].id;
  //     }

  //     if (onChatDeleted) {
  //       onChatDeleted(nextChatId);
  //     }

  //     //window.location.href = `${nextChatId || 1}`

  //     if (chatHistory.length === 1) {
  //       localStorage.setItem("lastSavedChat", "1");
  //        router.push("/chat/1");
  //     }

  //     toast({
  //       title: "Чат удален",
  //       description: "Чат был успешно удален",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting chat:", error);
  //     toast({
  //       title: "Ошибка",
  //       description: "Не удалось удалить чат",
  //       variant: "destructive",
  //     });
  //   }
  // };
  
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

      <ScrollArea className="flex-1">
        <div className="pr-3 space-y-2">
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