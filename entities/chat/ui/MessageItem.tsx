import React from 'react';

import { Bot, Clipboard, User } from 'lucide-react';

import { useCopyMessage } from '@/features/copy-message/model';
import { Markdown } from '@/features/markdown-renderer/ui';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Card } from '@/shared/ui/card';

import { Message } from '../model';

const MessageItem = React.memo(({ message }: { message: Message }) => {
  const { handleCopyTextMarkdown } = useCopyMessage();
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      handleCopyTextMarkdown(message.text);
    } catch (err) {}
  };

  return (
    <div
      className={`flex ${
        message.message_belong === 'user' ? 'justify-end' : 'justify-start'
      } duration-300 animate-in fade-in-0 slide-in-from-bottom-3`}
    >
      <div className="flex w-full max-w-[98%] items-start gap-3 sm:max-w-[95%] sm:gap-3 md:max-w-[90%] lg:max-w-[85%]">
        {message.message_belong === 'assistant' && (
          <Avatar className="mt-1 hidden sm:block">
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        <Card
          className={`w-full overflow-hidden p-3 ${
            message.message_belong === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <div className="prose dark:prose-invert max-w-none overflow-x-auto [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:w-full [&_table]:table-auto">
            <Markdown message_belong={message.message_belong} content={message.text} />
          </div>
          {message.message_belong === 'assistant' && (
            <button onClick={copyToClipboard} className="hover:text-gray-700">
              <Clipboard className="inline-block h-4 w-4" />
              Скопировать
            </button>
          )}
        </Card>
        {message.message_belong === 'user' && (
          <Avatar className="mt-1 hidden sm:block">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
});

export default MessageItem;
