import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseChatOptions {
  initialMessages?: Message[];
  apiEndpoint?: string;
}

export function useChat({
  initialMessages = [],
  apiEndpoint = '/api/rag-chatbot',
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMessage = useCallback(
    async (userMessage: string, systemPrompt?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Add user message to history
        const newMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }];
        setMessages(newMessages);
        
        // Setup EventSource for SSE
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            systemPrompt,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Add assistant response to history
        const assistantMessage = { role: 'assistant' as const, content: data.text };
        setMessages(prev => [...prev, assistantMessage]);
        
        return data.text;
        
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        return `Error: ${err.message || 'Failed to send message'}`;
      } finally {
        setIsLoading(false);
      }
    },
    [apiEndpoint, messages]
  );

  return {
    messages,
    isLoading,
    error,
    submitMessage,
  };
}