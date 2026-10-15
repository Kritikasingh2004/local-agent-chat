'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/markdown';

type MarkdownContentProps = {
  content: string;
};

type CodeBlockProps = {
  code: string;
  language?: string;
};

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyToClipboard(code)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="markdown-code-block">
      <div className="markdown-code-toolbar">
        <span>{language || 'CODE'}</span>
        <Button
          type="button"
          size="xs"
          variant="neutral"
          onClick={handleCopy}
          aria-label="Copy code block"
        >
          {copied ? <Check /> : <Copy />}
          {copied ? 'COPIED!' : 'COPY'}
        </Button>
      </div>

      <pre className="markdown-code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MarkdownContent = ({ content }: MarkdownContentProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={{
      pre: ({ children }) => <>{children}</>,
      code: ({ className, children }) => {
        const code = String(children).replace(/\n$/, '');
        const isBlock = Boolean(className) || String(children).includes('\n');
        const language = className?.replace('language-', '');

        return isBlock ? (
          <CodeBlock code={code} language={language} />
        ) : (
          <code className="markdown-inline-code">{children}</code>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MarkdownContent;
