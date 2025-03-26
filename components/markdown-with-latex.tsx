"use client"

import { Copy, Check } from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import "katex/dist/katex.min.css"

// Простой словарь языков программирования
const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c', 'php',
  'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'bash', 'sh', 'shell',
  'powershell', 'sql', 'html', 'css', 'scss', 'less', 'json', 'yaml', 'xml',
  'markdown', 'dockerfile', 'plaintext', 'text'
]

// Функция для определения языка
function detectLanguage(className?: string): string {
  if (!className) return 'text'
  
  // Ищем точное совпадение с одним из языков
  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(lang)) {
      return lang
    }
  }
  
  // Пытаемся извлечь язык из класса (старая логика)
  const match = /language-(\w+)/.exec(className)
  return match?.[1] || 'text'
}

interface MarkdownWithLatexProps {
  content: string
  theme?: string
  onCopy: (code: string) => void
  copiedCode: string | null
}

interface CodeComponentProps {
  node?: any
  className?: string
  children?: React.ReactNode
  inline?: boolean
  [key: string]: any
}

export const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ 
  content, 
  theme, 
  onCopy, 
  copiedCode 
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Заголовки
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
        
        // Жирный текст
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        
        // Параграфы
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        
        // Блоки кода
        code({ node, inline, className, children, ...props }: CodeComponentProps) {
          const codeString = String(children).replace(/\n$/, '')
          const detectedLanguage = detectLanguage(className)
          
          if (inline) {
            return (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                {children}
              </code>
            )
          }

          return (
            <div className="relative group">
              <div className="absolute right-2 top-2 z-10">
                <button
                  onClick={() => onCopy(codeString)}
                  className="p-1 rounded bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
                >
                  {copiedCode === codeString ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="absolute left-2 top-0 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                {detectedLanguage}
              </div>
              
              <SyntaxHighlighter
                language={detectedLanguage}
                PreTag="div"
                customStyle={{
                  marginTop: "0",
                  marginBottom: "0",
                  paddingTop: "2rem",
                  borderRadius: "0.375rem",
                }}
                {...props}
                style={theme === "dark" ? vscDarkPlus : vs}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          )
        },
        
        // Таблицы (поддержка через remark-gfm)
        table({ node, ...props }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          )
        },
        
        // Списки
        ul({ node, ...props }) {
          return <ul className="list-disc pl-5 mb-2" {...props} />
        },
        
        ol({ node, ...props }) {
          return <ol className="list-decimal pl-5 mb-2" {...props} />
        },
        
        // Блоки цитирования
        blockquote({ node, ...props }) {
          return (
            <blockquote 
              className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-300 mb-2" 
              {...props} 
            />
          )
        },
      }}
    >
      {content.replaceAll("\\[", "$").replaceAll("\\]", "$").replaceAll("\\(", "$").replaceAll("\\)", "$")} 
    </ReactMarkdown>
  )
}