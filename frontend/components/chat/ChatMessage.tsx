import type { Message } from '@/lib/types';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role == 'user';

  return (
    <div
      className={`flex w-full py-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[90%] whitespace-pre-wrap break-words border-2 border-border p-4 text-sm font-medium leading-7 shadow-shadow sm:max-w-[80%] ${
          isUser
            ? 'bg-main text-main-foreground'
            : 'bg-secondary-background text-foreground'
        }`}
      >
        <div className="mb-2 text-xs font-bold uppercase tracking-widest">
          {isUser ? 'You' : 'THE ENTITY'}
        </div>
      </div>
      {message.content}
    </div>
  );
};

export default ChatMessage;
