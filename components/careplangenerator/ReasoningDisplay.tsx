"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown'; // Ensure react-markdown is installed
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react'; // Brain icon for placeholder

interface ReasoningDisplayProps {
  streamingContent?: string;
  isLoading?: boolean;
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  streamingContent = '',
  isLoading = false,
}) => {
  if (isLoading && !streamingContent) {
    // If loading but no content yet, show a simple loading message or spinner
    return (
      <Card className="p-6 text-center text-gray-700 bg-gray-50">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Brain className="h-10 w-10 text-blue-500 animate-pulse" />
          <p className="font-medium">AI is processing the clinical reasoning...</p>
          <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      </Card>
    );
  }

  if (!isLoading && !streamingContent) {
    return (
      <Card className="p-6 text-center text-gray-500 bg-gray-50">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Brain className="h-12 w-12 opacity-30" />
          <p>No reasoning available yet. Generate a care plan to see the AI's thought process.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg border border-gray-200 bg-white">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Brain size={22} className="mr-2 text-blue-600" />
          AI Clinical Reasoning
        </h2>
        <p className="text-sm text-gray-600">
          This section outlines the AI's thought process in developing the care plan.
        </p>
      </div>
      
      <div className="prose prose-sm sm:prose lg:prose-base max-w-none text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[60vh] overflow-y-auto">
        {/* 
          Render streaming content using ReactMarkdown.
          Using standard `prose` for dark text on light background.
          Adjusted sizes for better fit in a standard UI.
        */}
        {streamingContent && (
          <ReactMarkdown>{streamingContent}</ReactMarkdown>
        )}
        
        {isLoading && streamingContent && ( // Show "continuing" only if there's already some content
          <div className="mt-4 text-center animate-pulse text-blue-600 text-sm">
            Continuing analysis...
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReasoningDisplay;
