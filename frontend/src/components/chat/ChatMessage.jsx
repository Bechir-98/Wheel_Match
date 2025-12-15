import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// ponytail: no per-message timestamps until messages carry createdAt (render-time clock lies)
function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex max-w-[85%] flex-col', isUser ? 'self-end items-end' : 'self-start items-start')}>
      <div
        className={cn(
          'break-words px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-2xl rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-2xl rounded-bl-sm bg-muted [&_code]:rounded [&_code]:bg-border [&_code]:px-1 [&_code]:text-[13px] [&_li]:my-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
        )}
      >
        {isUser ? message.text : <ReactMarkdown>{message.text}</ReactMarkdown>}
      </div>
    </div>
  );
}

export default ChatMessage;
