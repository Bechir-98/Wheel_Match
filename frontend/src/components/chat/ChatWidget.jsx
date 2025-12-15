import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, MessageCircle, Trash2, X } from 'lucide-react';
import { useChat } from './ChatContext.jsx';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';
import { Avatar, AvatarFallback } from '../ui/avatar.jsx';
import { Button } from '../ui/button.jsx';
import { Card } from '../ui/card.jsx';

const COUNT = 5;

function ChatWidget() {
  const { t } = useTranslation();
  const { messages, isOpen, setIsOpen, sendMessage, isStreaming, clearMessages } = useChat();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  return (
    <>
      {isOpen && (
        <Card
          role="dialog"
          aria-label={t('chat.dialogLabel')}
          className="fixed bottom-24 right-4 z-50 flex h-[550px] max-h-[70vh] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:right-6"
        >
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {t('chat.title')}
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={clearMessages} aria-label={t('chat.clear')}>
                <Trash2 />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label={t('chat.close')}>
                <X />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 font-medium">
                  <Bot className="h-5 w-5 text-primary" />
                  {t('chat.greeting')}
                </div>
                <ul className="ml-5 mt-2 list-disc text-sm text-muted-foreground">
                  {Array.from({ length: COUNT }, (_, i) => i + 1).map((n) => (
                    <li key={n}>{t(`chat.suggestion${n}`)}</li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {isStreaming && (
              <div className="flex gap-1 self-start rounded-2xl rounded-bl-sm bg-muted px-4 py-3" aria-label={t('chat.typing')}>
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </Card>
      )}

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('chat.close') : t('chat.open')}
        className="fixed bottom-6 right-4 z-50 h-14 w-14 rounded-full shadow-lg sm:right-6"
      >
        <MessageCircle />
      </Button>
    </>
  );
}

export default ChatWidget;
