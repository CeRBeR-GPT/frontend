import React from "react"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Bot, User, Clipboard } from "lucide-react"
import { Card } from "@/shared/ui/card"
import  {Markdown} from "@/features/markdown-renderer/ui/markdown-with-latex"
import { Message } from "../model/types"

const MessageItem = React.memo( ({ message, handleCopyTextMarkdown }: {
    message: Message
    handleCopyTextMarkdown: (text: string) => void
  }) => {

    const copyToClipboard = async () => {
      try {
          await navigator.clipboard.writeText(message.text);
          handleCopyTextMarkdown(message.text);
      } catch (err) {}
    };

    return (
      <div
        className={`flex ${
          message.message_belong === "user" ? "justify-end" : "justify-start"
        } animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
      >
        <div className="flex items-start gap-3 w-full max-w-[98%] sm:gap-3 sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          {message.message_belong === "assistant" && (
            <Avatar className="mt-1 hidden sm:block">
              <AvatarFallback>
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <Card
            className={`p-3 w-full overflow-hidden ${
              message.message_belong === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}
          >
            <div className="prose dark:prose-invert max-w-none overflow-x-auto [&_table]:w-full [&_table]:table-auto [&_pre]:overflow-x-auto [&_img]:max-w-full">
              <Markdown message_belong = {message.message_belong} content={message.text}/>
            </div>
            {message.message_belong === "assistant" && (
              <button onClick={copyToClipboard} className="hover:text-gray-700">
                <Clipboard className="w-4 h-4 inline-block" />
                Скопировать
              </button>
            )}

          </Card>
          {message.message_belong === "user" && (
            <Avatar className="mt-1 hidden sm:block">
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    )
  },
)

export default MessageItem