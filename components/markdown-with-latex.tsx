"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { InlineMath, BlockMath } from "react-katex"
import "katex/dist/katex.min.css"
import type { CSSProperties } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

// Типы для пропсов компонента CodeBlock
interface CodeBlockProps {
  codeString: string
  language: string
  theme: string | undefined
  onCopy: (code: string) => void
  copiedCode: string | null
}

// Компонент для отображения блоков кода с подсветкой синтаксиса
const CodeBlock: React.FC<CodeBlockProps> = ({ 
  codeString, 
  language, 
  theme, 
  onCopy, 
  copiedCode 
}) => {
  return (
    <div className="relative group">
      {/* Кнопка копирования */}
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
          onClick={() => onCopy(codeString)}
        >
          {copiedCode === codeString ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Язык программирования */}
      <div className="absolute left-2 top-0 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        {language}
      </div>
      
      {/* Блок с подсветкой синтаксиса */}
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        customStyle={{
          marginTop: "0",
          marginBottom: "0",
          paddingTop: "2rem",
          borderRadius: "0.375rem",
        }}
        style={theme === "dark" ? vscDarkPlus : (vs as { [key: string]: CSSProperties })}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
}

// Список поддерживаемых языков программирования
const PROGRAMMING_LANGUAGES = [
  "javascript", "typescript", "jsx", "tsx", "python", "java",
  "c", "cpp", "csharp", "go", "rust", "swift", "kotlin",
  "php", "ruby", "scala", "perl", "haskell", "r", "matlab",
  "sql", "html", "css", "scss", "sass", "less", "json",
  "xml", "yaml", "markdown", "md", "bash", "shell",
  "powershell", "dockerfile", "graphql", "solidity", "dart",
  "elixir", "erlang", "fortran", "groovy", "lua", "objectivec",
  "pascal", "prolog", "scheme", "vb", "vbnet", "clojure",
  "coffeescript", "fsharp", "julia", "ocaml", "reasonml", "svelte"
]

// Функция для определения языка программирования
const detectLanguage = (className: string | undefined): string => {
  if (!className) return "text"

  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(`language-${lang}`)) {
      return lang
    }
  }

  const match = /language-(\w+)/.exec(className)
  return match && match[1] ? match[1] : "text"
}

// Пропсы для основного компонента MarkdownWithLatex
interface MarkdownWithLatexProps {
  content: string
  theme?: string
  onCopy: (code: string) => void
  copiedCode: string | null
}

// Интерфейс для пропсов code компонента
interface CodeComponentProps {
  node?: any
  className?: string
  children?: React.ReactNode
  inline?: boolean
  [key: string]: any
}

// Обработка LaTeX в тексте параграфа
const processLatexInParagraph = (text: string): React.ReactNode => {
  if (!text) return text

  // Обработка блоков математики ($$...$$)
  if (text.trim().startsWith("$$") && text.trim().endsWith("$$")) {
    const formula = text.trim().slice(2, -2)
    try {
      return <BlockMath key="block-full">{formula}</BlockMath>
    } catch (error) {
      console.error("Ошибка рендеринга BlockMath:", error)
      return text
    }
  }

  // Регулярка для поиска LaTeX выражений
  const latexRegex = /(\$\$([\s\S]*?)\$\$)|(\$((?!\$)[\s\S]*?)\$)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = latexRegex.exec(text)) !== null) {
    // Текст до формулы
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Обработка блоков ($$...$$)
    if (match[1]) {
      try {
        parts.push(<BlockMath key={`block-${match.index}`}>{match[2]}</BlockMath>)
      } catch (error) {
        console.error("Ошибка рендеринга BlockMath:", error)
        parts.push(`$$${match[2]}$$`)
      }
    } 
    // Обработка inline формул ($...$)
    else if (match[3]) {
      try {
        parts.push(<InlineMath key={`inline-${match.index}`}>{match[4]}</InlineMath>)
      } catch (error) {
        console.error("Ошибка рендеринга InlineMath:", error)
        parts.push(`$${match[4]}$`)
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Остаток текста после формул
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

// Основной компонент для рендеринга Markdown с LaTeX
export const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ 
  content, 
  theme, 
  onCopy, 
  copiedCode 
}) => {
  // Предварительная обработка контента
  let processedContent = content
    .replace(/\[['"]?\s*\[\\n.*?\\n\s*\]\s*['"]?\]/g, (match) => `$${match.slice(1, -1).trim()}$`)
    .replace(/$$\s*(\\[a-zA-Z]+(\{[^}]*\})?)\s*$$/g, (match) => `$${match.slice(1, -1).trim()}$`)
    .replace(
      /(\\\[[\s\S]*?\\\])|(\\$$[\s\S]*?\\$$)|(\$\$[\s\S]*?\$\$)|(\$[^\n$]*?(?:\n[^\n$]*?)*?\$)|(\[[\s\S]*?\])/g, 
      (match) => {
        if (match.includes("\\n") || match.includes("\n")) {
          const formula = match.replace(/^\\\[|\\\]$|^\\$$|\\$$$|\$\$|\$/g, "").trim()
          return match.startsWith("\\[") || match.startsWith("$$") ? `$$${formula}$$` : `$${formula}$`
        }
        return match
      }
    )

  return (
    <ReactMarkdown
      components={{
        // Заголовки
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
        
        // Жирный текст
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        
        // Параграфы с обработкой LaTeX
        p: ({ node, children, ...props }) => {
          const childrenText = React.Children.toArray(children)
            .map((child) => (typeof child === "string" ? child : ""))
            .join("")
          return (
            <p className="mb-2" {...props}>
              {processLatexInParagraph(childrenText)}
            </p>
          )
        },
        
        // Блоки кода
        code: ({ node, className, children, inline, ...props }: CodeComponentProps) => {
          if (inline) {
            return (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                {children}
              </code>
            )
          }
          const codeString = String(children).replace(/\n$/, "")
          const language = detectLanguage(className)
          return (
            <CodeBlock
              codeString={codeString}
              language={language}
              theme={theme}
              onCopy={onCopy}
              copiedCode={copiedCode}
            />
          )
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}