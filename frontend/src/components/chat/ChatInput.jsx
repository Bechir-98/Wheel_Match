import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Textarea } from '../ui/textarea.jsx';

function ChatInput({ onSend, disabled }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const submitValue = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form
      className="flex items-end gap-2 border-t bg-muted/40 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submitValue();
      }}
    >
      <Textarea
        className="max-h-[120px] min-h-[44px] resize-none rounded-3xl"
        placeholder={t('chat.placeholder')}
        aria-label={t('chat.inputLabel')}
        disabled={disabled}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitValue();
          }
        }}
      />
      <Button type="submit" size="icon" disabled={disabled} aria-label={t('chat.send')} className="shrink-0 rounded-full">
        <Send />
      </Button>
    </form>
  );
}

export default ChatInput;
