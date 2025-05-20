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
  reasoning?: string;
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
  showReasoningPanel?: boolean;
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
    "Key interventions for this patient?",
    "Patient-friendly summary of care plan.",
    "Potential complications to monitor?",
    "Adjust plan based on today's vitals?",
    "Educational resources to share?",
    "Explain diagnosis simply."
  ],
  showReasoningPanel = true
}) => {
  const [inputText, setInputText] = useState('');
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  
  const selectedMessage = messages.find(msg => msg.id === selectedMessageId);
  
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScrollEnabled]);
  
  // Listen for chat-update events
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      if (reasoningRef.current && event.detail.reasoning) {
        reasoningRef.current.innerHTML = event.detail.reasoning;
        reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
      }
    };
    
    document.addEventListener('chat-update', handleChatUpdate as EventListener);
    return () => {
      document.removeEventListener('chat-update', handleChatUpdate as EventListener);
    };
  }, []);
  
  const handleSendMessage = () => {
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText.trim());
      setInputText('');
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto'; // Reset height
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`; // Set to scroll height or max
  };
  
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      setAutoScrollEnabled(scrollHeight - scrollTop - clientHeight < 50);
    }
  };
  
  const handlePredefinedPrompt = (prompt: string) => {
    setInputText(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
      // Manually trigger height adjustment for predefined prompts
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Chat header */}
      <div className="bg-slate-900 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-slate-800 border border-teal-700 glow-teal-500 p-2 rounded-lg mr-3 shadow-md">
              <Bot size={22} className="text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{assistantName}</h3>
              <p className="text-slate-400 text-sm">Clinical Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-sky-400 p-2 rounded-lg transition-all relative border border-slate-600 hover:border-sky-500"
              aria-label={showContextPanel ? "Hide context panel" : "Show context panel"}
              title={showContextPanel ? "Hide context panel" : "Show context panel"}
            >
              {showContextPanel ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Reasoning panel - only shown when reasoning is happening */}
        {showReasoningPanel && showReasoning && (
          <div className="bg-slate-900 border-b border-slate-800 p-3">
            <div className="flex items-center mb-2">
              <Brain size={16} className="text-teal-400 mr-2" />
              <span className="text-sm font-medium text-teal-400">AI Reasoning Process</span>
              {isGenerating && (
                <div className="ml-2 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse mr-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse animation-delay-150 mr-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse animation-delay-300"></div>
                </div>
              )}
            </div>
            <div 
              ref={reasoningRef}
              className="text-xs text-teal-200 bg-slate-950 p-3 rounded border border-slate-800 max-h-40 overflow-y-auto styled-scrollbar-dark font-mono whitespace-pre-wrap"
            >
              {isGenerating ? "Thinking..." : "No active reasoning"}
            </div>
          </div>
        )}
        
        {/* Messages container */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto styled-scrollbar-dark"
          onScroll={handleScroll}
        >
          {predefinedPrompts.length > 0 && (
            <div className="mb-5 px-1 pt-2">
              <div className="flex flex-wrap gap-2">
                {predefinedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-700 hover:border-sky-500 hover:text-sky-300 transition-all duration-200 inline-flex items-center shadow-sm hover:shadow-md"
                    onClick={() => handlePredefinedPrompt(prompt)}
                  >
                    <PlusCircle size={12} className="mr-1.5 text-sky-500" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-5 pb-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex items-start max-w-[85%] rounded-xl shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-sky-600 text-white glow-sky-500 border border-sky-500' // User message with glow
                      : 'bg-slate-800 text-slate-100 border border-slate-700' // Assistant message
                  } px-4 py-3`}
                >
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {message.role === 'user' ? (
                      <div className="w-7 h-7 bg-sky-700 rounded-full flex items-center justify-center text-white border border-sky-400">
                        <User size={14} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 bg-teal-700 rounded-full flex items-center justify-center text-white border border-teal-500 glow-teal-500">
                        <Bot size={14} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-sm">
                        {message.role === 'user' ? userName : assistantName}
                      </span>
                      <span className={`text-xs ${message.role === 'user' ? 'text-sky-100' : 'text-slate-400'} opacity-70`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert text-white' : 'text-slate-200'} prose-p:my-1 prose-p:text-current prose-strong:text-current prose-headings:text-current`}>
                      {message.isLoading ? (
                        <div className="flex items-center space-x-1.5 py-1">
                          <div className="animate-bounce w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                          <div className="animate-bounce w-1.5 h-1.5 bg-slate-400 rounded-full animation-delay-150"></div>
                          <div className="animate-bounce w-1.5 h-1.5 bg-slate-400 rounded-full animation-delay-300"></div>
                        </div>
                      ) : (
                        <div className="break-words">
                          <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p {...props} className="markdown-paragraph" />,
                              code: ({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode; [key: string]: any }) => {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <pre className={`bg-slate-900 p-2 rounded-md border border-slate-600 overflow-x-auto my-2 text-xs text-slate-300`}><code className={className} {...props}>{children}</code></pre>
                                ) : (
                                  <code className={`${className} bg-slate-700 text-sky-300 px-1 py-0.5 rounded text-xs border border-slate-600`} {...props}>{children}</code>
                                )
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {message.context?.sources && message.context.sources.length > 0 && (
                      <div className={`mt-2 pt-1.5 border-t ${message.role === 'user' ? 'border-sky-500/50' : 'border-slate-700'}`}>
                        <div className={`text-xs ${message.role === 'user' ? 'text-sky-100' : 'text-slate-300'} font-medium mb-0.5 flex items-center`}>
                          <BookOpen size={12} className="mr-1" /> Sources:
                        </div>
                        <div className="space-y-0.5">
                          {message.context.sources.slice(0, 2).map((source, idx) => (
                            <div key={idx} className={`text-xs ${message.role === 'user' ? 'text-sky-200' : 'text-slate-400'} opacity-80 truncate`}>
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
                    
                    {message.role === 'assistant' && !message.isLoading && (
                      <div className="mt-1.5 flex items-center justify-end space-x-0.5 opacity-60 hover:opacity-100 transition-opacity">
                        <button onClick={() => onFeedback && onFeedback(message.id, true)} className="text-slate-400 hover:text-lime-400 p-1 rounded-full hover:bg-slate-700 transition-colors" title="Helpful"><ThumbsUp size={13} /></button>
                        <button onClick={() => onFeedback && onFeedback(message.id, false)} className="text-slate-400 hover:text-red-400 p-1 rounded-full hover:bg-slate-700 transition-colors" title="Not helpful"><ThumbsDown size={13} /></button>
                        <button onClick={() => onCopyMessage && onCopyMessage(message.id)} className="text-slate-400 hover:text-sky-400 p-1 rounded-full hover:bg-slate-700 transition-colors" title="Copy message"><Copy size={13} /></button>
                        <button onClick={() => { setSelectedMessageId(message.id); setShowContextPanel(true); }} className="text-slate-400 hover:text-teal-400 p-1 rounded-full hover:bg-slate-700 transition-colors" title="View details"><FileText size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {showContextPanel && (
          <div className="w-80 border-l border-slate-700 bg-slate-900 overflow-y-auto styled-scrollbar-dark animate-slide-in-right">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-semibold text-slate-100">Context & Details</h3>
              <button onClick={() => setShowContextPanel(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-full hover:bg-slate-700 transition-colors" title="Close context panel"><X size={16} /></button>
            </div>
            
            <div className="p-4">
              {selectedMessage ? (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><MessageSquare size={14} className="mr-1.5 text-sky-400 glow-sky-500" /> Message</h4>
                    <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-200 border border-slate-700 shadow-md">{selectedMessage.content}</div>
                  </div>
                  
                  {selectedMessage.context?.sources && selectedMessage.context.sources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><BookOpen size={14} className="mr-1.5 text-sky-400 glow-sky-500" /> Source References</h4>
                      <div className="space-y-2.5">
                        {selectedMessage.context.sources.map((source, idx) => (
                          <div key={idx} className="bg-slate-800 rounded-lg p-3 text-sm border border-slate-700 shadow-md">
                            <div className="font-medium text-slate-200 mb-1">{source.title || `Source ${idx + 1}`}</div>
                            <div className="text-xs text-slate-300 line-clamp-3">{source.content}</div>
                            {source.url && (<a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:underline mt-1 inline-block">View Source</a>)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isCarePlanMode && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1.5 flex items-center"><Stethoscope size={14} className="mr-1.5 text-teal-400 glow-teal-500" /> Clinical Context</h4>
                      <div className="space-y-2">
                        <div className="bg-slate-800 rounded-lg p-3 text-sm border border-slate-700 shadow-md">
                          <div className="text-xs text-slate-300 flex items-center mb-1"><Brain size={12} className="mr-1.5 text-teal-400" /> Care Plan Elements</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="bg-sky-800/70 text-sky-300 text-xs px-2 py-0.5 rounded-full border border-sky-700">Diagnosis</span>
                            <span className="bg-lime-800/70 text-lime-300 text-xs px-2 py-0.5 rounded-full border border-lime-700">Interventions</span>
                            <span className="bg-purple-800/70 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-700">Goals</span>
                          </div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 text-sm border border-slate-700 shadow-md">
                          <div className="text-xs text-slate-300 flex items-center mb-1"><Shield size={12} className="mr-1.5 text-teal-400" /> Safety Checks</div>
                          <div className="text-xs text-lime-400 flex items-center"><CheckCircle size={12} className="mr-1.5" /> Verified</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">Select a message to view details</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t border-slate-700 bg-slate-900 p-3.5">
        {isGenerating && onRegenerate && (
          <div className="mb-2 px-3 py-1.5 bg-sky-900/50 rounded-lg flex items-center justify-between border border-sky-700">
            <div className="text-sm text-sky-300 flex items-center">
              <Sparkles size={15} className="mr-2 animate-pulse text-sky-400" />
              AI is generating...
            </div>
            <button 
              onClick={onRegenerate}
              className="text-red-400 hover:text-red-300 text-xs border border-red-600 hover:border-red-500 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="relative flex items-end">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); adjustTextareaHeight(e); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="flex-1 bg-slate-800 text-slate-100 rounded-xl border border-slate-600 shadow-sm p-3 pr-10 placeholder-slate-500 resize-none min-h-[44px] max-h-[120px] styled-scrollbar-dark focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            disabled={isGenerating}
            rows={1} // Start with 1 row, will auto-expand
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isGenerating}
            className={`absolute right-2.5 bottom-2 ${
              !inputText.trim() || isGenerating 
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-sky-400 hover:text-sky-300 glow-sky-500'
            } p-1 rounded-md transition-colors`}
            title="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
        
        <div className="mt-1.5 flex justify-between items-center px-1">
          <div className="text-xs text-slate-500">
            {isCarePlanMode ? "RON AI Clinical Assistant" : "How can I help?"}
          </div>
          <div className="flex items-center">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isGenerating || messages.length === 0 || messages[messages.length - 1].role === 'user'}
                className={`mr-2 flex items-center text-xs rounded-md px-1.5 py-0.5 ${
                  isGenerating || messages.length === 0 || messages[messages.length - 1].role === 'user'
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                } transition-colors`}
              >
                <RotateCw size={11} className="mr-1" /> Regenerate
              </button>
            )}
            <button className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-slate-800" title="Chat settings">
              <Settings size={13} />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar-dark::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background: #020617; /* slate-950 */ }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background: #1e293b; /* slate-800 */ border-radius: 10px; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #334155; /* slate-700 */ }
        
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        
        .prose-slate code::before, .prose-slate code::after,
        .prose-invert code::before, .prose-invert code::after { content: "" !important; }

        .prose-slate code, .prose-invert code { /* Unified code styling */
          background-color: #0f172a; /* slate-900 */
          color: #94a3b8; /* slate-400 */
          padding: 0.15em 0.3em;
          margin: 0 0.05em;
          font-size: 0.85em;
          border-radius: 0.2rem;
          border: 1px solid #334155; /* slate-700 */
        }
        .prose-slate pre, .prose-invert pre { /* Unified pre styling */
          background-color: #020617; /* slate-950 */
          color: #cbd5e1; /* slate-300 */
          padding: 0.75em;
          border-radius: 0.3rem; 
          overflow-x: auto;
          border: 1px solid #1e293b; /* slate-800 */
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .prose-slate pre code, .prose-invert pre code {
          background-color: transparent !important; color: inherit !important;
          border: none !important; padding: 0 !important; margin: 0 !important;
          font-size: inherit !important;
        }
        
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0.7; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.25s ease-out forwards; }

        /* Electric Glows - ensure these are defined in careplan-template.tsx or a global CSS file */
        .glow-sky-500 { box-shadow: 0 0 8px 1px rgba(14, 165, 233, 0.3); }
        .glow-teal-500 { box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.3); }
        .glow-lime-400 { box-shadow: 0 0 8px 1px rgba(163, 230, 53, 0.3); }
        .glow-red-400 { box-shadow: 0 0 8px 1px rgba(248, 113, 113, 0.3); }
      `}</style>
    </div>
  );
};

export default ChatInterface;
