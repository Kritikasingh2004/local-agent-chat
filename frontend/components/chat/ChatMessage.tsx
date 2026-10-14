"use client";

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import MarkdownContent from '@/components/chat/MarkdownContent';
import { copyToClipboard, markdownToPlainText } from '@/lib/markdown';
import type { Message } from '@/lib/types';

type ChatMessageProps = {
  message: Message;
  isThinking?: boolean;
};

const ChatMessage = ({ message, isThinking = false }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyToClipboard(markdownToPlainText(message.content))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div
      className={`flex w-full py-3 ${isUser ? 'justify-end pl-8 sm:pl-16' : 'justify-start pr-8 sm:pr-16'}`}
    >
      <div
        className={`w-fit max-w-full wrap-break-word border-2 border-border p-4 text-sm font-medium leading-7 shadow-shadow sm:max-w-[85%] ${
          isUser
            ? 'rounded-bl-base bg-main text-main-foreground'
            : 'rounded-br-base bg-main text-main-foreground'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-4 border-b-2 border-border pb-2 font-extrabold uppercase">
          {isUser ? 'You' : 'THE ENTITY'}
          {!isUser && message.content && (
            <Button
              type="button"
              size="xs"
              variant="neutral"
              onClick={handleCopy}
              aria-label="Copy response"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? 'COPIED!' : 'COPY'}
            </Button>
          )}
        </div>

        <div
          className="min-w-0 overflow-hidden"
          aria-live={isThinking ? 'polite' : undefined}
        >
          {isThinking ? (
            <span className="font-bold uppercase tracking-wide">
              THE ENTITY IS THINKING...
            </span>
          ) : isUser ? (
            <span className="whitespace-pre-wrap font-bold">{message.content}</span>
          ) : (
            <div className="markdown-content">
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
