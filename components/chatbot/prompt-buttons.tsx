'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PromptButtonsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function PromptButtons({ prompts, onSelectPrompt }: PromptButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="bg-black/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-300 transition-colors whitespace-normal text-left h-auto py-1.5"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}