'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PaperPlaneIcon, ChatBubbleIcon } from '@radix-ui/react-icons'; // Using Radix icons
import type { PaperPlaneIcon as PaperPlaneIconType, ChatBubbleIcon as ChatBubbleIconType } from '@radix-ui/react-icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export function ChatbotUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hi there! I'm Ron AI's assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    // Add user message to state
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, history: messages }), // Send history too
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add bot response to state
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);

    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, I couldn't connect. Please try again later." }]);
    } finally {
      setIsLoading(false);
       // Ensure input is focused after sending
       const inputElement = document.getElementById('chat-input');
       if (inputElement) {
         inputElement.focus();
       }
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
         <Button
           className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
           size="icon"
           onClick={() => setIsOpen(true)}
           aria-label="Open Chat"
         >
           <ChatBubbleIcon className="h-6 w-6" />
         </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* SheetTrigger is not used directly here as we control open state manually */}
        <SheetContent className="flex flex-col p-0 pt-4">
          <SheetHeader className="px-6 pb-4 border-b">
            <SheetTitle>Chat with Ron AI Assistant</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 overflow-y-auto px-6 py-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/ron-ai-logo.png" alt="Bot" />
                      <AvatarFallback>RA</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[75%] break-words ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.text}
                  </div>
                   {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      {/* Placeholder for user avatar if needed */}
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/ron-ai-logo.png" alt="Bot" />
                      <AvatarFallback>RA</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <span className="italic text-muted-foreground">Typing...</span>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className="px-6 py-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                id="chat-input"
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send Message">
                <PaperPlaneIcon className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
