"use client"

import React from "react"
import { useRef } from "react"
import { Clipboard } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkMath from "@/shared/utils/remarkMath"
import remarkGfm from "remark-gfm"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { useToast } from "@/shared/hooks/use-toast"
import remarkMermaid from "@/shared/utils/remarkMermoid"
import { useTheme } from "next-themes"
import { MarkdownWithLatexProps } from "../model"
import { copyRenderedText } from "../lib"
import { CodeBlock } from "./CodeBlock"
import { useCopyMessage } from "@/features/copy-message/model"

export const Markdown: React.FC<MarkdownWithLatexProps> = ({ content, message_belong }) => {
  const markdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { theme } = useTheme()
  const { handleCopyTextMarkdown, copiedCode } = useCopyMessage()

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
            code: ({ children, className, ...rest }) => (
              <CodeBlock 
                className={className} 
                rest={rest}
                theme={theme}
                copiedCode={copiedCode}
                onCopyCode={handleCopyTextMarkdown}
              >
                {children}
              </CodeBlock>
            ),
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
        <button 
          onClick={() => copyRenderedText(markdownRef, handleCopyTextMarkdown, toast)} 
          className="hover:text-gray-700"
        >
          <Clipboard className="w-4 h-4 inline-block" />
          Скопировать
        </button>
      )}
    </div>
  )
}