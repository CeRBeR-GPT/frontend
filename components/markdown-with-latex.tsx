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

interface CodeBlockProps {
  codeString: string
  language: string
  theme: string | undefined
  onCopy: (code: string) => void
  copiedCode: string | null
}

const CodeBlock: React.FC<CodeBlockProps> = ({ codeString, language, theme, onCopy, copiedCode }) => {
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-80 hover:opacity-100"
          onClick={() => onCopy(codeString)}
        >
          {copiedCode === codeString ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute left-2 top-0 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
        {language}
      </div>
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

const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "swift",
  "kotlin",
  "php",
  "ruby",
  "scala",
  "perl",
  "haskell",
  "r",
  "matlab",
  "sql",
  "html",
  "css",
  "scss",
  "sass",
  "less",
  "json",
  "xml",
  "yaml",
  "markdown",
  "md",
  "bash",
  "shell",
  "powershell",
  "dockerfile",
  "graphql",
  "solidity",
  "dart",
  "elixir",
  "erlang",
  "fortran",
  "groovy",
  "lua",
  "objectivec",
  "pascal",
  "prolog",
  "scheme",
  "vb",
  "vbnet",
  "clojure",
  "coffeescript",
  "fsharp",
  "julia",
  "ocaml",
  "reasonml",
  "svelte",
]

const detectLanguage = (className: string | undefined): string => {
  if (!className) return "text"

  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(`language-${lang}`)) {
      return lang
    }
  }

  const match = /language-(\w+)/.exec(className)
  if (match && match[1]) {
    return match[1]
  }

  return "text"
}

interface MarkdownWithLatexProps {
  content: string
  theme?: string
  onCopy: (code: string) => void
  copiedCode: string | null
}

// Clean LaTeX formula from various formats
const cleanLatexFormula = (formula: string): string => {
  if (!formula) return formula

  // Handle string literal representations of line breaks and escaped characters
  let cleaned = formula
    // Replace literal \n with spaces
    .replace(/\\n/g, " ")
    // Handle array-like strings ['[...]'] or ["[...]"]
    .replace(/^\s*\[['"]?\s*\[/g, "$$")
    .replace(/\]\s*['"]?\]\s*$/g, "$$")
    // Remove extra backslashes from escaped sequences
    .replace(/\\\\([^\\])/g, "\\$1")
    // Remove any remaining line breaks
    .replace(/\n/g, " ")
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim()

  // Ensure proper delimiters
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = "$$" + cleaned.slice(1, -1) + "$$"
  } else if (cleaned.startsWith("\\[") && cleaned.endsWith("\\]")) {
    cleaned = "$$" + cleaned.slice(2, -2) + "$$"
  } else if (cleaned.startsWith("$$") && cleaned.endsWith("$$")) {
    cleaned = "$" + cleaned.slice(2, -2) + "$"
  } else if (!cleaned.startsWith("$")) {
    // If no delimiters, add them
    cleaned = "$" + cleaned + "$"
  }

  return cleaned
}

export const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ content, theme, onCopy, copiedCode }) => {
  // Pre-process content to handle special LaTeX cases
  let processedContent = content

  // Handle array-like LaTeX representations
  const arrayLatexRegex = /\[['"]?\s*\[\\n.*?\\n\s*\]\s*['"]?\]/g
  processedContent = processedContent.replace(arrayLatexRegex, (match) => {
    return cleanLatexFormula(match)
  })

  // Handle other potential LaTeX expressions with line breaks
  const multilineLatexRegex =
    /(\\\[[\s\S]*?\\\])|(\\$$[\s\S]*?\\$$)|(\$\$[\s\S]*?\$\$)|(\$[^\n$]*?(?:\n[^\n$]*?)*?\$)|(\[[\s\S]*?\])/g
  processedContent = processedContent.replace(multilineLatexRegex, (match) => {
    if (match.includes("\\n") || match.includes("\n")) {
      return cleanLatexFormula(match)
    }
    return match
  })

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        p: ({ node, children, ...props }) => {
          // Convert children to string to avoid [object Object]
          const childrenText = React.Children.toArray(children)
            .map((child) => (typeof child === "string" ? child : ""))
            .join("")

          // Process LaTeX in the paragraph text
          const paragraphContent = processLatexInParagraph(childrenText)

          return (
            <p className="mb-2" {...props}>
              {paragraphContent}
            </p>
          )
        },
        code: ({ className, children, inline, ...props }) => {
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

// Process LaTeX in paragraph text
const processLatexInParagraph = (text: string): React.ReactNode => {
  if (!text) return text

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Match both inline ($...$) and block ($$...$$) LaTeX
  const latexRegex = /(\$\$([\s\S]*?)\$\$)|(\$((?!\$)[\s\S]*?)\$)/g
  let match

  while ((match = latexRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Check if it's a block or inline LaTeX
    if (match[1]) {
      // Block LaTeX: $$...$$
      try {
        parts.push(<BlockMath key={`block-${match.index}`}>{match[2]}</BlockMath>)
      } catch (error) {
        console.error("Error rendering BlockMath:", error)
        parts.push(`$$${match[2]}$$`) // Fallback to plain text
      }
    } else if (match[3]) {
      // Inline LaTeX: $...$
      try {
        parts.push(<InlineMath key={`inline-${match.index}`}>{match[4]}</InlineMath>)
      } catch (error) {
        console.error("Error rendering InlineMath:", error)
        parts.push(`$${match[4]}$`) // Fallback to plain text
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  console.log(parts)

  return parts
}






