import React, { createContext, useCallback, useContext, useState } from 'react';
import { authHeaders, apiUrl } from '../../config/api.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (typeof text !== 'string' || !text.trim()) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessage = { role: 'assistant', text: '' };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsStreaming(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch(apiUrl('/chat'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message: text.trim(), history })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    text: updated[updated.length - 1].text + parsed.text
                  };
                  return updated;
                });
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: 'Sorry, something went wrong. Please try again.'
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    isOpen,
    setIsOpen,
    sendMessage,
    isStreaming,
    clearMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}