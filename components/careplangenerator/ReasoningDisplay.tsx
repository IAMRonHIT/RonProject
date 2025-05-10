"use client";

import React, { useState, useEffect, useRef } from 'react'; // Added useRef import
import ReactMarkdown from 'react-markdown'; // Ensure react-markdown is installed
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react'; // Added Loader2 for thinking indicator

interface ReasoningDisplayProps {
  liveReasoningText?: string; // For live streaming text
  finalReasoningMarkdown?: string | null; // For final formatted markdown
  isLoading?: boolean; // True while waiting for final_reasoning/final_json
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  liveReasoningText = "", // Default to empty string
  finalReasoningMarkdown = null, // Default to null
  isLoading = false,
}) => {
  // The text to render is finalReasoningMarkdown if available, otherwise liveReasoningText.
  // Default to an empty string if both are null/empty to prevent ReactMarkdown errors.
  const contentToRenderAsMarkdown = finalReasoningMarkdown || liveReasoningText || "";

  // Conditional Rendering Logic
  if (isLoading && !contentToRenderAsMarkdown) {
    // If loading but no content yet, show initial loading spinner
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

  // If not loading and there's no text to render at all
  if (!isLoading && !contentToRenderAsMarkdown) {
    return (
      <Card className="p-6 text-center text-gray-500 bg-gray-50">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Brain className="h-12 w-12 opacity-30" />
          <p>No reasoning available yet. Generate a care plan to see the AI's thought process.</p>
        </div>
      </Card>
    );
  }

  // Main return when there is content or loading with content
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
      
      <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[60vh] overflow-y-auto">
        {contentToRenderAsMarkdown ? (
          <ReactMarkdown>{contentToRenderAsMarkdown}</ReactMarkdown>
        ) : (
          // Show a generic loading message if isLoading is true and there's no content yet
          // This state is mostly covered by the isLoading && !contentToRenderAsMarkdown block above,
          // but as a fallback within this div:
          isLoading && <span className="italic text-gray-400">Receiving reasoning data...</span>
        )}
        {/* Typing cursor and thinking indicator have been removed for simplification */}
      </div>
    </Card>
  );
};

export default ReasoningDisplay;
