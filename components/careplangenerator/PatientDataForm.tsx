"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';

interface SimplifiedPatientDataFormProps {
  onSimulate: () => void;
  isLoading: boolean;
}

export default function PatientDataForm({ onSimulate, isLoading }: SimplifiedPatientDataFormProps) {
  return (
    <div className="text-center py-10">
      <Button
        onClick={onSimulate}
        disabled={isLoading}
        className="w-full sm:w-auto text-base px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {isLoading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />}
        Simulate John Smith's Care Plan Generation
      </Button>
      <p className="text-zinc-400 text-sm mt-4">
        This will simulate the generation of John Smith's stroke care plan using static data.
      </p>
    </div>
  );
}
