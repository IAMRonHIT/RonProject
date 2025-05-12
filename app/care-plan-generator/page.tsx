"use client";

"use client";

import React, { useState, useEffect, useRef } from 'react';
import PatientDataForm, { FormState } from '@/components/careplangenerator/PatientDataForm';
import ReasoningDisplay, { ReasoningStage } from '@/components/careplangenerator/ReasoningDisplay';
import CarePlanTemplate, { CarePlanJsonData } from '@/components/careplangenerator/careplan-template';
import PromptDisplay from '@/components/careplangenerator/PromptDisplay';
import LoadingSpinner from '@/components/careplangenerator/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText } from 'lucide-react';
import { SonarService } from '@/lib/sonar-service';

// Helper for deep merging, similar to Python's but for JS objects
// This is a simplified version. For robust merging, a library like lodash.merge might be better.
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key]) && Array.isArray(target[key]) && key === 'nursingDiagnoses') {
        // Special handling for nursingDiagnoses: merge items by index or a unique key if available
        const targetDiagnoses = target[key] as any[];
        const sourceDiagnoses = source[key] as any[];
        const mergedDiagnoses = targetDiagnoses.map((diag: any, index: number) => {
          if (sourceDiagnoses[index]) {
            return deepMerge(diag, sourceDiagnoses[index]);
          }
          return diag;
        });
        // Add any new diagnoses from source if source is longer
        if (sourceDiagnoses.length > targetDiagnoses.length) {
          mergedDiagnoses.push(...sourceDiagnoses.slice(targetDiagnoses.length));
        }
        output[key] = mergedDiagnoses;

      } else if (Array.isArray(source[key])) {
        // For other arrays, source replaces target or extends if target is shorter.
        // A more sophisticated merge might try to merge array items.
        // For simplicity here, if source provides an array, it's often the complete version for that stage.
        output[key] = [...source[key]];
      }
      else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const isObject = (item: any): item is Object => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};


