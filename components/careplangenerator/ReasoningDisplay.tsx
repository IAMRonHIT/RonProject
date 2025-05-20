"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from 'lucide-react';

interface CodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const TypedReasoningContent: React.FC<{
  markdownContent: string | null;
  isTypingActive: boolean; // Renamed from isLoading to be more specific
  onTypingComplete?: () => void;
}> = ({ markdownContent, isTypingActive, onTypingComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const prevMarkdownContentRef = useRef<string | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval when props change
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (isTypingActive && markdownContent && markdownContent !== prevMarkdownContentRef.current) {
      setDisplayedText(""); 
      setShowCursor(true);
      prevMarkdownContentRef.current = markdownContent;
      let i = 0;
      typingIntervalRef.current = setInterval(() => {
        if (i < markdownContent.length) {
          setDisplayedText(markdownContent.substring(0, i + 1));
          i++;
        } else {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          setShowCursor(false);
          if (onTypingComplete) {
            onTypingComplete();
          }
        }
      }, 20); // Typing speed
    } else if (!isTypingActive && markdownContent) {
      // If not typing active, but content exists, show it all at once
      setDisplayedText(markdownContent);
      setShowCursor(false);
      prevMarkdownContentRef.current = markdownContent;
    } else if (!markdownContent) {
      setDisplayedText("");
      setShowCursor(false);
      prevMarkdownContentRef.current = null;
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [markdownContent, isTypingActive, onTypingComplete]);

  if (isTypingActive && displayedText === "" && markdownContent) {
    return (
      <div className="flex items-center text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Simulating AI thought process...</span>
      </div>
    );
  }

  if (!markdownContent && !isTypingActive) {
     return <p className="italic text-slate-500">Reasoning will appear here once simulation starts.</p>;
  }

  return (
    <>
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => <p className="text-slate-300 mb-2" {...props} />,
          strong: ({node, ...props}) => <strong className="text-slate-100 font-semibold" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-slate-100 text-2xl font-semibold my-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-slate-100 text-xl font-semibold my-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-slate-100 text-lg font-semibold my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="text-slate-300 list-disc pl-5 mb-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="text-slate-300 list-decimal pl-5 mb-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
          code: ({ node, inline, className, children, ...props }: CodeRendererProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-slate-900 rounded-md p-3 my-2 overflow-x-auto"><code className={`language-${match[1]}`} {...props}>{children}</code></pre>
            ) : (
              <code className="bg-slate-600 text-pink-400 px-1 py-0.5 rounded-sm text-sm" {...props}>{children}</code>
            );
          },
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-500 pl-3 italic text-slate-400 my-2" {...props} />,
          a: ({node, ...props}) => <a className="text-sky-400 hover:text-sky-300 hover:underline" {...props} />,
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {showCursor && <span className="animate-ping ml-1">|</span>}
    </>
  );
};

interface ReasoningDisplayProps {
  markdownContent: string | null;
  isSimulating: boolean; 
  onSimulationComplete?: () => void;
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  markdownContent,
  isSimulating,
  onSimulationComplete,
}) => {
  // This state helps manage the "typing active" phase internally
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isSimulating && markdownContent) {
      setIsTyping(true);
    } else if (!isSimulating) {
      setIsTyping(false);
    }
  }, [isSimulating, markdownContent]);

  const handleInternalTypingComplete = () => {
    setIsTyping(false); // Typing is done
    if (onSimulationComplete) {
      onSimulationComplete(); // Notify parent that the simulation step (typing) is complete
    }
  };
  
  // Do not render the card if not simulating and no content yet (e.g. initial state of page)
  if (!isSimulating && !markdownContent) {
      return null;
  }

  return (
    <Card className="shadow-xl border border-slate-700 bg-slate-800 text-slate-100 my-6">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-xl font-semibold text-slate-100 flex items-center">
          <Brain size={22} className="mr-2 text-sky-400" />
          Clinical Reasoning Process
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="prose prose-sm max-w-none text-slate-300 bg-slate-700/70 p-4 rounded-md border border-slate-600 min-h-[10em] max-h-[60vh] overflow-y-auto styled-scrollbar">
          {/* Show loader only if isSimulating is true but markdownContent hasn't arrived yet for TypedReasoningContent to start */}
          {isSimulating && !markdownContent && (
            <div className="flex items-center text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading reasoning text...</span>
            </div>
          )}
          {/* TypedReasoningContent will handle its own "Simulating AI thought process..." if markdownContent is present and isTyping is true */}
          {(markdownContent || isTyping) && ( // Render TypedReasoningContent if there's content or if it's supposed to be typing
            <TypedReasoningContent
              markdownContent={markdownContent}
              isTypingActive={isTyping} 
              onTypingComplete={handleInternalTypingComplete}
            />
          )}
          {/* Fallback if not simulating, no content, but somehow card is rendered (should be caught by earlier null return) */}
          {!isSimulating && !markdownContent && (
             <p className="italic text-slate-500">Reasoning will appear here.</p>
          )}
        </div>
      </CardContent>
       <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: #1e293b; /* slate-800 */ border-radius: 4px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; /* slate-600 */ border-radius: 4px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; /* slate-500 */ }
      `}</style>
    </Card>
  );
};

export default ReasoningDisplay;
