
export interface MarkdownWithLatexProps {
  content: string
  message_belong?: "user" | "assistant"
}

export interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  rest: any
  theme?: string
  copiedCode?: string | null
  onCopyCode: (code: string) => void
}

export type ToastFn = (props: {
  title: string
  description: string
  variant?: "default" | "destructive"
}) => {
  id: string
  dismiss: () => void
  update: (props: any) => void
}