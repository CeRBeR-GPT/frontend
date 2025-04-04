"use client"

import { Copy, Check } from "lucide-react"
import React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import rehypeKatex from "rehype-katex"
import remarkMath from "../lib/remarkMath"
import remarkGfm from "remark-gfm"
import "katex/dist/katex.min.css"

const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c', 'php',
  'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'bash', 'sh', 'shell',
  'powershell', 'sql', 'html', 'css', 'scss', 'less', 'json', 'yaml', 'xml',
  'markdown', 'dockerfile', 'plaintext', 'text'
]

function detectLanguage(className?: string): string {
  if (!className) return 'text'
  
  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(lang)) {
      return lang
    }
  }
  
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
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-1.5" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
        
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        
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
          return (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {props.children}
            </thead>
          )
        },
        
        tbody({ node, ...props }) {
          return (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {props.children}
            </tbody>
          )
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
  )
}