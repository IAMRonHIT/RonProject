"use client"

import React, { useState, useEffect, useRef } from 'react';
import { ProcessStageCard } from '@/components/ui/stagecard';
// Import animations directly
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import SVG icons
import { useTheme } from 'next-themes';

// Use dynamic imports to avoid SSR hydration issues
const DataRefiningAnimation = dynamic(() => 
  import('@/public/animations/data').then((mod) => {
    return mod.DataRefiningAnimation;
  }) as any,
  { ssr: false }
);

const TokenizationAnimation = dynamic(() => 
  import('@/public/animations/tokens').then((mod) => {
    return mod.TokenizationAnimation;
  }) as any,
  { ssr: false }
);

const FinetuneAnimation = dynamic(() => 
  import('@/public/animations/finetune').then((mod) => {
    return mod.TokenizationAnimation;
  }) as any,
  { ssr: false }
);

const ContinuousLearningAnimation = dynamic(() => 
  import('@/public/animations/contlear').then((mod) => {
    return mod.ContinuousLearningAnimation;
  }) as any,
  { ssr: false }
);

const DistillAnimation = dynamic(() => 
  import('@/public/animations/distill').then((mod) => {
    return mod.AgentDistillationAnimation;
  }) as any,
  { ssr: false }
);

const DataTransformationAnimation = dynamic(() => 
  import('@/public/animations/data2').then((mod) => {
    return mod.DataTransformationAnimation;
  }) as any,
  { ssr: false }
);

// Animation wrapper component
function AnimationWrapper({ Animation }: { Animation: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Don't directly execute the animation component as a function
      // Just render it as a React component in the return
    }
  }, [Animation]);
  
  return <div ref={containerRef} className="w-full h-full">
    {typeof window !== 'undefined' && <Animation />}
  </div>;
}

export function ProcessShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Define the process stages
  const stages = [
    {
      id: 'data',
      title: 'Data Preparation',
      description: 'Ingest and prepare healthcare data for AI processing',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 54, 73, 0.9)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
        </svg>
      ),
      animationComponent: DataRefiningAnimation,
    },
    {
      id: 'tokens',
      title: 'Tokenization',
      description: 'Transform text into tokens for model processing',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 54, 73, 0.9)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      animationComponent: TokenizationAnimation,
    },
    {
      id: 'finetune',
      title: 'Model Training',
      description: 'Fine-tune the AI model on healthcare data',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 54, 73, 0.9)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 13.5H2.5"></path>
          <path d="M6 17V7"></path>
          <path d="M14.5 7H2"></path>
          <path d="M8 3H2"></path>
          <path d="M16 16.5V21"></path>
          <path d="M21 16.5H11"></path>
          <path d="M21 12H16"></path>
          <path d="M16 7.5V12"></path>
        </svg>
      ),
      animationComponent: FinetuneAnimation,
    },
    {
      id: 'transform',
      title: 'Data Transformation',
      description: 'Transform data for specialized healthcare applications',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 54, 73, 0.9)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18"></path>
          <rect x="3" y="8" width="18" height="8" rx="1"></rect>
          <path d="M2 12h20"></path>
        </svg>
      ),
      animationComponent: DataTransformationAnimation,
    },
    {
      id: 'contlear',
      title: 'Continuous Learning',
      description: 'Integrate feedback and continuously improve the model',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 54, 73, 0.9)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
          <path d="M16 16h5v5"></path>
        </svg>
      ),
      animationComponent: ContinuousLearningAnimation,
    },
    // Note: DistillAnimation is imported but not used in the stages array.
    // If it should be used, a new stage entry would be needed.
    // Example:
    // {
    //   id: 'distill',
    //   title: 'Agent Distillation',
    //   description: 'Distill knowledge into specialized agents',
    //   icon: ( /* Add appropriate SVG icon here */ ),
    //   animationComponent: DistillAnimation,
    // },
  ];

  // Handle navigation
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? stages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === stages.length - 1 ? 0 : prev + 1));
  };

  // Get the active animation component
  const AnimationComponent = stages[activeIndex].animationComponent;

  return (
    <div className="w-full space-y-8 py-8">
      {/* Animation Display */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden bg-card/50 border">
        <AnimationWrapper key={activeIndex} Animation={AnimationComponent} />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          aria-label="Previous stage"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          aria-label="Next stage"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="cursor-pointer"
            onClick={() => setActiveIndex(index)}
          >
            <ProcessStageCard
              title={stage.title}
              description={stage.description}
              icon={stage.icon}
              isActive={index === activeIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
