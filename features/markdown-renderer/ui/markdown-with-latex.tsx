'use client';

import React from 'react';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { useTheme } from 'next-themes';

import { Clipboard } from 'lucide-react';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

import { useCopyMessage } from '@/features/copy-message/model';
import { useToast } from '@/shared/hooks';
import remarkMath from '@/shared/utils/remarkMath';
import remarkMermaid from '@/shared/utils/remarkMermoid';

import { copyRenderedText } from '../lib';
import { MarkdownWithLatexProps } from '../model';
import { CodeBlock } from './CodeBlock';

export const Markdown: React.FC<MarkdownWithLatexProps> = ({ content, message_belong }) => {
  const markdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  const { handleCopyTextMarkdown, copiedCode } = useCopyMessage();

  return (
    <div>
      <div ref={markdownRef}>
        <ReactMarkdown
          remarkPlugins={[[remarkMermaid], remarkGfm, remarkMath]}
          rehypePlugins={[
            [rehypeKatex, { output: 'html', throwOnError: false, strict: false, trust: true }],
            rehypeRaw,
            rehypeStringify,
          ]}
          components={{
            h1: ({ node, ...props }) => <h1 className="mb-2 mt-4 text-2xl font-bold" {...props} />,
            h2: ({ node, ...props }) => <h2 className="mb-1.5 mt-3 text-xl font-bold" {...props} />,
            h3: ({ node, ...props }) => <h3 className="mb-1 mt-2 text-lg font-bold" {...props} />,
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
                <div className="my-2 overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                    {props.children}
                  </table>
                </div>
              );
            },
            thead({ node, ...props }) {
              return <thead className="bg-gray-50 dark:bg-gray-800">{props.children}</thead>;
            },
            tbody({ node, ...props }) {
              return (
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {props.children}
                </tbody>
              );
            },
            tr({ node, ...props }) {
              return <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />;
            },
            th({ node, ...props }) {
              return (
                <th
                  className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                  {...props}
                />
              );
            },
            td({ node, ...props }) {
              return (
                <td
                  className="border-b border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                  {...props}
                />
              );
            },
            ul({ node, ...props }) {
              return <ul className="mb-2 list-disc pl-5" {...props} />;
            },
            ol({ node, ...props }) {
              return <ol className="mb-2 list-decimal pl-5" {...props} />;
            },
            blockquote({ node, ...props }) {
              return (
                <blockquote
                  className="mb-2 border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-300"
                  {...props}
                />
              );
            },
          }}
        >
          {content.replaceAll('```', '^^^').replaceAll('`', '***').replaceAll('^^^', '```')}
        </ReactMarkdown>
      </div>

      {message_belong === 'user' && (
        <button
          onClick={() => copyRenderedText(markdownRef, handleCopyTextMarkdown, toast)}
          className="hover:text-gray-700"
        >
          <Clipboard className="inline-block h-4 w-4" />
          Скопировать
        </button>
      )}
    </div>
  );
};
