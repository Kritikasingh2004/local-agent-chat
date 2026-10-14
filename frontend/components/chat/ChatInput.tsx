'use client';

import type { KeyboardEvent } from 'react';
import { ArrowUp, LoaderCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { event } from 'next/dist/build/output/log';
import { Button } from '../ui/button';

type ChatInputProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

const ChatInput = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
}: ChatInputProps) => {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key == 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="border-2 border-border bg-secondary-background p-3 shadow-shadow">
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ASK SOMETHING..."
        className="min-h-20 resize-none "
        disabled={isLoading}
      />

      <div className="flex items-center justify-between gap-3 pt-3">
        <p className="text-xs font-bold uppercase tracking-wide">
          ENTER ↵ TO SEND
        </p>

        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!prompt.trim() || isLoading}
          aria-label="Send message"
          className="size-11"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowUp className="size-5" strokeWidth={3} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
