import type React from "react"
import { AuthWrapper } from "@/components/auth-wrapper"
import { ChatsProvider } from "@/hooks/use-chats"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>
    
      <ChatsProvider>
        {children}
      </ChatsProvider>

    </AuthWrapper>
}