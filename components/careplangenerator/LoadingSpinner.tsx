"use client";

import React from 'react';
import { Loader2, Brain } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-white border border-gray-200 shadow-md">
      <div className="relative">
        {/* Pulsating background circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 opacity-20 animate-ping" />
        
        {/* Brain icon */}
        <div className="relative z-10 flex items-center justify-center mb-4">
          <Brain className="h-16 w-16 text-blue-500" />
          
          {/* Orbit animation */}
          <div className="absolute h-24 w-24 rounded-full border-2 border-t-transparent border-blue-400 animate-spin" />
          <div className="absolute h-32 w-32 rounded-full border-2 border-t-transparent border-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      
      {/* Text message */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
        <p className="text-sm text-gray-500 animate-pulse">Processing AI models...</p>
      </div>
      
      {/* Progress indicators */}
      <div className="w-full max-w-xs mt-6 space-y-2">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;