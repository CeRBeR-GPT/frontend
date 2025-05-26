import React from "react"
import { Avatar, AvatarFallback } from "@/components/UI/avatar"
import { Bot, User, Clipboard } from "lucide-react"
import { Card } from "@/components/UI/card"
import  Markdown from "@/components/markdown-with-latex"

interface Message {
    id: number
    text: string
    message_belong: "user" | "assistant"
    timestamp: Date
}

const MessageItem = React.memo( ({ message, theme, onCopy, copiedCode, handleCopyTextMarkdown }: {
    message: Message
    theme: string | undefined
    onCopy: (code: string) => void
    copiedCode: string | null
    handleCopyTextMarkdown: (text: string) => void
  }) => {
    console.log("Messages", message.message_belong)

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
              <Markdown handleCopyTextMarkdown = {handleCopyTextMarkdown} message_belong = {message.message_belong} content={message.text} theme={theme} onCopy={onCopy} copiedCode={copiedCode} />
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