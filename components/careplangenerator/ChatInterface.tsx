"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, SendHorizontal, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Copy, FileText, RotateCw, Sparkles, PlusCircle,
  User, BookOpen, Bot, Brain, Stethoscope, Shield, Settings, CheckCircle,
  Zap, Clock, ArrowRight
} from 'lucide-react';
import ReactMarkdown, { Options } from 'react-markdown';

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
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const selectedMessage = messages.find(msg => msg.id === selectedMessageId);
  
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScrollEnabled]);
  
  
  const handleSendMessage = () => {
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText.trim());
      setInputText('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
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
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
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
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleMessageClick = (messageId: string) => {
    setSelectedMessageId(messageId);
    const msg = messages.find(m => m.id === messageId);
    if (msg?.context) {
      setShowContextPanel(true);
    }
  };
  
  return (
    <div className="flex h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-slate-700/70 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg blur opacity-50 animate-pulse"></div>
                <div className="relative p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-md">
                  <Bot size={24} className="text-teal-300" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-50 text-lg leading-tight flex items-center">
                  {assistantName}
                  <Zap size={16} className="ml-2 text-teal-400 animate-pulse" />
                </h3>
                <p className="text-slate-400 text-xs leading-tight">
                  Clinical Assistant {isCarePlanMode && (
                    <span className="ml-1 px-2 py-0.5 bg-teal-900/40 text-teal-300 rounded-full text-[10px] font-medium border border-teal-700/50">
                      Care Plan Mode
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedMessage && selectedMessage.context && (
                <button
                  onClick={() => setShowContextPanel(!showContextPanel)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showContextPanel 
                      ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-md glow-sky-500' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-700 hover:border-slate-600'
                  }`}
                  aria-label={showContextPanel ? "Hide Context Panel" : "Show Context Panel"}
                  title={showContextPanel ? "Hide Context Panel" : "Show Context Panel"}
                >
                  {showContextPanel ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area - Fixed height with scroll */}
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-slate-950 to-slate-900">
          <div 
            ref={messageContainerRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto styled-scrollbar-dark p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
                    <div className="relative p-4 bg-slate-800 border border-slate-700 rounded-full shadow-md">
                      <MessageSquare size={32} className="text-teal-300" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">Start a Conversation</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    Ask me anything about the patient's care plan. I'm here to help!
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                onClick={() => handleMessageClick(msg.id)}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] group cursor-pointer`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border border-slate-600 shadow-lg">
                        <Bot size={20} className="text-teal-300" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`relative rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-sky-600 to-sky-700 text-white border border-sky-500/50'
                        : 'bg-gradient-to-br from-slate-800 to-slate-850 text-slate-100 border border-slate-700/80'
                    }`}
                  >
                    {/* Message header */}
                    <div className={`flex items-center justify-between px-4 pt-3 pb-1 border-b ${
                      msg.role === 'user' ? 'border-sky-500/30' : 'border-slate-700/50'
                    }`}>
                      <span className={`font-semibold text-sm ${
                        msg.role === 'user' ? 'text-sky-100' : 'text-teal-300'
                      }`}>
                        {msg.role === 'user' ? userName : assistantName}
                      </span>
                      <span className={`text-xs ${
                        msg.role === 'user' ? 'text-sky-200' : 'text-slate-400'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message content */}
                    <div className="px-4 py-3">
                      {msg.isLoading ? (
                        <div className="flex items-center space-x-2 py-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-150"></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse animation-delay-300"></div>
                        </div>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-pre:my-2 prose-blockquote:my-2">
                          <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p {...props} className="whitespace-pre-wrap leading-relaxed" />,
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="my-2 bg-slate-950 rounded-lg border border-slate-700/80 overflow-hidden shadow-inner">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-850 text-xs text-slate-400 border-b border-slate-700/50">
                                      <span className="font-medium flex items-center">
                                        <FileText size={12} className="mr-1.5" />
                                        {match[1]}
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                        }}
                                        className="p-1 hover:text-sky-300 rounded transition-colors"
                                        title="Copy code"
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                    <pre className="p-3 !bg-slate-950 !text-slate-200 styled-scrollbar-dark overflow-x-auto">
                                      <code className={`!bg-transparent !text-inherit ${className}`} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className={`py-0.5 px-1.5 rounded-md bg-slate-800/70 border border-slate-700/50 text-sky-300 ${className}`} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Context indicator */}
                      {msg.context && msg.context.sources && msg.context.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <div className="flex items-center text-xs text-slate-400">
                            <BookOpen size={13} className="mr-1.5 text-sky-400" />
                            <span>{msg.context.sources.length} sources available</span>
                            <ArrowRight size={12} className="ml-1 opacity-50" />
                          </div>
                        </div>
                      )}

                      {/* Final Reasoning Display - Accordion */}
                      {msg.role === 'assistant' && msg.reasoning && !msg.isLoading && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedReasoning(prev => ({ ...prev, [msg.id]: !prev[msg.id] }));
                            }}
                            className="flex items-center justify-between w-full text-left hover:bg-slate-800/30 rounded-lg p-2 transition-colors"
                          >
                            <div className="flex items-center text-xs text-teal-400">
                              <Brain size={14} className="mr-1.5" />
                              <span className="font-medium">Clinical Reasoning Process</span>
                            </div>
                            {expandedReasoning[msg.id] ? <ChevronUp size={14} className="text-teal-400" /> : <ChevronDown size={14} className="text-teal-400" />}
                          </button>
                          {expandedReasoning[msg.id] && (
                            <div className="mt-2 text-xs text-slate-300/90 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 max-h-64 overflow-y-auto styled-scrollbar-dark whitespace-pre-wrap font-mono">
                              <ReactMarkdown
                                components={{
                                  p: ({node, ...props}) => <p className="text-slate-300 mb-2" {...props} />,
                                  strong: ({node, ...props}) => <strong className="text-slate-100 font-semibold" {...props} />,
                                  ul: ({node, ...props}) => <ul className="text-slate-300 list-disc pl-5 mb-2 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="text-slate-300 list-decimal pl-5 mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                                  code: ({node, inline, ...props}: any) => 
                                    inline ? (
                                      <code className="bg-slate-800 text-pink-400 px-1 py-0.5 rounded-sm text-xs" {...props} />
                                    ) : (
                                      <pre className="bg-slate-900 rounded-md p-2 my-1 overflow-x-auto text-xs"><code {...props} /></pre>
                                    ),
                                }}
                              >
                                {msg.reasoning}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Actions */}
                      {!msg.isLoading && (msg.role === 'assistant' || onCopyMessage) && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {msg.role === 'assistant' && onFeedback && (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFeedback(msg.id, true);
                                }} 
                                className="p-1.5 text-slate-500 hover:text-emerald-400 rounded-md hover:bg-slate-700/50 transition-all"
                                title="Good response"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFeedback(msg.id, false);
                                }} 
                                className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-slate-700/50 transition-all"
                                title="Bad response"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </>
                          )}
                          {onCopyMessage && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopyMessage(msg.id);
                              }} 
                              className="p-1.5 text-slate-500 hover:text-sky-400 rounded-md hover:bg-slate-700/50 transition-all"
                              title="Copy message"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border border-slate-600 shadow-lg">
                        <User size={20} className="text-sky-300" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined Prompts */}
          {predefinedPrompts && predefinedPrompts.length > 0 && !inputText && messages.length === 0 && (
            <div className="p-4 bg-gradient-to-t from-slate-900 to-slate-950/50 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 mb-3 font-medium">Quick prompts to get started:</p>
              <div className="grid grid-cols-2 gap-2">
                {predefinedPrompts.slice(0, 6).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePredefinedPrompt(prompt)}
                    className="text-xs bg-gradient-to-br from-slate-800 to-slate-850 hover:from-slate-700 hover:to-slate-800 text-sky-300 hover:text-sky-200 px-3 py-2 rounded-lg border border-slate-700 hover:border-sky-600/50 transition-all duration-200 shadow-sm hover:shadow-md text-left"
                  >
                    <ArrowRight size={12} className="inline mr-1.5 opacity-60" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-850 p-4 border-t border-slate-700/70 shadow-top">
          <div className="relative flex items-end bg-gradient-to-br from-slate-800 to-slate-850 rounded-xl border border-slate-600/80 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all duration-200">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => { 
                setInputText(e.target.value); 
                adjustTextareaHeight(e); 
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              rows={1}
              className="flex-1 p-4 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none styled-scrollbar-dark text-sm max-h-[120px] leading-relaxed"
              aria-label="Chat input"
            />
            <div className="p-2 flex items-center space-x-2">
              {onRegenerate && messages.some(m => m.role === 'assistant' && !m.isLoading) && (
                <button
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className={`p-2 rounded-lg transition-all duration-150 ${
                    isGenerating
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-teal-300 hover:bg-slate-700/50'
                  }`}
                  title="Regenerate response"
                >
                  <RotateCw size={18} />
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isGenerating}
                className={`p-2.5 rounded-lg transition-all duration-150 flex items-center justify-center ${
                  !inputText.trim() || isGenerating
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white shadow-lg hover:shadow-xl glow-sky-500'
                }`}
                aria-label="Send message"
                title="Send message"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between items-center px-1">
            <div className="text-xs text-slate-500 flex items-center">
              {isCarePlanMode && (
                <Shield size={12} className="mr-1.5 text-teal-500" />
              )}
              <span>
                {isCarePlanMode ? "Clinical Assistant Mode" : "General Chat"}
                {isGenerating && (
                  <span className="ml-2 text-teal-400 animate-pulse">
                    <Clock size={12} className="inline mr-1" />
                    analyzing...
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel (Side Panel) */}
      {showContextPanel && selectedMessage && selectedMessage.context && (
        <div className="w-[320px] bg-gradient-to-b from-slate-900 to-slate-850 border-l border-slate-700/70 overflow-hidden flex flex-col animate-slide-in-right">
          <div className="p-4 border-b border-slate-700/70 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center">
                <BookOpen size={16} className="mr-2 text-sky-400" /> 
                Context & Sources
              </h4>
              <button 
                onClick={() => {
                  setShowContextPanel(false); 
                  setSelectedMessageId(null);
                }} 
                title="Close context panel" 
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto styled-scrollbar-dark p-4">
            {selectedMessage.context.sources && selectedMessage.context.sources.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-sky-300 mb-2 tracking-wider uppercase flex items-center">
                  <Zap size={12} className="mr-1.5" />
                  Evidence Sources
                </h5>
                <div className="space-y-2">
                  {selectedMessage.context.sources.map((source, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-850 p-3 rounded-lg border border-slate-700/70 hover:border-slate-600 transition-colors">
                      <strong className="text-slate-200 block mb-1 font-medium text-sm">
                        {source.title}
                      </strong>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {source.content}
                      </p>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sky-400 hover:text-sky-300 hover:underline text-xs mt-2 inline-flex items-center"
                        >
                          Learn more 
                          <ArrowRight size={10} className="ml-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMessage.context.metadata && Object.keys(selectedMessage.context.metadata).length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-sky-300 mb-2 tracking-wider uppercase">
                  Metadata
                </h5>
                <pre className="text-[11px] text-slate-400 bg-gradient-to-br from-slate-800 to-slate-850 p-3 rounded-lg border border-slate-700/70 styled-scrollbar-dark overflow-auto">
                  {JSON.stringify(selectedMessage.context.metadata, null, 2)}
                </pre>
              </div>
            )}
            
            {(!selectedMessage.context.sources || selectedMessage.context.sources.length === 0) && 
             (!selectedMessage.context.metadata || Object.keys(selectedMessage.context.metadata).length === 0) && (
              <div className="text-center py-8">
                <BookOpen size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-xs text-slate-500 italic">
                  No additional context available for this message.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .styled-scrollbar-dark::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        
        /* Tailwind Prose Overrides for Markdown */
        .prose-invert code::before, .prose-invert code::after { content: "" !important; }
        .prose-invert code {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 0.1em 0.3em;
          margin: 0 0.05em;
          font-size: 0.85em;
          border-radius: 0.25rem;
          border: 1px solid #334155;
        }
        .prose-invert pre {
          background-color: #0f172a !important;
          color: #cbd5e1 !important;
          padding: 0 !important;
          border-radius: 0.3rem !important;
          overflow-x: visible !important;
          border: none !important;
          box-shadow: none !important;
        }
        .prose-invert pre code {
          background-color: transparent !important;
          color: inherit !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          font-size: 0.85em !important;
          line-height: 1.6 !important;
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0.7; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }

        .shadow-top {
          box-shadow: 0 -4px 12px -2px rgba(0, 0, 0, 0.15), 0 -2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .shadow-top-sm {
          box-shadow: 0 -2px 6px -1px rgba(0,0,0,0.1), 0 -1px 3px -1px rgba(0,0,0,0.08);
        }

        /* Electric Glows */
        .glow-sky-500 { box-shadow: 0 0 8px 1.5px rgba(14, 165, 233, 0.3); }
        .glow-teal-500 { box-shadow: 0 0 8px 1.5px rgba(20, 184, 166, 0.3); }
      `}</style>
    </div>
  );
};

export default ChatInterface;
