import type { Message } from '@/lib/types';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full py-3 ${isUser ? 'justify-end pl-8 sm:pl-16' : 'justify-start pr-8 sm:pr-16'}`}
    >
      <div
        className={`w-fit max-w-full whitespace-pre-wrap wrap-break-word border-2 border-border p-4 text-sm font-medium leading-7 shadow-shadow sm:max-w-[85%] ${
          isUser
            ? 'rounded-bl-base bg-main text-main-foreground'
            : 'rounded-br-base bg-secondary-background text-foreground'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-4 border-b-2 border-border pb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em]">
          {isUser ? 'You' : 'THE ENTITY'}
        </div>

        <div className="min-w-0 overflow-hidden">
          {message.content || <span className="sr-only">Generating response</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
