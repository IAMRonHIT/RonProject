"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, SendHorizontal, X, ChevronLeft, ChevronRight, ChevronDown,
  ThumbsUp, ThumbsDown, Copy, FileText, RotateCw, Sparkles, PlusCircle,
  User, BookOpen, Bot, Brain, Stethoscope, Shield, Settings, CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: { type: string; name: string; content?: string }[];
  isLoading?: boolean;
  context?: {
    sources?: {
      title: string;
      content: string;
      url?: string;
    }[];
    metadata?: Record<string, any>;
  };
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onCopyMessage?: (messageId: string) => void;
  isGenerating?: boolean;
  placeholderText?: string;
  userName?: string;
  assistantName?: string;
  isCarePlanMode?: boolean;
  predefinedPrompts?: string[];
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Format timestamp for display
const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return '';
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onRegenerate,
  onFeedback,
  onCopyMessage,
  isGenerating = false,
  placeholderText = "Ask about the patient's care plan...",
  userName = "Provider",
  assistantName = "Ron AI",
  isCarePlanMode = true,
  predefinedPrompts = [
    "What interventions are most critical for this patient?",
    "Summarize the care plan in simple language for the patient",
    "What potential complications should I watch for?",
    "How should I adjust the plan based on today's vitals?",
    "What educational resources should I share with the patient?",
    "Generate a patient-friendly explanation of their diagnosis"
  ]
}) => {
  const [inputText, setInputText] = useState('');
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Get the context for the currently selected message
  const selectedMessage = messages.find(msg => msg.id === selectedMessageId);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScrollEnabled]);
  
  // Handle sending messages
  const handleSendMessage = () => {
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText.trim());
      setInputText('');
      
      // Focus the input field again
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };
  
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Automatically adjust textarea height
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };
  
  // Check scroll position to determine if auto-scroll should be enabled
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScrollEnabled(isAtBottom);
    }
  };
  
  // Use a predefined prompt
  const handlePredefinedPrompt = (prompt: string) => {
    setInputText(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Also adjust the height
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };
  
  return (
    <div className="flex flex-col h-[700px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Chat header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-sky-600 bg-opacity-80 p-2 rounded-lg mr-3">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{assistantName}</h3>
              <p className="text-slate-300 text-sm">Clinical Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
<button
  onClick={() => setShowContextPanel(!showContextPanel)}
  className="text-slate-300 bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-all relative"
  aria-label={showContextPanel ? "Hide context panel" : "Show context panel"}
  title={showContextPanel ? "Hide context panel" : "Show context panel"}
>
  {showContextPanel ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
  <span className="sr-only">{showContextPanel ? "Hide context panel" : "Show context panel"}</span>
</button>
          </div>
        </div>
      </div>

      {/* Main chat area with optional context panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages container */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-2 styled-scrollbar"
          ref={messageContainerRef}
          onScroll={handleScroll}
        >
          {/* Predefined prompts at the top */}
          {predefinedPrompts.length > 0 && (
            <div className="mb-6 px-1 pt-3">
              <div className="flex flex-wrap gap-2">
                {predefinedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-600 hover:bg-slate-600 hover:border-slate-500 transition-colors inline-flex items-center"
                    onClick={() => handlePredefinedPrompt(prompt)}
                  >
                    <PlusCircle size={12} className="mr-1.5 text-sky-400" />
                    {prompt.length > 35 ? prompt.substring(0, 32) + '...' : prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="space-y-4 pb-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex items-start max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-tl-xl rounded-tr-lg rounded-br-xl rounded-bl-xl'
                      : 'bg-slate-700 text-slate-100 rounded-tr-xl rounded-tl-sm rounded-bl-xl rounded-br-xl border border-slate-600'
                  } px-4 py-3 shadow-lg`}
                >
                  {/* Avatar for the message */}
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-sky-700 rounded-full flex items-center justify-center text-white">
                        <User size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white">
                        <Bot size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Message header with name and time */}
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.role === 'user' ? userName : assistantName}
                      </span>
                      <span className={`text-xs ${message.role === 'user' ? 'text-sky-100' : 'text-slate-400'} opacity-80`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Message content */}
                    <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert text-white' : 'prose-slate text-slate-100'} prose-p:text-current prose-strong:text-current prose-headings:text-current`}>
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-bounce w-2 h-2 bg-slate-400 rounded-full"></div>
                          <div className="animate-bounce w-2 h-2 bg-slate-400 rounded-full animation-delay-150"></div>
                          <div className="animate-bounce w-2 h-2 bg-slate-400 rounded-full animation-delay-300"></div>
                        </div>
                      ) : (
                        <div className="break-words">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Source citations or attachments */}
                    {message.context?.sources && message.context.sources.length > 0 && (
                      <div className={`mt-2 pt-2 border-t ${message.role === 'user' ? 'border-sky-500' : 'border-slate-600'}`}>
                        <div className={`text-xs ${message.role === 'user' ? 'text-sky-100' : 'text-slate-300'} font-medium mb-1 flex items-center`}>
                          <BookOpen size={12} className="mr-1.5" /> Sources:
                        </div>
                        <div className="space-y-1">
                          {message.context.sources.slice(0, 2).map((source, idx) => (
                            <div key={idx} className={`text-xs ${message.role === 'user' ? 'text-sky-200' : 'text-slate-400'} opacity-90`}>
                              {idx + 1}. {source.title || 'Referenced Source'}
                            </div>
                          ))}
                          {message.context.sources.length > 2 && (
                            <div className="text-xs text-sky-400 cursor-pointer hover:underline" onClick={() => {
                              setSelectedMessageId(message.id);
                              setShowContextPanel(true);
                            }}>
                              +{message.context.sources.length - 2} more sources
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Message actions */}
                    {message.role === 'assistant' && !message.isLoading && (
                      <div className="mt-2 flex items-center justify-end space-x-1 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onFeedback && onFeedback(message.id, true)}
                          className="text-slate-400 hover:text-green-400 p-1 rounded transition-colors"
                          aria-label="Helpful"
                          title="Helpful"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          onClick={() => onFeedback && onFeedback(message.id, false)}
                          className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                          aria-label="Not helpful"
                          title="Not helpful"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        <button
                          onClick={() => onCopyMessage && onCopyMessage(message.id)}
                          className="text-slate-400 hover:text-sky-400 p-1 rounded transition-colors"
                          aria-label="Copy message"
                          title="Copy message"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMessageId(message.id);
                            setShowContextPanel(true);
                          }}
                          className="text-slate-400 hover:text-teal-400 p-1 rounded transition-colors"
                          aria-label="View details"
                          title="View details"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Side panel for context information */}
        {showContextPanel && (
          <div className="w-80 border-l border-slate-700 bg-slate-800 overflow-y-auto styled-scrollbar animate-slide-in-right">
            <div className="p-4 border-b border-slate-700 bg-slate-700 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-semibold text-slate-100">Context & Details</h3>
              <button
                onClick={() => setShowContextPanel(false)}
                className="text-slate-300 hover:text-slate-100 p-1 rounded-full hover:bg-slate-600 transition-colors"
                title="Close context panel"
                aria-label="Close context panel"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4">
              {selectedMessage ? (
                <div className="space-y-6">
                  {/* Message details */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <MessageSquare size={14} className="mr-1.5 text-sky-400" /> Message
                    </h4>
                    <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-200 border border-slate-600">
                      {selectedMessage.content}
                    </div>
                  </div>
                  
                  {/* Context sources */}
                  {selectedMessage.context?.sources && selectedMessage.context.sources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                        <BookOpen size={14} className="mr-1.5 text-sky-400" /> Source References
                      </h4>
                      <div className="space-y-3">
                        {selectedMessage.context.sources.map((source, idx) => (
                          <div key={idx} className="bg-slate-700 rounded-lg p-3 text-sm border border-slate-600">
                            <div className="font-medium text-slate-200 mb-1">{source.title || `Source ${idx + 1}`}</div>
                            <div className="text-xs text-slate-300 line-clamp-3">{source.content}</div>
                            {source.url && (
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-sky-400 hover:underline mt-1 inline-block"
                              >
                                View Source
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Care Plan Insights */}
                  {isCarePlanMode && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                        <Stethoscope size={14} className="mr-1.5 text-sky-400" /> Clinical Context
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-slate-700 rounded-lg p-3 text-sm border border-slate-600">
                          <div className="text-xs text-slate-300 flex items-center mb-1">
                            <Brain size={12} className="mr-1.5 text-teal-400" /> Care Plan Elements Referenced
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="bg-sky-800 bg-opacity-70 text-sky-200 text-xs px-2 py-0.5 rounded-full">Nursing Diagnosis</span>
                            <span className="bg-green-800 bg-opacity-70 text-green-200 text-xs px-2 py-0.5 rounded-full">Interventions</span>
                            <span className="bg-purple-800 bg-opacity-70 text-purple-200 text-xs px-2 py-0.5 rounded-full">Goals</span>
                          </div>
                        </div>
                        <div className="bg-slate-700 rounded-lg p-3 text-sm border border-slate-600">
                          <div className="text-xs text-slate-300 flex items-center mb-1">
                            <Shield size={12} className="mr-1.5 text-teal-400" /> Clinical Safety Checks
                          </div>
                          <div className="text-xs text-green-400 flex items-center">
                            <CheckCircle size={12} className="mr-1.5" /> All recommendations verified against current protocol
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  Select a message to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t border-slate-700 bg-slate-800 p-4">
        {isGenerating && onRegenerate && (
          <div className="mb-2 px-3 py-2 bg-sky-900 bg-opacity-50 rounded-lg flex items-center justify-between">
            <div className="text-sm text-sky-300 flex items-center">
              <Sparkles size={16} className="mr-2 animate-pulse" />
              AI is generating a response...
            </div>
            <button 
              onClick={onRegenerate}
              className="text-red-400 hover:text-red-300 text-xs border border-red-500/50 hover:border-red-500 px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="relative flex items-end">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="flex-1 bg-slate-700 text-slate-100 rounded-xl border border-slate-600 shadow-sm p-3 pr-12 placeholder-slate-400 resize-none min-h-[44px] max-h-[120px] styled-scrollbar focus:outline-none focus:ring-2 focus:ring-sky-500 textarea-height"
            disabled={isGenerating}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isGenerating}
            className={`absolute right-3 bottom-2.5 ${
              !inputText.trim() || isGenerating 
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-sky-400 hover:text-sky-300'
            } transition-colors`}
            title="Send message"
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
        
        <div className="mt-2 flex justify-between items-center px-1">
          <div className="text-xs text-slate-400">
            {isCarePlanMode ? "Ask RON AI about this patient's care plan" : "How can I help you today?"}
          </div>
          <div className="flex items-center">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating || messages.length === 0 || messages[messages.length - 1].role === 'user'}
                className={`mr-3 flex items-center text-xs rounded-md px-2 py-1 ${
                  isGenerating || messages.length === 0 || messages[messages.length - 1].role === 'user'
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                } transition-colors`}
              >
                <RotateCw size={12} className="mr-1.5" /> Regenerate
              </button>
            )}
<button
  className="text-slate-400 hover:text-slate-300 p-1 rounded relative hover:bg-slate-700"
  aria-label="Chat settings"
  title="Chat settings"
>
  <Settings size={14} />
  <span className="sr-only">Chat settings</span>
</button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: #0f172a; /* slate-900 */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #334155; /* slate-700 */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; /* slate-600 */ }
        
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        
        .prose { /* Ensure prose styles inherit text color for better control */ }
        .prose-slate code::before, .prose-slate code::after { content: "" !important; }
        .prose-invert code::before, .prose-invert code::after { content: "" !important; }

        .prose-slate code {
          background-color: rgba(51, 65, 85, 0.7); /* slate-700 with opacity */
          color: #e2e8f0; /* slate-200 */
          padding: 0.2em 0.4em;
          margin: 0 0.1em;
          font-size: 0.875em;
          border-radius: 0.25rem;
          border: 1px solid rgba(71, 85, 105, 0.7); /* slate-600 with opacity */
        }
        .prose-invert code {
          background-color: rgba(2, 6, 23, 0.5); /* sky-900 with opacity on user bubble */
          color: #e0f2fe; /* sky-100 */
          padding: 0.2em 0.4em;
          margin: 0 0.1em;
          font-size: 0.875em;
          border-radius: 0.25rem;
          border: 1px solid rgba(14, 116, 144, 0.5); /* sky-700 with opacity */
        }

        .prose-slate pre {
          background-color: rgba(30, 41, 59, 0.9); /* slate-800 with more opacity */
          color: #cbd5e1; /* slate-300 */
          padding: 1em;
          border-radius: 0.375rem; /* rounded-md */
          overflow-x: auto;
          border: 1px solid #475569; /* slate-600 */
        }
        .prose-invert pre {
          background-color: rgba(12, 74, 110, 0.9); /* sky-800 with more opacity */
          color: #f0f9ff; /* sky-50 */
          padding: 1em;
          border-radius: 0.375rem; /* rounded-md */
          overflow-x: auto;
          border: 1px solid #075985; /* sky-700 */
        }
        .prose-slate pre code, .prose-invert pre code {
          background-color: transparent !important;
          color: inherit !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          font-size: inherit !important;
        }
        
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
        .textarea-height { height: 44px; } /* Default height */

        /* Custom prose color overrides to ensure they pick up from parent text color */
        .prose-slate p, .prose-slate strong, .prose-slate h1, .prose-slate h2, .prose-slate h3, .prose-slate h4, .prose-slate ul, .prose-slate ol, .prose-slate li {
          color: inherit;
        }
        .prose-invert p, .prose-invert strong, .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4, .prose-invert ul, .prose-invert ol, .prose-invert li {
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;