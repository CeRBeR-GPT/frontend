'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Menu, Plus, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

import { useChats } from '@/entities/chat/hooks';
import { useDeleteChat } from '@/features/delete-chat/hooks';
import { useRenameChat } from '@/features/rename_chat/model';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { ChatOptionsMenu, NewChatDialog } from '.';

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messages: number;
}

interface ChatSidebarProps {
  chatHistory: ChatHistory[];
}

export function ChatSidebar({ chatHistory }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentChatId = pathname.split('/').pop() || '';
  const { deleteChat } = useDeleteChat();
  const { clearChatMessages } = useChats();
  const { renameChatTitle } = useRenameChat();

  useEffect(() => {
    if (pathname === '/chat') {
      const lastSavedChat = localStorage.getItem('lastSavedChat');
      if (lastSavedChat) {
        router.push(`/chat/${lastSavedChat}`);
      } else {
        router.push('/chat/1');
      }
    }
  }, [pathname, router]);

  const filteredChats = (chatHistory || []).filter(
    (chat) =>
      (chat.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (chat.preview?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNewChatDialogOpen(true);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-4">
      <Button className="w-full gap-2" onClick={handleNewChatClick}>
        <Plus className="h-4 w-4" />
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

      <ScrollArea className="pr--1 flex-1">
        <div className="mr--1 space-y-2">
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Link href={`/chat/${chat.id}`} key={chat.id} onClick={() => setIsOpen(false)}>
                <Card
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${currentChatId === chat.id ? 'bg-muted' : ''}`}
                >
                  <CardContent className="flex items-start justify-between p-3">
                    <div className="mr-2 flex-1 space-y-1">
                      <h3 className="line-clamp-1 text-sm font-medium">{chat.title}</h3>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{chat.preview}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(chat.date, { addSuffix: true, locale: ru })}
                        </span>
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
            <div className="py-8 text-center text-muted-foreground">
              <p>Чаты не найдены</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
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
      <SheetContent side="left" className="w-[280px] p-4 sm:w-[320px]">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );

  const desktopSidebar = (
    <div className="hidden h-[calc(100vh-4rem)] w-[260px] overflow-hidden border-r md:block">
      <div className="h-full p-4">{sidebarContent}</div>
    </div>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
}
