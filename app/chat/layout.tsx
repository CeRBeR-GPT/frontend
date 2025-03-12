import type React from "react"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>
}