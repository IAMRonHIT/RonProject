"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation' to 'next/router' if using older Next.js, but next/navigation is for App Router

import PatientDataForm from '@/components/careplangenerator/PatientDataForm';
import ReasoningDisplay from '@/components/careplangenerator/ReasoningDisplay';
import CarePlanTemplate, { CarePlanJsonData } from '@/components/careplangenerator/careplan-template';
import LoadingSpinner from '@/components/careplangenerator/LoadingSpinner'; // Assuming this exists

// Directly import the static JSON data
import johnSmithCarePlanData from '../../public/data/john-smith-careplan.json';

const CarePlanGeneratorPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningMarkdown, setReasoningMarkdown] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const router = useRouter();

  const handleSimulate = async () => {
    setIsLoading(true);
    setShowReasoning(false); // Hide previous reasoning if any
    setReasoningMarkdown(null);

    try {
      // Fetch the reasoning text from the public folder
      const response = await fetch('/data/reasoning.txt');
      if (!response.ok) {
        throw new Error(`Failed to fetch reasoning.txt: ${response.statusText}`);
      }
      const text = await response.text();
      setReasoningMarkdown(text);
      
      // Simulate a short delay for fetching/processing before showing reasoning
      setTimeout(() => {
        setIsLoading(false);
        setShowReasoning(true);
        
        // After reasoning starts displaying, wait a bit then navigate to dashboard
        // This delay allows the user to see the reasoning start "typing"
        setTimeout(() => {
          const notificationData = {
            title: "New Stroke Care Plan Initiated",
            message: "A comprehensive care plan has been developed for John Smith (MRN0012345) following acute stroke.",
            detail1: "Key focus: Etiology workup, secondary prevention, and intensive rehabilitation.",
            detail2: "Please review plan for discipline-specific responsibilities and pending actions. Prior authorizations for several services are in progress."
          };
          
          const queryParams = new URLSearchParams({
            event: "new_stroke_plan_simulation",
            patientName: "John Smith",
            mrn: "MRN0012345",
            title: notificationData.title,
            message: notificationData.message,
            detail1: notificationData.detail1,
            detail2: notificationData.detail2
          }).toString();
          
          router.push(`/dashboard?${queryParams}`);
        }, 3000); // Adjust delay as needed for user to see reasoning appear

      }, 500); // Delay before showing reasoning

    } catch (error) {
      console.error("Error during simulation:", error);
      setIsLoading(false);
      // Optionally, set an error state to display to the user
    }
  };
  
  // Callback for when reasoning simulation (typing) completes, if needed for future logic
  // const handleReasoningSimulationComplete = () => {
  //   console.log("Reasoning typing animation complete.");
  //   // Navigation is already handled by setTimeout in handleSimulate
  // };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-slate-100">Care Plan Generator Simulation</h1>
      
      {/* Simulation Trigger Section */}
      <div className="mb-8 p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
        <h2 className="text-2xl font-semibold text-center mb-4 text-sky-400">Start Simulation</h2>
        <PatientDataForm 
          onSimulate={handleSimulate} 
          isLoading={isLoading && !showReasoning} // Show loading on button only before reasoning appears
        />
        {isLoading && !showReasoning && (
          <div className="mt-4">
            <LoadingSpinner message="Preparing simulation..." />
          </div>
        )}
      </div>

      {/* Reasoning Display Section - shown after loading reasoning text */}
      {showReasoning && reasoningMarkdown && (
        <ReasoningDisplay 
          markdownContent={reasoningMarkdown} 
          isSimulating={true} // This tells ReasoningDisplay to start typing
          // onSimulationComplete={handleReasoningSimulationComplete} // Optional: if further action needed after typing
        />
      )}
      
      {/* Care Plan Template Section - always rendered with John Smith's data */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-100">
          Care Plan for {johnSmithCarePlanData.patientData.patient_full_name} (MRN: {johnSmithCarePlanData.patientData.patient_mrn})
        </h2>
        <CarePlanTemplate 
          data={johnSmithCarePlanData as CarePlanJsonData} 
        />
      </div>
    </div>
  );
};

export default CarePlanGeneratorPage;
