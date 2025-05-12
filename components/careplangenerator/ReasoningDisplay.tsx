"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Interface for ReactMarkdown code component props
interface CodeRendererProps {
  node?: any; 
  inline?: boolean;
  className?: string;
  children?: React.ReactNode; 
  [key: string]: any; 
}

export interface ReasoningStage {
  stageName: string;
  accordionTitle: string;
  reasoningMarkdown: string | null;
  isComplete: boolean;
  isLoading: boolean; 
  error?: string | null; 
  onTypingComplete?: () => void; 
}

interface ReasoningDisplayProps {
  reasoningStages: ReasoningStage[];
  overallIsLoading?: boolean; 
  onStageTypingComplete?: (stageName: string) => void; 
}

// Internal component to handle typing animation for a single stage's reasoning
const TypedReasoningContent: React.FC<{
  markdownContent: string | null;
  isLoading: boolean; // Prop to know if the stage itself is loading new data
  error?: string | null;
  onComplete?: () => void;
}> = ({ markdownContent, isLoading, error, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const prevMarkdownContentRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Check if content is coming from stream chunks
    const isStreamedContent = markdownContent && markdownContent.includes("\n");

    // For streamed content, just display it without typing animation
    if (isStreamedContent && markdownContent !== prevMarkdownContentRef.current && !error) {
      // Show the content immediately without animation for streamed content
      setDisplayedText(markdownContent);
      setShowCursor(false);
      prevMarkdownContentRef.current = markdownContent;

      // Call onComplete for streamed content when it's fully received
      // We can detect this when isLoading is false and we have content
      if (!isLoading && onComplete) {
        onComplete();
      }
      return;
    }

    // Only start typing if markdownContent is newly provided, not a streamed update, and valid
    if (markdownContent && markdownContent !== prevMarkdownContentRef.current && !isLoading && !error) {
      setDisplayedText(""); // Reset for fresh typing
      setShowCursor(true);  // Show cursor when typing starts
      prevMarkdownContentRef.current = markdownContent; // Store current content to prevent re-typing same content
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < markdownContent.length) {
          setDisplayedText(prev => markdownContent.substring(0, i + 1)); // Use substring on the full content
          i++;
        } else {
          clearInterval(typingInterval);
          setShowCursor(false); // Hide cursor when typing is done
          if (onComplete) {
            onComplete();
          }
        }
      }, 20); // Typing speed

      return () => {
        clearInterval(typingInterval);
        setShowCursor(false);
      };
    } else if (!markdownContent || isLoading || error) {
      // If content is removed, or stage is loading/erroring, clear displayed text and hide cursor
      setDisplayedText("");
      setShowCursor(false);
      if (!markdownContent) { // If content is explicitly removed, allow re-typing if it comes back
        prevMarkdownContentRef.current = null;
      }
    }
  }, [markdownContent, isLoading, error, onComplete]);

  if (error) {
    return <p className="text-red-400">Error in this stage: {error}</p>;
  }

  // Show loading indicator if the stage is loading AND there's no markdown yet (or it's being reset)
  if (isLoading && displayedText === "") { 
    return (
      <div className="flex items-center text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Processing reasoning for this stage...</span>
      </div>
    );
  }
  
  // If no content, not loading, and no error (e.g., initial state before content arrives)
  if (!markdownContent && !isLoading && !error && displayedText === "") {
     return <p className="italic text-slate-500">No reasoning content yet for this stage.</p>;
  }

  return (
    <>
      <ReactMarkdown
        components={{ 
          p: ({node, ...props}) => <p className="text-slate-300" {...props} />,
          strong: ({node, ...props}) => <strong className="text-slate-100" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-slate-100" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-slate-100" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-slate-100" {...props} />,
          ul: ({node, ...props}) => <ul className="text-slate-300" {...props} />,
          ol: ({node, ...props}) => <ol className="text-slate-300" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
          code: ({ node, inline, className, children, ...props }: CodeRendererProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-slate-900 rounded-md p-3 my-2 overflow-x-auto"><code className={`language-${match[1]}`} {...props}>{children}</code></pre>
            ) : (
              <code className="bg-slate-600 text-pink-400 px-1 py-0.5 rounded-sm" {...props}>{children}</code>
            );
          },
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-500 pl-3 italic text-slate-400" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300" {...props} />,
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {showCursor && <span className="animate-ping ml-1">|</span>}
    </>
  );
};

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  reasoningStages = [],
  overallIsLoading = false,
  onStageTypingComplete, 
}) => {

  if (overallIsLoading && reasoningStages.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-300 bg-slate-800 border border-slate-700">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Brain className="h-10 w-10 text-blue-400 animate-pulse" />
          <p className="font-medium text-slate-100">Initializing AI reasoning process...</p>
          <p className="text-sm text-slate-400">Preparing for multi-stage generation.</p>
        </div>
      </Card>
    );
  }

  if (!overallIsLoading && reasoningStages.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-400 bg-slate-800 border border-slate-700">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Brain className="h-12 w-12 opacity-30 text-slate-500" />
          <p className="text-slate-400">No reasoning available yet. Generate a care plan to see the AI's thought process.</p>
        </div>
      </Card>
    );
  }

  let defaultAccordionValue = "";
  if (reasoningStages.length > 0) {
    const firstLoadingStage = reasoningStages.find(s => s.isLoading && !s.isComplete);
    if (firstLoadingStage) {
      defaultAccordionValue = firstLoadingStage.stageName;
    } else {
      const lastCompletedStage = [...reasoningStages].reverse().find(s => s.isComplete && !s.error);
      if (lastCompletedStage) {
        defaultAccordionValue = lastCompletedStage.stageName;
      } else {
        defaultAccordionValue = reasoningStages[0].stageName; 
      }
    }
  }

  return (
    <Card className="shadow-xl border border-slate-700 bg-slate-800 text-slate-100">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-xl font-semibold text-slate-100 flex items-center">
          <Brain size={22} className="mr-2 text-blue-400" />
          AI Clinical Reasoning (Multi-Stage)
        </CardTitle>
        <p className="text-sm text-slate-400">
          The AI's thought process is broken down into sequential stages.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          {reasoningStages.map((stage, index) => (
            <AccordionItem value={stage.stageName} key={stage.stageName || index} className="border-b border-slate-700 last:border-b-0">
              <AccordionTrigger className="text-base hover:no-underline py-4 px-2 text-slate-100 hover:bg-slate-700/50 rounded-md">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{stage.accordionTitle || `Stage ${index + 1}`}</span>
                  {stage.isLoading && !stage.isComplete && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
                  {stage.isComplete && !stage.error && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                  {stage.error && <AlertCircle className="h-5 w-5 text-red-400" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-1">
                <div className="prose prose-sm max-w-none text-slate-300 bg-slate-700/70 p-4 rounded-md border border-slate-600 max-h-[40vh] overflow-y-auto styled-scrollbar min-h-[5em]">
                  <TypedReasoningContent
                    markdownContent={stage.reasoningMarkdown}
                    isLoading={stage.isLoading}
                    error={stage.error}
                    onComplete={() => {
                      if (stage.onTypingComplete) {
                        stage.onTypingComplete();
                      }
                      if (onStageTypingComplete) {
                        onStageTypingComplete(stage.stageName);
                      }
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ReasoningDisplay;
