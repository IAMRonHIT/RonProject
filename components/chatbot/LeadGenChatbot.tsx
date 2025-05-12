"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Maximize2, X, Bot, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MessageType = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

type ChatState = 'minimized' | 'chat' | 'form';

interface LeadGenChatbotProps {
  initialMessage?: string;
  apiEndpoint?: string;
}

const LeadGenChatbot: React.FC<LeadGenChatbotProps> = ({
  initialMessage = "Hi there! I'm the Ron AI assistant. How can I help you with your care planning needs today?",
  apiEndpoint = "/api/chatbot",
}) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>('minimized');
  const [isTyping, setIsTyping] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "How does CPaaS work?",
    "What are the benefits of Ron AI?",
    "How much time can I save with Ron AI?",
    "Can I schedule a demo?",
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatState === 'chat') {
      inputRef.current?.focus();
    }
  }, [chatState]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    const loadingMessage: MessageType = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.filter(m => m.role !== 'system'),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Replace loading message with actual response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: data.message,
                isLoading: false,
                // If the bot detected lead intent, include system message to prompt for contact info
                ...(data.shouldCollectLead && {
                  content: `${data.message}\n\nWould you like to learn more? I'd be happy to connect you with our team.`,
                })
              }
            : msg
        )
      );
      
      // If we should collect lead info, show the form
      if (data.shouldCollectLead) {
        // Add a system message prompting to collect info after a short delay
        setTimeout(() => {
          const systemMessage: MessageType = {
            id: Date.now().toString(),
            role: 'system',
            content: 'To help you better, would you mind sharing some contact information?',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMessage]);
          setChatState('form');
        }, 2000);
      }
      
      // Update suggested questions based on context
      if (data.suggestedFollowups?.length > 0) {
        setSuggestedQuestions(data.suggestedFollowups);
      }
      
    } catch (error) {
      // Replace loading message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error. Please try again later.",
                isLoading: false,
              }
            : msg
        )
      );
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setFormError('Please provide your name and email.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please provide a valid email address.');
      return;
    }
    
    setFormError('');
    
    // Add loading state to form
    const systemMessage: MessageType = {
      id: Date.now().toString(),
      role: 'system',
      content: 'Submitting your information...',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    try {
      // Call the lead submission API endpoint (Zapier integration)
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          company,
          conversation: messages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }
      
      // Replace loading message with success message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === systemMessage.id
            ? {
                ...msg,
                content: 'Thank you! Our team will contact you soon.',
                isLoading: false,
              }
            : msg
        )
      );
      
      setFormSuccess(true);
      
      // After success, return to chat mode
      setTimeout(() => {
        setChatState('chat');
        // Add a follow-up assistant message
        const followupMessage: MessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Thanks, ${name}! In the meantime, is there anything else you'd like to know about Ron AI's CPaaS solution?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, followupMessage]);
      }, 2000);
      
    } catch (error) {
      // Replace loading message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === systemMessage.id
            ? {
                ...msg,
                content: 'Sorry, we had trouble submitting your information. Please try again later.',
                isLoading: false,
              }
            : msg
        )
      );
      console.error('Error submitting lead:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatState = () => {
    setChatState(prev => (prev === 'minimized' ? 'chat' : 'minimized'));
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    // Optional: auto-send the suggested question
    // setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      <AnimatePresence>
        {chatState !== 'minimized' && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-900 to-slate-800 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                  <Bot size={18} className="text-white" />
                </div>
                <h3 className="text-white font-medium">Ron AI Assistant</h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={toggleChatState}
                  className="text-slate-200 hover:text-white p-1 rounded"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setChatState('minimized')}
                  className="text-slate-200 hover:text-white p-1 rounded ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {chatState === 'chat' && (
              <>
                <div className="h-[350px] overflow-y-auto p-4 bg-slate-800 flex flex-col gap-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      } ${message.role === 'system' ? 'justify-center' : ''}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : message.role === 'assistant'
                            ? 'bg-slate-700 text-slate-100 rounded-tl-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 italic text-sm'
                        }`}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center">
                            <Loader2 size={16} className="animate-spin mr-2" />
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {suggestedQuestions.length > 0 && (
                  <div className="p-3 bg-slate-800 border-t border-slate-700 overflow-x-auto whitespace-nowrap flex gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full flex-shrink-0 transition-colors"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-3 bg-slate-900 border-t border-slate-700 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    className="flex-grow bg-slate-800 border border-slate-700 text-slate-200 rounded-l-lg px-4 py-2 outline-none focus:border-purple-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`bg-purple-600 ${
                      !input.trim() || isTyping
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-purple-700'
                    } text-white rounded-r-lg px-4 py-2`}
                  >
                    {isTyping ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Lead Form */}
            {chatState === 'form' && (
              <div className="p-4 bg-slate-800 h-[350px] overflow-y-auto">
                <h4 className="text-lg font-medium text-slate-100 mb-4">Contact Information</h4>
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
                      placeholder="Your organization (optional)"
                    />
                  </div>
                  
                  {formError && (
                    <p className="text-red-400 text-sm">{formError}</p>
                  )}
                  
                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setChatState('chat')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                    >
                      Back to chat
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-purple-600 ${
                        formSuccess ? 'bg-green-600' : 'hover:bg-purple-700'
                      } text-white rounded-lg flex items-center`}
                      disabled={formSuccess}
                    >
                      {formSuccess ? (
                        <>
                          <CheckIcon className="mr-2" /> Submitted
                        </>
                      ) : (
                        <>
                          Submit <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        onClick={toggleChatState}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg flex items-center justify-center z-50 hover:shadow-purple-500/30 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {chatState === 'minimized' ? (
          <Bot size={24} className="text-white" />
        ) : (
          <Maximize2 size={22} className="text-white" />
        )}
      </motion.button>
    </>
  );
};

// Helper components
const CheckIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default LeadGenChatbot;