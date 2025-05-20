"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, Brain, Hash } from 'lucide-react';

interface TokenGenerationSpinnerProps {
  message?: string;
  totalTokens?: number;
  currentTokens?: number;
  isGenerating?: boolean;
}

const TokenGenerationSpinner: React.FC<TokenGenerationSpinnerProps> = ({ 
  message = "Generating tokens...", 
  totalTokens = 0,
  currentTokens = 0,
  isGenerating = true
}) => {
  const [displayTokens, setDisplayTokens] = useState(currentTokens);
  
  // Animate token count increasing
  useEffect(() => {
    if (!isGenerating) {
      setDisplayTokens(currentTokens);
      return;
    }
    
    // If we're still generating, animate the token count
    const interval = setInterval(() => {
      setDisplayTokens(prev => {
        // If we're close to current tokens, increment slowly
        if (prev >= currentTokens - 10) {
          return prev + 1;
        }
        // Otherwise increment faster to catch up
        return prev + Math.ceil((currentTokens - prev) / 10);
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [currentTokens, isGenerating]);
  
  // Calculate progress percentage
  const progressPercentage = totalTokens > 0 
    ? Math.min(100, Math.round((displayTokens / totalTokens) * 100)) 
    : 0;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-slate-800 border border-slate-700 shadow-md">
      <div className="relative">
        {/* Pulsating background circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 animate-ping" />
        
        {/* Token icon */}
        <div className="relative z-10 flex items-center justify-center mb-4">
          <div className="bg-slate-700 p-3 rounded-full">
            <Hash className="h-10 w-10 text-purple-400" />
          </div>
          
          {/* Orbit animation */}
          <div className="absolute h-24 w-24 rounded-full border-2 border-t-transparent border-purple-500 animate-spin" />
          <div className="absolute h-32 w-32 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      
      {/* Text message */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-medium text-slate-200 mb-2">{message}</h3>
        <p className="text-sm text-slate-400">
          <span className="font-mono text-purple-400">{displayTokens.toLocaleString()}</span>
          {totalTokens > 0 && (
            <span> / <span className="font-mono">{totalTokens.toLocaleString()}</span> tokens</span>
          )}
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-xs mt-4 space-y-2">
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-right text-slate-400">{progressPercentage}% complete</p>
      </div>
    </div>
  );
};

export default TokenGenerationSpinner;
