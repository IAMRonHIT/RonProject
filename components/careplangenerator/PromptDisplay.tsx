"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareText } from 'lucide-react'; // Using a new icon

interface PromptDisplayProps {
  patientName?: string;
  patientAge?: string | number;
  primaryDiagnosis?: string;
  careEnvironment?: string;
  focusAreas?: string[];
  isVisible: boolean;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({
  patientName,
  patientAge,
  primaryDiagnosis,
  careEnvironment,
  focusAreas,
  isVisible,
}) => {
  const patientInfo = patientName && patientAge
    ? `Patient: ${patientName}, ${patientAge} years old`
    : "Patient information loading...";

  const diagnosisInfo = primaryDiagnosis
    ? `Primary Diagnosis: ${primaryDiagnosis}`
    : "Diagnosis information pending...";

  const environmentInfo = careEnvironment
    ? `Care Setting: ${careEnvironment}`
    : "";

  const focusInfo = focusAreas && focusAreas.length > 0
    ? `Clinical Focus: ${focusAreas.join(', ')}`
    : "";

  const generationInfo = "Generating multi-stage care plan using ADPIE nursing process framework...";

  const requestHeader = "🔶 REQUEST TO RON AI HEALTHCARE ASSISTANT 🔶";

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-lg border-blue-700 bg-gradient-to-br from-blue-700 to-blue-900 text-white animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-bold">
          <MessageSquareText size={24} className="mr-3" />
          {requestHeader}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-800/50 p-4 rounded-md border border-blue-600 font-mono space-y-3">
          <p className="text-base font-semibold text-cyan-300">{patientInfo}</p>
          <p className="text-base">{diagnosisInfo}</p>
          {environmentInfo && <p className="text-base">{environmentInfo}</p>}
          {focusInfo && <p className="text-base">{focusInfo}</p>}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent my-2" />
          <p className="text-yellow-300 font-semibold flex items-center">
            <span className="animate-pulse mr-2">⟳</span>
            {generationInfo}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptDisplay;
