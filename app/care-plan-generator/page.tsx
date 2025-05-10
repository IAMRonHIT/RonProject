"use client";

"use client";

import React, { useState, useEffect, useRef } from 'react';
import PatientDataForm, { FormState } from '@/components/careplangenerator/PatientDataForm';
// PatientInfo from scenario-data might not be needed if CarePlanJsonData covers it
// import { PatientInfo } from '@/lib/scenario-data'; 
import ReasoningDisplay from '@/components/careplangenerator/ReasoningDisplay';
// Import the component AND the type definition
import CarePlanTemplate, { CarePlanJsonData } from '@/components/careplangenerator/careplan-template'; 
import PromptDisplay from '@/components/careplangenerator/PromptDisplay';
import LoadingSpinner from '@/components/careplangenerator/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText } from 'lucide-react';
import { SonarService } from '@/lib/sonar-service';

// Removed local interface definitions - using imported CarePlanJsonData now

const CarePlanGeneratorPage = () => {
  const [carePlanData, setCarePlanData] = useState<CarePlanJsonData | null>(null); // Will store final_json
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  // streamingReasoning will be replaced by finalReasoningMarkdown for the main display
  // but we might keep a form of live update if desired, or remove it.
  // For now, let's assume finalReasoningMarkdown is the primary one.
  // const [streamingReasoning, setStreamingReasoning] = useState(''); // Original state
  const [liveReasoningText, setLiveReasoningText] = useState<string>(""); // For live streaming display
  const [finalReasoningMarkdown, setFinalReasoningMarkdown] = useState<string | null>(null); // For final formatted display
  const [error, setError] = useState<string | null>(null);
  const [topLevelCitations, setTopLevelCitations] = useState<string[]>([]); // Renamed from citations and typed
  const [showPromptDisplay, setShowPromptDisplay] = useState(false);
  const [promptDisplayData, setPromptDisplayData] = useState<{
    patientName?: string;
    patientAge?: string | number;
    primaryDiagnosis?: string;
  } | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const rawAccumulatedStreamRef = useRef<string>("");
  const sonarService = useRef(new SonarService()).current;

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const extractSingleThinkBlockJS = (responseText: string): string => {
    const pattern = /<think>([\s\S]*?)<\/think>/;
    const match = responseText.match(pattern);
    return match && match[1] ? match[1].trim() : "";
  };

  const handleFormSubmit = async (formData: FormState) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Your patient scenario is being sent to Ron AI.');
      setError(null);
      setCarePlanData(null);
      setLiveReasoningText(""); // Reset live reasoning
      setFinalReasoningMarkdown(null);
      rawAccumulatedStreamRef.current = "";
      setTopLevelCitations([]);
      setPromptDisplayData({
        patientName: formData.patient_full_name,
        patientAge: formData.patient_age,
        primaryDiagnosis: formData.primary_diagnosis_text,
      });
      setShowPromptDisplay(true);
      
      console.log('Starting care plan generation with data:', formData);
      setActiveTab('reasoning');
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const isConnected = await sonarService.testBackendConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to care plan backend service. Please ensure the service is running.');
      }
      
      try {
        console.log('Initiating streaming session...');
        const streamId = await sonarService.initiateStream(formData);
        streamIdRef.current = streamId;
        setLoadingMessage('Ron AI is analyzing the data and generating the care plan...');

        console.log(`Connecting to stream with ID: ${streamId}`);
        const streamingUrl = sonarService.getStreamingUrl(streamId);
        
        eventSourceRef.current = new EventSource(streamingUrl, { withCredentials: true });
        
        eventSourceRef.current.onerror = (err) => {
          console.error('EventSource error:', err);
          setError('Connection error during streaming. Please try again.');
          setShowPromptDisplay(false);
          setIsLoading(false);
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          rawAccumulatedStreamRef.current = ""; 
        };
        
        eventSourceRef.current.onmessage = (event) => {
          // The '[DONE]' event might become redundant if 'final_json' is the true end signal.
          // For now, keep it to ensure stream closure, but primary logic will rely on typed events.
          if (event.data === '[DONE]') {
            console.log('Stream signaled [DONE]');
            // If final_json hasn't arrived, it implies an incomplete stream or error.
            // isLoading should be managed by final_json or error event.
            if (isLoading) { // If still loading when DONE arrives, it might be an issue.
                console.warn("Stream ended with [DONE] but still in loading state.");
                // setError("Stream ended prematurely."); // Optional: set error
                // setIsLoading(false); // Force loading to false
            }
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
            return;
          }
          
          try {
            const parsedData = JSON.parse(event.data);
            
            switch (parsedData.type) {
              case "citations":
                console.log("Received citations:", parsedData.content);
                setTopLevelCitations(parsedData.content as string[]);
                break;
              case "content_chunk":
                // Append to raw stream
                rawAccumulatedStreamRef.current += parsedData.content;
                // Extract potential reasoning from the accumulated raw stream
                const currentRawThink = extractSingleThinkBlockJS(rawAccumulatedStreamRef.current);
                // Update the live reasoning state
                setLiveReasoningText(currentRawThink);
                break;
              case "final_reasoning":
                console.log("Received final_reasoning (first 100 chars):", (parsedData.content as string).substring(0,100));
                // Set the final formatted markdown
                setFinalReasoningMarkdown(parsedData.content as string);
                // Ensure the live text matches the final markdown in case chunks were missed/out of order
                setLiveReasoningText(extractSingleThinkBlockJS(rawAccumulatedStreamRef.current)); 
                // Switch view to Care Plan tab only AFTER reasoning is final
                setActiveTab('careplan'); 
                // Keep loading until final_json arrives
                break;
              case "final_json":
                console.log("Received final_json");
                // Ensure the received data conforms to the interface, especially required fields like next_steps
                const receivedData = parsedData.content || {};
                const validatedData: CarePlanJsonData = {
                  ...receivedData,
                  next_steps: Array.isArray(receivedData.next_steps) ? receivedData.next_steps : [], // Default to empty array if missing/invalid
                };
                setCarePlanData(validatedData);
                setShowPromptDisplay(false); 
                setIsLoading(false); // Loading is now complete
                // Do NOT switch tab here, it was switched on final_reasoning
                rawAccumulatedStreamRef.current = ""; // Clear accumulated raw data
                eventSourceRef.current?.close(); 
                eventSourceRef.current = null;
                break;
              case "error":
                console.error("Received error event from stream:", parsedData.content);
                setError(parsedData.content || 'An error occurred during generation');
                setShowPromptDisplay(false);
                setIsLoading(false); 
                rawAccumulatedStreamRef.current = ""; 
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
                break;
              case "start": // Backend sends this, can be used for UI updates
                console.log("Stream started event from backend:", parsedData.content);
                setLoadingMessage(parsedData.content || 'Care plan generation initiated...');
                break;
              default:
                // console.warn("Received unknown event type from stream:", parsedData.type, parsedData);
                // It's possible that 'content_chunk' from the Python backend (which is just the delta)
                // is the only thing that doesn't have a 'type' if the Python side isn't wrapping it.
                // The Python client was updated to wrap it as {"type": "content_chunk", "content": ...}
                // So, unhandled types should be logged.
                if (parsedData.content) { // If it's an untyped content chunk (fallback)
                    // rawAccumulatedStreamRef.current += parsedData.content;
                } else {
                    console.warn("Received unknown or malformed event from stream:", parsedData);
                }
            }
          } catch (err) {
            console.error('Error parsing stream data:', err, event.data);
            // Potentially set a generic error if parsing fails repeatedly
            // setError("Error processing data from server.");
            // setIsLoading(false);
          }
        };
      } catch (streamErr) {
        console.error('Error setting up streaming connection:', streamErr);
        setError(streamErr instanceof Error ? streamErr.message : 'Failed to set up streaming connection');
        setShowPromptDisplay(false);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error during form submission or connection test:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred before streaming');
      setShowPromptDisplay(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Care Plan Generator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form" className="flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Patient Data
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="flex items-center justify-center">
            <Brain className="mr-2 h-4 w-4" />
            Reasoning
          </TabsTrigger>
          <TabsTrigger
            value="careplan"
            className={`flex items-center justify-center ${carePlanData ? "animate-pulse-subtle" : ""}`}
            disabled={!carePlanData}
          >
            <FileText className="mr-2 h-4 w-4" />
            Care Plan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-6 transition-all duration-300 ease-in-out">
          <PatientDataForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="reasoning" className="mt-6 transition-all duration-300 ease-in-out space-y-6">
          <PromptDisplay
            isVisible={showPromptDisplay && !error} 
            patientName={promptDisplayData?.patientName}
            patientAge={promptDisplayData?.patientAge}
            primaryDiagnosis={promptDisplayData?.primaryDiagnosis}
          />
          
          {isLoading && !finalReasoningMarkdown && !error && !showPromptDisplay && (
            <LoadingSpinner message={loadingMessage} />
          )}

          {error && !showPromptDisplay && ( 
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Display ReasoningDisplay if liveReasoningText has content OR if loading */}
          {(liveReasoningText || isLoading) && !error && (
            <ReasoningDisplay
              isLoading={isLoading && !finalReasoningMarkdown} // Loading is true until final_reasoning arrives
              liveReasoningText={liveReasoningText} // Pass live text
              finalReasoningMarkdown={finalReasoningMarkdown} // Pass final formatted text
            />
          )}
          
          {!isLoading && !error && !liveReasoningText && !finalReasoningMarkdown && !showPromptDisplay && (
            <div className="text-center p-8 text-gray-500">
              Reasoning process will appear here once generated. Submit patient data to begin.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="careplan" className="mt-6 transition-all duration-300 ease-in-out">
          {carePlanData && (
            <div className="fade-in">
              <CarePlanTemplate data={carePlanData} topLevelCitations={topLevelCitations} />
            </div>
          )}
          {!carePlanData && !isLoading && (
            <div className="text-center p-8 text-gray-500">
              The generated care plan will appear here.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarePlanGeneratorPage;
