'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

import { streamPrompt } from '@/lib/api';
import type { Message } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSubmit() {
    const text = prompt.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setPrompt('');
    setError(null);
    setIsLoading(true);

    const assistantMessageId = crypto.randomUUID();
    setMessages((previous) => [
      ...previous,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      },
    ]);

    try {
      for await (const token of streamPrompt(text)) {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + token }
              : message,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex shrink-0 items-center justify-between border-b-2 bg-secondary-background px-4 py-4 shadow-shadow sm:px-6">
        <div className="flex items-center gap-3">
          <div className="border-2 border-border bg-main p-2 shadow-shadow">
            <Bot className="size-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Local AI</h1>
            <p className="text-sm font-medium text-foreground/70">
              Powered by You
            </p>
          </div>
        </div>

        <span className="hidden border-2 border-border bg-main px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-shadow sm:block">
          Running locally
        </span>
      </header>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="border-2 border-border bg-main p-4 shadow-shadow">
                  <Sparkles className="size-10" strokeWidth={2.5} />
                </div>

                <h2 className="text-3xl font-bold sm:text-4xl">
                  What can I help with?
                </h2>

                <p className="max-w-md font-medium text-foreground/75">
                  Ask a question, explore an idea, or get help with code using
                  your local Qwen model.
                </p>

                <div className="mt-4 grid w-full max-w-lg gap-3 sm:grid-cols-2">
                  {[
                    'Explain a complex topic',
                    'Help me debug some code',
                  ].map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setPrompt(label)}
                        className={`border-2 border-border p-4 text-left font-bold shadow-shadow transition-transform hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${index === 0 ? 'bg-secondary-background' : 'bg-main'}`}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {isLoading && (
                  <div className="my-3 space-y-3 border-2 border-border bg-secondary-background p-4 shadow-shadow">
                    <p className="text-sm font-bold uppercase tracking-wide">
                      Qwen is generating...
                    </p>
                    <Skeleton className="h-3 w-3/4 bg-secondary-background" />
                    <Skeleton className="h-3 w-full bg-secondary-background" />
                    <Skeleton className="h-3 w-1/2 bg-secondary-background" />
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t-2 bg-secondary-background px-4 py-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ChatInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            <p className="text-center text-xs text-muted-foreground">
              Responses are generated by your local Ollama model.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default ChatInterface;
