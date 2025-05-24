"use client";

import React, { useState } from 'react';
import CarePlanTemplate from '@/components/careplangenerator/careplan-template';
import PatientDataForm from '@/components/careplangenerator/PatientDataForm';
import ReasoningDisplay from '@/components/careplangenerator/ReasoningDisplay';
import { Loader2 } from 'lucide-react';

type WorkflowStep = 'form' | 'reasoning' | 'carePlan';

const CarePlanGeneratorPage = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('form');
  const [submittedFormData, setSubmittedFormData] = useState<any>(null); // To store the actual form inputs if needed
  const [fetchedCarePlanData, setFetchedCarePlanData] = useState<any>(null); // To store john-smith-careplan.json content
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const [grokReasoningStreamContent, setGrokReasoningStreamContent] = useState<string>('');
  const [fullGrokReasoningContent, setFullGrokReasoningContent] = useState<string | null>(null);
  const [isStreamingGrokReasoning, setIsStreamingGrokReasoning] = useState<boolean>(false);
  const [grokStreamingError, setGrokStreamingError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: any) => {
    setIsLoadingForm(true);
    setSubmittedFormData(formData); // Store data from the form
    
    setCurrentStep('reasoning');
    setGrokReasoningStreamContent('');
    setFullGrokReasoningContent(null);
    setGrokStreamingError(null);
    setIsStreamingGrokReasoning(true);

    try {
      // 1. Fetch the patient JSON data (e.g., john-smith-careplan.json)
      const patientJsonResponse = await fetch('/data/john-smith-careplan.json');
      if (!patientJsonResponse.ok) {
        throw new Error(`Failed to fetch base care plan JSON: ${patientJsonResponse.statusText}`);
      }
      const baseCarePlanData = await patientJsonResponse.json();
      setFetchedCarePlanData(baseCarePlanData); // Store for passing to CarePlanTemplate

      // 2. Construct the prompt for Grok with embedded JSON
      const combinedPromptForGrok = `You're Ron of Ron AI, please review the following plan of care, reason over how you will seek prior authorizations for the correct services, handle transitions of care, make sure the correct lab and diagnostic imaging occurs, and that you're effectively discharge planning. Leverage the nursing care plan to guide you.

${JSON.stringify(baseCarePlanData, null, 2)}`;

      // 3. Call /api/grok-chat with the combined prompt (using messages array format)
      const grokApiResponse = await fetch('/api/grok-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [
            {
              role: 'user',
              content: combinedPromptForGrok
            }
          ],
          stream: true,
          temperature: 0.7,
          reasoning_effort: "high"
        })
      });

      if (!grokApiResponse.ok) {
        const errorText = await grokApiResponse.text();
        throw new Error(`Grok API request failed: ${grokApiResponse.statusText} - ${errorText}`);
      }

      if (!grokApiResponse.body) {
        throw new Error('Grok API response has no body.');
      }

      // 4. Handle streaming response (SSE format)
      const reader = grokApiResponse.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let finalAssistantContent = '';

      // Parse SSE stream
      let buffer = '';
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';  // Keep the last incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6); // Remove 'data: ' prefix
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              // Handle reasoning tokens
              if (data.choices?.[0]?.delta?.reasoning_content) {
                const reasoningChunk = data.choices[0].delta.reasoning_content;
                accumulatedReasoning += reasoningChunk;
                setGrokReasoningStreamContent(prev => prev + reasoningChunk);
              }
              
              // Handle regular content
              if (data.choices?.[0]?.delta?.content) {
                const contentChunk = data.choices[0].delta.content;
                accumulatedContent += contentChunk;
                finalAssistantContent += contentChunk;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      setFullGrokReasoningContent(accumulatedReasoning || accumulatedContent);
      setIsStreamingGrokReasoning(false); // Streaming finished before step change
      
      // Store Grok's response for chat interface
      if (fetchedCarePlanData) {
        fetchedCarePlanData.grokInitialResponse = finalAssistantContent;
        fetchedCarePlanData.grokReasoningContent = accumulatedReasoning;
      }
      
      setCurrentStep('carePlan'); // Transition after successful stream and content setting

    } catch (error: any) {
      console.error("Error in Grok reasoning process:", error);
      setGrokStreamingError(error.message || "An unexpected error occurred during AI reasoning.");
      setIsStreamingGrokReasoning(false);
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-slate-100">
        Interactive Care Plan Assistant
      </h1>
      
      <div className="w-full max-w-4xl flex-1 flex flex-col justify-start items-center overflow-y-auto min-h-0">
        {currentStep === 'form' && (
          <PatientDataForm 
            onSubmit={handleFormSubmit} 
            isLoading={isLoadingForm} 
          />
        )}

        {currentStep === 'reasoning' && (
          <div className="w-full">
            {(isStreamingGrokReasoning && !grokReasoningStreamContent && !grokStreamingError) && (
              <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                <Loader2 size={36} className="animate-spin mb-4 text-sky-500" />
                <p className="text-lg">Ron is thinking... preparing reasoning...</p>
                <p className="text-sm">This may take a moment.</p>
              </div>
            )}
            {grokStreamingError && (
              <div className="text-red-400 p-6 bg-red-900/30 rounded-lg w-full text-center">
                <p className="text-xl font-semibold mb-2">Error During AI Reasoning</p>
                <p className="text-sm">{grokStreamingError}</p>
              </div>
            )}
            {/* Display ReasoningDisplay once streaming starts or if there's content (even if streaming finished but error occurred after some content) */}
            {(grokReasoningStreamContent || (!isStreamingGrokReasoning && fullGrokReasoningContent)) && !grokStreamingError && (
              <ReasoningDisplay 
                initialMarkdownContent={grokReasoningStreamContent} // Continuously updated by stream
                title="Ron's Clinical Reasoning Process"
              />
            )}
          </div>
        )}

        {currentStep === 'carePlan' && fetchedCarePlanData && (
          <div className="w-full max-w-7xl">
            <CarePlanTemplate 
              data={fetchedCarePlanData} // Pass the fetched john-smith-careplan.json data
              initialTab="chat"
              initialReasoningContent={fullGrokReasoningContent} // Pass the completed Grok reasoning
              initialGrokResponse={fetchedCarePlanData.grokInitialResponse} // Pass Grok's initial response
              // You might also want to pass submittedFormData if CarePlanTemplate needs it for other purposes
            /> 
          </div>
        )}
        {/* Fallback if carePlan step is reached but fetchedCarePlanData is somehow null (should not happen with current logic) */}
        {currentStep === 'carePlan' && !fetchedCarePlanData && (
            <div className="text-red-400 p-6 bg-red-900/30 rounded-lg w-full text-center">
                <p className="text-xl font-semibold mb-2">Error Displaying Care Plan</p>
                <p className="text-sm">Base care plan data could not be loaded.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CarePlanGeneratorPage;
