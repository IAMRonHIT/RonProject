"use client";

import React, { useState, useEffect, useRef } from 'react';
import PatientDataForm from '@/components/careplangenerator/PatientDataForm';
import { PatientInfo } from '@/lib/scenario-data';
import ReasoningDisplay from '@/components/careplangenerator/ReasoningDisplay';
import CarePlanTemplate from '@/components/careplangenerator/careplan-template';
import PromptDisplay from '@/components/careplangenerator/PromptDisplay';
import LoadingSpinner from '@/components/careplangenerator/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText } from 'lucide-react';
import { SonarService } from '@/lib/sonar-service';

interface CarePlanJsonData {
  patientData?: any; 
  clinicalData?: any;
  aiAgents?: any[];
  priorAuthItems?: any[];
  sourcesData?: any[];
  assessment_subjective_chief_complaint?: string;
  [key: string]: any; 
}

const CarePlanGeneratorPage = () => {
  const [carePlanData, setCarePlanData] = useState<CarePlanJsonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [citations, setCitations] = useState<any[]>([]);
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

  const handleFormSubmit = async (formData: PatientInfo) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Your patient scenario is being sent to Ron AI.');
      setError(null);
      setCarePlanData(null);
      setStreamingReasoning('');
      rawAccumulatedStreamRef.current = "";
      setCitations([]);
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
          if (event.data === '[DONE]') {
            console.log('Stream completed [DONE]');
            // Final extraction from accumulated data if reasoning wasn't in 'complete'
            const finalReasoningText = extractSingleThinkBlockJS(rawAccumulatedStreamRef.current);
            if (finalReasoningText && !streamingReasoning) { // Check if streamingReasoning was already set by 'complete'
                 setStreamingReasoning(finalReasoningText);
            }
            setIsLoading(false);
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
            // Do not clear rawAccumulatedStreamRef here if you want to inspect it post-DONE for debugging
            return;
          }
          
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'content_chunk') {
              rawAccumulatedStreamRef.current += data.content;
              // Continuously update streamingReasoning with parsed <think> content
              const currentReasoning = extractSingleThinkBlockJS(rawAccumulatedStreamRef.current);
              setStreamingReasoning(currentReasoning); // This will make ReasoningDisplay update live
            } else if (data.type === 'complete') {
              console.log('Received complete data object from stream');
              const content = data.content;
              
              // Set final reasoning from the 'complete' message if available, otherwise it's already set by streaming
              if (content.reasoning) {
                setStreamingReasoning(content.reasoning); 
              } else if (!streamingReasoning) { // If not set by streaming and not in complete, extract one last time
                setStreamingReasoning(extractSingleThinkBlockJS(rawAccumulatedStreamRef.current));
              }
              
              if (content.json_data) {
                console.log('Attempting to set carePlanData with:', JSON.stringify(content.json_data, null, 2));
                setCarePlanData(content.json_data as CarePlanJsonData);
              } else {
                console.warn('Received "complete" event but content.json_data is missing or empty.');
              }
              
              if (content.citations && Array.isArray(content.citations)) {
                setCitations(content.citations);
              }
              
              setShowPromptDisplay(false); 
              setIsLoading(false); 
              // rawAccumulatedStreamRef.current = ""; // Clear only after successful 'complete' processing
              eventSourceRef.current?.close(); 
              eventSourceRef.current = null;
            } else if (data.type === 'error') {
              setError(data.content || 'An error occurred during generation');
              setShowPromptDisplay(false);
              setIsLoading(false); 
              rawAccumulatedStreamRef.current = ""; 
              eventSourceRef.current?.close();
              eventSourceRef.current = null;
            }
          } catch (err) {
            console.error('Error parsing stream data:', err, event.data);
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
          
          {isLoading && !streamingReasoning && !error && !showPromptDisplay && (
            <LoadingSpinner message={loadingMessage} />
          )}

          {error && !showPromptDisplay && ( 
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Display reasoning if available, regardless of loading state for the rest of the content */}
          {(streamingReasoning || (isLoading && rawAccumulatedStreamRef.current.includes("<think>"))) && !error && (
            <ReasoningDisplay
              isLoading={isLoading && !carePlanData} // Pass true if still loading overall and care plan not yet received
              streamingContent={streamingReasoning}
            />
          )}
          
          {!isLoading && !error && !streamingReasoning && !showPromptDisplay && (
             <div className="text-center p-8 text-gray-500">
              Reasoning process will appear here once generated. Submit patient data to begin.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="careplan" className="mt-6 transition-all duration-300 ease-in-out">
          {carePlanData && (
            <div className="fade-in">
              <CarePlanTemplate data={carePlanData} />
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