const CarePlanGeneratorPage = () => {
  const [carePlanData, setCarePlanData] = useState<CarePlanJsonData | null>(null);
  const [reasoningStages, setReasoningStages] = useState<ReasoningStage[]>([]);
  const [overallIsLoading, setOverallIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [error, setError] = useState<string | null>(null);
  // topLevelCitations might be deprecated if citations are part of sourcesData in CarePlanJsonData
  const [topLevelCitations, setTopLevelCitations] = useState<string[]>([]); 
  const [showPromptDisplay, setShowPromptDisplay] = useState(false);
  const [promptDisplayData, setPromptDisplayData] = useState<{
    patientName?: string;
    patientAge?: string | number;
    primaryDiagnosis?: string;
    careEnvironment?: string;
    focusAreas?: string[];
  } | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const sonarService = useRef(new SonarService()).current;

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleFormSubmit = async (formData: FormState, careEnvironment: string, focusAreas: string[]) => {
    try {
      setOverallIsLoading(true);
      setLoadingMessage('Initializing multi-stage care plan generation...');
      setError(null);
      setCarePlanData(null);
      setReasoningStages([]); // Reset stages
      setTopLevelCitations([]); // Reset if still used
      
      setPromptDisplayData({
        patientName: formData.patient_full_name,
        patientAge: formData.patient_age,
        primaryDiagnosis: formData.primary_diagnosis_text,
        careEnvironment: careEnvironment,
        focusAreas: focusAreas,
      });
      setShowPromptDisplay(true);
      
      console.log('Starting sequential care plan generation with data:', { formData, careEnvironment, focusAreas });
      setActiveTab('reasoning');
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const isConnected = await sonarService.testBackendConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to care plan backend service. Please ensure the service is running.');
      }
      
      // Assuming SonarService will have a method like initiateSequentialStream
      // that takes patient_form_data, care_environment, and focus_areas
      const streamId = await sonarService.initiateSequentialStream(formData, careEnvironment, focusAreas);
      const streamingUrl = sonarService.getStreamingUrl(streamId); // getStreamingUrl might need streamId
        
      eventSourceRef.current = new EventSource(streamingUrl, { withCredentials: true });
        
      eventSourceRef.current.onerror = (err) => {
        console.error('EventSource error:', err);
        setError('Connection error during streaming. Please try again.');
        setShowPromptDisplay(false);
        setOverallIsLoading(false);
        setReasoningStages(prev => prev.map(s => ({ ...s, isLoading: false, error: s.isLoading ? "Stream connection failed" : s.error })));
        eventSourceRef.current?.close();
      };
        
      eventSourceRef.current.onmessage = (event) => {
        if (event.data === '[DONE]') { // Should be handled by full_care_plan_complete ideally
          console.log('Stream signaled [DONE]');
          if (overallIsLoading) {
            console.warn("Stream ended with [DONE] but overall generation not marked complete.");
            // setOverallIsLoading(false); // Force loading to false if necessary
          }
          eventSourceRef.current?.close();
          return;
        }
          
        try {
          const parsedEvent = JSON.parse(event.data);
          
          switch (parsedEvent.type) {
            case "overall_generation_start":
              console.log("Overall generation started");
              setOverallIsLoading(true);
              setCarePlanData(null);
              setReasoningStages([]);
              setLoadingMessage("AI is starting the care plan generation process...");
              break;

            case "stage_start":
              console.log(`Stage started: ${parsedEvent.stage_name}`);
              setLoadingMessage(`Processing: ${parsedEvent.accordion_title}`);
              setReasoningStages(prevStages => {
                const existingStageIndex = prevStages.findIndex(s => s.stageName === parsedEvent.stage_name);
                const newStage: ReasoningStage = {
                  stageName: parsedEvent.stage_name,
                  accordionTitle: parsedEvent.accordion_title,
                  reasoningMarkdown: null,
                  isComplete: false,
                  isLoading: true,
                  error: null,
                };
                if (existingStageIndex > -1) {
                  const updatedStages = [...prevStages];
                  updatedStages[existingStageIndex] = newStage;
                  return updatedStages;
                }
                return [...prevStages, newStage];
              });
              break;

            case "reasoning_text_chunk":
              console.log(`Received reasoning chunk for stage: ${parsedEvent.stage_name}`);
              setReasoningStages(prevStages => {
                const updatedStages = [...prevStages];
                const stageIndex = updatedStages.findIndex(s => s.stageName === parsedEvent.stage_name);

                if (stageIndex > -1) {
                  // Append new content to existing reasoning markdown
                  const stage = updatedStages[stageIndex];
                  updatedStages[stageIndex] = {
                    ...stage,
                    reasoningMarkdown: (stage.reasoningMarkdown || '') + parsedEvent.content,
                    isLoading: true
                  };
                }

                return updatedStages;
              });
              break;

            case "stage_reasoning_complete":
              console.log(`Reasoning complete for stage: ${parsedEvent.stage_name}`);
              setReasoningStages(prevStages =>
                prevStages.map(s =>
                  s.stageName === parsedEvent.stage_name
                    ? { ...s, reasoningMarkdown: parsedEvent.reasoning_markdown, isLoading: true } // Still loading until JSON chunk
                    : s
                )
              );
              break;

            case "stage_json_chunk": // This contains the JSON for the completed stage
              console.log(`JSON chunk for stage: ${parsedEvent.stage_name}`);
              setReasoningStages(prevStages =>
                prevStages.map(s =>
                  s.stageName === parsedEvent.stage_name
                    ? { ...s, isLoading: false, isComplete: true, error: null }
                    : s
                )
              );
              // JSON for the stage is received. We won't set carePlanData for the template here.
              // The full care plan will be set on "full_care_plan_complete".
              // We can still log or temporarily store stage-specific JSON if needed for debugging,
              // but it won't drive the main CarePlanTemplate rendering.
              console.log(`JSON received for stage: ${parsedEvent.stage_name}. Data will be fully rendered at the end.`);
              // If you needed to inspect intermediate states, you could accumulate them:
              // accumulatedCarePlanData.current = deepMerge(accumulatedCarePlanData.current || {}, parsedEvent.json_data);
              break;

            case "full_care_plan_complete":
              console.log("Full care plan generation complete. Rendering final care plan.");
              setCarePlanData(parsedEvent.care_plan as CarePlanJsonData); // Set the final data here
              setOverallIsLoading(false);
              setShowPromptDisplay(false);
              setLoadingMessage("Care plan successfully generated!");
              setActiveTab('careplan');
              // Mark all stages as complete and not loading
              setReasoningStages(prevStages => prevStages.map(s => ({ ...s, isLoading: false, isComplete: true, error: s.error }))); // Keep existing errors
              eventSourceRef.current?.close();
              break;
            
            case "error": // This can be a general error or a stage-specific error
              console.error("Error event from stream:", parsedEvent);
              const errorMessage = parsedEvent.content || 'An error occurred during generation.';
              if (parsedEvent.stage_name) {
                setReasoningStages(prevStages =>
                  prevStages.map(s =>
                    s.stageName === parsedEvent.stage_name
                      ? { ...s, isLoading: false, isComplete: true, error: errorMessage } // Mark as 'done' with error
                      : s
                  )
                );
              } else {
                setError(errorMessage);
                setOverallIsLoading(false);
              }
              // Potentially close stream on first major error, or let backend decide
              // eventSourceRef.current?.close(); 
              break;
              
            default:
              console.warn("Received unknown event type from stream:", parsedEvent);
          }
        } catch (err) {
          console.error('Error parsing stream data:', err, event.data);
        }
      };
    } catch (err: any) {
      console.error('Error during form submission or connection test:', err);
      setError(err.message || 'An unknown error occurred before streaming');
      setShowPromptDisplay(false);
      setOverallIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Care Plan Generator (Multi-Stage)</h1>
      
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
            disabled={!carePlanData && !overallIsLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Care Plan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-6 transition-all duration-300 ease-in-out">
          {/* Pass careEnvironment and focusAreas from PatientDataForm's onSubmit */}
          <PatientDataForm 
            onSubmit={handleFormSubmit} 
            isLoading={overallIsLoading} 
          />
        </TabsContent>
        
        <TabsContent value="reasoning" className="mt-6 transition-all duration-300 ease-in-out space-y-6">
          <PromptDisplay
            isVisible={showPromptDisplay && !error} 
            patientName={promptDisplayData?.patientName}
            patientAge={promptDisplayData?.patientAge}
            primaryDiagnosis={promptDisplayData?.primaryDiagnosis}
            careEnvironment={promptDisplayData?.careEnvironment}
            focusAreas={promptDisplayData?.focusAreas}
          />
          
          {overallIsLoading && reasoningStages.length === 0 && !error && !showPromptDisplay && (
            <LoadingSpinner message={loadingMessage || "Initializing care plan generation..."} />
          )}

          {error && !showPromptDisplay && ( 
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          {/* Render ReasoningDisplay if there are stages or overall loading is active */}
          {(reasoningStages.length > 0 || (overallIsLoading && !error)) && (
            <ReasoningDisplay
              reasoningStages={reasoningStages}
              overallIsLoading={overallIsLoading && reasoningStages.length === 0}
            />
          )}
          
          {!overallIsLoading && !error && reasoningStages.length === 0 && !showPromptDisplay && (
            <div className="text-center p-8 text-gray-500">
              Reasoning process will appear here once generated. Submit patient data to begin.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="careplan" className="mt-6 transition-all duration-300 ease-in-out">
          {overallIsLoading && !carePlanData && (
             <LoadingSpinner message="Care plan is being generated progressively..." />
          )}
          {carePlanData && (
            <div className="fade-in">
              {/* topLevelCitations might be removed if not used with sequential stream */}
              <CarePlanTemplate data={carePlanData} topLevelCitations={topLevelCitations} />
            </div>
          )}
          {!carePlanData && !overallIsLoading && !error && (
            <div className="text-center p-8 text-gray-500">
              The generated care plan will appear here.
            </div>
          )}
           {error && ( // Display error on care plan tab too if it occurred
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarePlanGeneratorPage;
