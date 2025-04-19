"use client"

import type React from "react"
import { useRef } from "react"
import { Copy, Check, Download, Clipboard } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkMath from "../lib/remarkMath"
import remarkGfm from "remark-gfm"
import remarkMermaid from "../lib/remarkMermoid"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Prism, type SyntaxHighlighterProps } from "react-syntax-highlighter"
import "katex/dist/katex.min.css"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const SyntaxHighlighter = Prism as unknown as typeof React.Component<SyntaxHighlighterProps>

const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "scala",
  "r",
  "bash",
  "sh",
  "shell",
  "powershell",
  "sql",
  "html",
  "css",
  "scss",
  "less",
  "json",
  "yaml",
  "xml",
  "markdown",
  "dockerfile",
  "plaintext",
  "text",
]

function detectLanguage(className?: string): string {
  if (!className) return "text"

  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(lang)) {
      return lang
    }
  }

  const match = /language-(\w+)/.exec(className)
  return match?.[1] || "text"
}

interface MarkdownWithLatexProps {
  content: string
  theme?: string
  onCopy: (code: string) => void
  copiedCode: string | null
  message_belong?: "user" | "assistant"
  handleCopyTextMarkdown: (text: string) => void
}

const Markdown: React.FC<MarkdownWithLatexProps> = ({
  content,
  theme,
  onCopy,
  copiedCode,
  message_belong,
  handleCopyTextMarkdown,
}) => {
  const markdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const copyRenderedText = async () => {
    if (markdownRef.current) {
      const renderedText = markdownRef.current.innerText || markdownRef.current.textContent || ""
      try {
        await navigator.clipboard.writeText(renderedText)
        handleCopyTextMarkdown(renderedText)
      } catch (err) {
        toast({
          title: "Текст скопирован",
          description: "Текст скопирован в буфер обмена",
        })
      }
    }
  }

  const downloadCode = (code: string, language: string) => {
    const fileExtensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      cpp: "cpp",
      c: "c",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      swift: "swift",
      kotlin: "kt",
      scala: "scala",
      r: "r",
      bash: "sh",
      sh: "sh",
      shell: "sh",
      powershell: "ps1",
      sql: "sql",
      html: "html",
      css: "css",
      scss: "scss",
      less: "less",
      json: "json",
      yaml: "yml",
      xml: "xml",
      markdown: "md",
      dockerfile: "dockerfile",
      plaintext: "txt",
      text: "txt",
    }

    const extension = fileExtensions[language] || "txt"

    const fileName = `code.${extension}`

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    toast({
      title: "Файл скачан",
      description: `Код сохранен как ${fileName}`,
    })
  }

  return (
    <div>
      <div ref={markdownRef}>
        <ReactMarkdown
          remarkPlugins={[[remarkMermaid], remarkGfm, remarkMath]}
          rehypePlugins={[
            [rehypeKatex, { output: "html", throwOnError: false, strict: false, trust: true }],
            rehypeRaw,
            rehypeStringify,
          ]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            p: ({ node, ...props }) => <p className="mb-2" {...props} />,

            code: ({ children, className, ...rest }) => {
              const match = /language-(?!mermaid)(\w+)/.exec(className || "")
              const codeString = String(children).replace(/\n$/, "")
              const detectedLanguage = detectLanguage(className)

              return match ? (
                <div className="relative group">
                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                      onClick={() => onCopy(codeString)}
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
                      onClick={() => downloadCode(codeString, detectedLanguage)}
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
                    {...(rest as SyntaxHighlighterProps)}
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
              ) : (
                <code {...rest} className={cn("not-prose", className)}>
                  {children}
                </code>
              )
            },
            table({ node, ...props }) {
              return (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                    {props.children}
                  </table>
                </div>
              )
            },

            thead({ node, ...props }) {
              return <thead className="bg-gray-50 dark:bg-gray-800">{props.children}</thead>
            },

            tbody({ node, ...props }) {
              return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{props.children}</tbody>
            },

            tr({ node, ...props }) {
              return <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />
            },

            th({ node, ...props }) {
              return (
                <th
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                  {...props}
                />
              )
            },

            td({ node, ...props }) {
              return (
                <td
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                  {...props}
                />
              )
            },

            ul({ node, ...props }) {
              return <ul className="list-disc pl-5 mb-2" {...props} />
            },

            ol({ node, ...props }) {
              return <ol className="list-decimal pl-5 mb-2" {...props} />
            },

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
          {content.replaceAll("```", "^^^").replaceAll("`", "***").replaceAll("^^^", "```")}
        </ReactMarkdown>
      </div>

      {message_belong === "user" && (
        <button onClick={copyRenderedText} className="hover:text-gray-700">
          <Clipboard className="w-4 h-4 inline-block" />
          Скопировать
        </button>
      )}
    </div>
  )
}

export default Markdown
