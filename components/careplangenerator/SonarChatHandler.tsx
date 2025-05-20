"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Brain } from 'lucide-react';
import CarePlanChat from './CarePlanChat';
import LoadingSpinner from './LoadingSpinner';
import ReasoningDisplay, { ReasoningStage } from './ReasoningDisplay';
import { getPerplexityResponse, processReasoningMarkdown } from '@/services/perplexityService';

interface SonarChatHandlerProps {
  carePlanData: any;
}

const SonarChatHandler: React.FC<SonarChatHandlerProps> = ({
  carePlanData
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messageInProgress, setMessageInProgress] = useState<string | null>(null);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [reasoningStages, setReasoningStages] = useState<ReasoningStage[]>([]);
  const [isReasoningPanelOpen, setIsReasoningPanelOpen] = useState(true);
  
  // Function to update the CarePlanChat component with streaming content
  const updateMessage = (messageId: string, content: string, reasoning: string | null = null) => {
    // Update the chat interface
    const chatEvent = new CustomEvent('chat-update', {
      detail: {
        messageId,
        content,
        reasoning,
        isComplete: false
      }
    });
    document.dispatchEvent(chatEvent);
    
    // Update reasoning display
    if (reasoning) {
      setReasoningStages([
        {
          stageName: 'sonar-reasoning',
          accordionTitle: 'AI Clinical Reasoning',
          reasoningMarkdown: reasoning,
          isComplete: false,
          isLoading: true
        }
      ]);
    }
  };
  
  const completeMessage = (messageId: string, content: string, reasoning: string | null = null) => {
    // Update the chat interface
    const chatEvent = new CustomEvent('chat-update', {
      detail: {
        messageId,
        content,
        reasoning,
        isComplete: true
      }
    });
    document.dispatchEvent(chatEvent);
    
    // Update reasoning display
    if (reasoning) {
      setReasoningStages([
        {
          stageName: 'sonar-reasoning',
          accordionTitle: 'AI Clinical Reasoning',
          reasoningMarkdown: reasoning,
          isComplete: true,
          isLoading: false
        }
      ]);
    }
  };

  // Convert care plan data to system prompt
  const generateSystemPrompt = (data: any): string => {
    let prompt = `You are RON AI, a clinical assistant helping with care plans. 
    
Here's the current patient information:
`;

    if (data.patientInfo) {
      const { name, age, gender, primaryDiagnosis, secondaryDiagnoses } = data.patientInfo;
      prompt += `- Name: ${name || 'Unknown'}\n`;
      prompt += `- Age: ${age || 'Unknown'}\n`;
      prompt += `- Gender: ${gender || 'Unknown'}\n`;
      prompt += `- Primary Diagnosis: ${primaryDiagnosis || 'Unknown'}\n`;
      
      if (secondaryDiagnoses && secondaryDiagnoses.length > 0) {
        prompt += `- Secondary Diagnoses: ${secondaryDiagnoses.join(', ')}\n`;
      }
    }

    if (data.nursingDiagnoses && data.nursingDiagnoses.length > 0) {
      prompt += `\nCurrent nursing diagnoses:\n`;
      data.nursingDiagnoses.forEach((diagnosis: any, index: number) => {
        prompt += `${index + 1}. ${diagnosis.title}\n`;
        if (diagnosis.interventions && diagnosis.interventions.length > 0) {
          prompt += `   Interventions: ${diagnosis.interventions.map((i: any) => i.title).join(', ')}\n`;
        }
      });
    }

    prompt += `\nWhen responding to questions about this care plan:
1. Be clinically precise and use professional terminology
2. Reference evidence-based practice when appropriate
3. Consider the patient's specific situation and diagnoses
4. Structure your responses clearly with markdown formatting
5. Use your reasoning process to analyze clinical information before responding

You MUST use <think> tags to show your reasoning process before providing your final answer.`;

    return prompt;
  };

  // Handler to send message to Sonar Reasoning Pro API
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Store the message ID to track updates
      const messageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCurrentMessageId(messageId);
      setMessageInProgress(message);
      setStreamingContent('');
      setStreamingReasoning('');
      
      // Show loading state with initial reasoning
      setReasoningStages([
        {
          stageName: 'sonar-reasoning',
          accordionTitle: 'AI Clinical Reasoning',
          reasoningMarkdown: 'Analyzing patient data and clinical guidelines...',
          isComplete: false,
          isLoading: true
        }
      ]);
      
      // Prepare system prompt
      const systemPrompt = generateSystemPrompt(carePlanData);
      
      // Make the API call
      const response = await getPerplexityResponse(
        message,
        'sonar-reasoning-pro',
        systemPrompt
      );
      
      // Process the response
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Extract reasoning and content
      const reasoning = response.reasoningMarkdown;
      const content = response.jsonData ? 
        JSON.stringify(response.jsonData, null, 2) : 
        response.rawResponse.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      
      // Update reasoning display
      setStreamingReasoning(reasoning);
      setReasoningStages([
        {
          stageName: 'sonar-reasoning',
          accordionTitle: 'AI Clinical Reasoning',
          reasoningMarkdown: reasoning,
          isComplete: true,
          isLoading: false
        }
      ]);
      
      // Update chat interface
      setStreamingContent(content);
      completeMessage(messageId, content, reasoning);
      setCurrentMessageId(null);
      setMessageInProgress(null);
      
      // Return the content for the chat interface
      return content;
      
    } catch (error: any) {
      console.error('Error in Sonar API call:', error);
      
      // Update reasoning display with error
      setReasoningStages([
        {
          stageName: 'sonar-reasoning',
          accordionTitle: 'AI Clinical Reasoning',
          reasoningMarkdown: 'Error in processing: ' + (error.message || 'Unknown error'),
          isComplete: true,
          isLoading: false,
          error: error.message || 'Unknown error'
        }
      ]);
      
      // Clean up state
      setCurrentMessageId(null);
      setMessageInProgress(null);
      
      return "I encountered an error while processing your request. Please try again.";
    }
  };

  return (
    <div className="relative">
      {/* Reasoning Panel */}
      {streamingReasoning && (
        <div className="fixed bottom-24 right-24 w-96 z-40">
          <ReasoningDisplay 
            reasoningStages={reasoningStages}
            overallIsLoading={!!messageInProgress}
          />
        </div>
      )}
      
      {/* Loading Spinner - only show if no reasoning is being displayed */}
      {messageInProgress && !streamingReasoning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <LoadingSpinner message={`Processing: "${messageInProgress.substring(0, 30)}${messageInProgress.length > 30 ? '...' : ''}"`} />
        </div>
      )}
      <div 
        className={`fixed right-0 top-1/4 transform transition-transform duration-300 z-30
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'}`}
      >
        <div className="flex h-full">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-4 rounded-l-lg border-l border-t border-b border-slate-600 flex items-center shadow-lg"
            aria-label={isPanelOpen ? "Close chat panel" : "Open chat panel"}
          >
            {isPanelOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div className={`w-96 bg-slate-900 border-l border-t border-b border-slate-700 rounded-l-lg shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isPanelOpen ? 'w-96' : 'w-0'}`}>
            <CarePlanChat 
              carePlanData={carePlanData}
              onSendToChatbot={handleSendMessage}
              defaultOpen={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SonarChatHandler;
