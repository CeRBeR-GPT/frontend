"use client"

import React from "react"
import { Copy, Check, Download } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { detectLanguage, downloadCode } from "../lib"
import { useToast } from "@/shared/hooks"
import { cn } from "@/shared/utils"
import { CodeBlockProps } from "../model"

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  children, 
  className, 
  rest, 
  theme, 
  copiedCode, 
  onCopyCode 
}) => {
    
  const { toast } = useToast()
  const match = /language-(?!mermaid)(\w+)/.exec(className || "")
  const codeString = String(children).replace(/\n$/, "")
  const detectedLanguage = detectLanguage(className)

  if (!match) {
    return <code {...rest} className={cn("not-prose", className)}>{children}</code>
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        <button
          onClick={() => onCopyCode(codeString)}
          className="p-1 rounded bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
          title="Копировать код"
        >
          {copiedCode === codeString ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => downloadCode(codeString, detectedLanguage, toast)}
          className="p-1 rounded bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
          title="Скачать код"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute left-2 top-0 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        {detectedLanguage}
      </div>
      <SyntaxHighlighter
        {...rest}
        style={theme === "dark" ? vscDarkPlus : vs}
        language={match[1]}
        customStyle={{
          marginTop: "0",
          marginBottom: "0",
          paddingTop: "2rem",
          borderRadius: "0.375rem",
        }}
        PreTag="div"
      >
        {String(children).trim()}
      </SyntaxHighlighter>
    </div>
  )
}