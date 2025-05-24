"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';
import johnSmithCarePlanData from '../../public/data/john-smith-careplan.json'; // Import the data

interface PatientDataFormProps {
  onSubmit: (data: any) => void; // Changed from onSimulate, now passes data
  isLoading: boolean;
}

export default function PatientDataForm({ onSubmit, isLoading }: PatientDataFormProps) {
  const handleSubmit = () => {
    onSubmit(johnSmithCarePlanData); // Pass the imported data
  };

  return (
    <div className="text-center py-10">
      <Button
        onClick={handleSubmit} // Changed from onSimulate
        disabled={isLoading}
        className="w-full sm:w-auto text-base px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {isLoading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />}
        Start Care Plan Generation for John Smith
      </Button>
      <p className="text-zinc-400 text-sm mt-4">
        This will initiate the care plan generation process using John Smith's data.
      </p>
    </div>
  );
}
