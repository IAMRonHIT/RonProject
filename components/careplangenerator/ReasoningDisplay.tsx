"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2 } from 'lucide-react';

// Interface for CodeRendererProps (used by ReactMarkdown in TypedReasoningContent)
interface CodeRendererProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// Interface for TypedReasoningContent
interface TypedReasoningContentProps {
  markdownContent: string | null;
  isTypingActive: boolean;
  onTypingComplete?: () => void;
  typingSpeed?: number;
}

// TypedReasoningContent component (for animated text display)
const TypedReasoningContent: React.FC<TypedReasoningContentProps> = ({
  markdownContent,
  isTypingActive,
  onTypingComplete,
  typingSpeed = 20, // Default typing speed
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const charIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTypingActive && markdownContent) {
      charIndexRef.current = 0;
      setDisplayedContent(''); 

      const interval = 1000 / typingSpeed;

      timerRef.current = setInterval(() => {
        if (charIndexRef.current < markdownContent.length) {
          setDisplayedContent(prev => prev + markdownContent[charIndexRef.current]);
          charIndexRef.current++;
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          if (onTypingComplete) onTypingComplete();
        }
      }, interval);
    } else if (!isTypingActive && markdownContent) {
      setDisplayedContent(markdownContent);
      if (onTypingComplete) onTypingComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [markdownContent, isTypingActive, onTypingComplete, typingSpeed]);

  if (!markdownContent && isTypingActive) {
    return <p className="italic text-slate-500">Preparing reasoning...</p>;
  }
  if (!markdownContent && !isTypingActive) {
    return <p className="italic text-slate-500">No reasoning content available.</p>;
  }

  return (
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
            <pre className="bg-slate-950 rounded-md p-3 my-2 overflow-x-auto"><code className={`language-${match[1]}`} {...props}>{children}</code></pre>
          ) : (
            <code className="bg-slate-700 text-pink-400 px-1 py-0.5 rounded-sm text-sm" {...props}>{children}</code>
          );
        },
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-3 italic text-slate-400 my-2" {...props} />,
        a: ({node, ...props}) => <a className="text-sky-400 hover:text-sky-300 hover:underline" {...props} />,
      }}
    >
      {displayedContent}
    </ReactMarkdown>
  );
};

// Interface for ReasoningDisplay: Relies on initialMarkdownContent
interface ReasoningDisplayProps {
  initialMarkdownContent: string | null; // Content is passed directly
  onComplete?: () => void;
  title?: string;
}

// Main ReasoningDisplay component: Displays content from initialMarkdownContent prop
const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  initialMarkdownContent,
  onComplete,
  title = "AI Clinical Reasoning Process",
}) => {
  // State for the content to be displayed by TypedReasoningContent
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  // isLoading is true initially or if content is explicitly being processed (not just passed)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // For any errors in processing content

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (initialMarkdownContent !== undefined && initialMarkdownContent !== null) {
      setCurrentContent(initialMarkdownContent);
      setIsLoading(false); // Content is ready
    } else {
      // If initialMarkdownContent is null or undefined, treat as no content or an error
      setCurrentContent(null);
      // Optionally set an error if content is strictly expected but null
      // setError("No reasoning content provided."); 
      setIsLoading(false); // No fetching, so loading is done
    }
  }, [initialMarkdownContent]); // Re-run when initialMarkdownContent changes

  return (
    <Card className="w-full max-w-3xl mx-auto bg-slate-900 border-slate-700 shadow-xl shadow-sky-900/20 my-6">
      <CardHeader className="border-b border-slate-700/70 pb-4">
        <CardTitle className="flex items-center text-sky-300 text-xl">
          <Brain size={24} className="mr-3 text-sky-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 min-h-[300px] max-h-[60vh] overflow-y-auto styled-scrollbar-dark">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 size={40} className="animate-spin mb-4 text-sky-500" />
            <p className="text-lg">Processing Content...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <p className="text-lg font-semibold">Error Displaying Reasoning</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && currentContent !== null && (
          <TypedReasoningContent
            markdownContent={currentContent}
            isTypingActive={true} 
            onTypingComplete={onComplete} 
            typingSpeed={20} 
          />
        )}
        {/* Case where content is explicitly null after loading/processing, or was null initially */}
        {!isLoading && !error && currentContent === null && (
           <p className="italic text-slate-500 text-center py-10">No reasoning content to display.</p>
        )}
      </CardContent>
      {/* Global styles for custom scrollbar, if needed elsewhere, move to a global CSS file */}
      <style jsx global>{`
        .styled-scrollbar-dark::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 4px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background-color: #1f2937; }
      `}</style>
    </Card>
  );
};

export default ReasoningDisplay;
