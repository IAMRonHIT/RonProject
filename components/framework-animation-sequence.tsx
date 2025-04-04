"use client"

import { useState, useEffect, useRef } from 'react'
import { ProcessStageCard } from '@/public/animations/stagecard'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'

// Dynamically import animations with type assertions to fix TypeScript errors
const DataAnimation = dynamic(() => import('@/public/animations/data').then(mod => mod.DataRefiningAnimation) as any, { ssr: false })
const Data2Animation = dynamic(() => import('@/public/animations/data2').then(mod => mod.DataTransformationAnimation) as any, { ssr: false })
const TokensAnimation = dynamic(() => import('@/public/animations/tokens').then(mod => mod.TokenizationAnimation) as any, { ssr: false })
const FinetuneAnimation = dynamic(() => import('@/public/animations/finetune') as any, { ssr: false })
const DistillAnimation = dynamic(() => import('@/public/animations/distill') as any, { ssr: false })
const ContlearAnimation = dynamic(() => import('@/public/animations/contlear').then(mod => mod.ContinuousLearningAnimation) as any, { ssr: false })

// Animation stages configuration
const ANIMATION_STAGES = [
  {
    id: 'data',
    title: 'Data Processing',
    description: 'Converting healthcare data into structured formats',
    component: DataAnimation,
  },
  {
    id: 'data2',
    title: 'Data Transformation',
    description: 'Preparing data for model training',
    component: Data2Animation,
  },
  {
    id: 'tokens',
    title: 'Tokenization',
    description: 'Breaking down text into machine-readable tokens',
    component: TokensAnimation,
  },
  {
    id: 'finetune',
    title: 'Fine-tuning',
    description: 'Adapting the model to healthcare-specific tasks',
    component: FinetuneAnimation,
  },
  {
    id: 'distill',
    title: 'Distillation',
    description: 'Creating smaller, efficient models from larger ones',
    component: DistillAnimation,
  },
  {
    id: 'contlear',
    title: 'Continuous Learning',
    description: 'Improving models through ongoing feedback',
    component: ContlearAnimation,
  },
]

// Duration for each animation stage in milliseconds
const STAGE_DURATION = 8000

export function FrameworkAnimationSequence() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()

  // Function to advance to the next stage
  const nextStage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStageIndex((prevIndex) => (prevIndex + 1) % ANIMATION_STAGES.length)
      setIsTransitioning(false)
    }, 300) // Short transition time
  }

  // Set up the animation cycle
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set a new timer for the current stage
    timerRef.current = setTimeout(nextStage, STAGE_DURATION)

    // Cleanup on unmount or when stage changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentStageIndex])

  // Get the current stage
  const currentStage = ANIMATION_STAGES[currentStageIndex]

  // Create icons for each stage
  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'data':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
            <path d="M8 10h8"></path>
            <path d="M8 14h8"></path>
            <path d="M8 18h8"></path>
          </svg>
        )
      case 'data2':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"></path>
            <rect x="3" y="8" width="18" height="8" rx="1"></rect>
          </svg>
        )
      case 'tokens':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V4h16v3"></path>
            <path d="M9 20h6"></path>
            <path d="M12 4v16"></path>
          </svg>
        )
      case 'finetune':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        )
      case 'distill':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3l9 9-9 9"></path>
          </svg>
        )
      case 'contlear':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        )
      default:
        return <div className="w-6 h-6 rounded-full bg-primary/20"></div>
    }
  }

  // Handle manual navigation
  const goToStage = (index: number) => {
    if (index >= 0 && index < ANIMATION_STAGES.length) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStageIndex(index)
        setIsTransitioning(false)

        // Restart the timer for auto-advance
        timerRef.current = setTimeout(nextStage, STAGE_DURATION)
      }, 300)
    }
  }

  const handlePrev = () => {
    const prevIndex = (currentStageIndex - 1 + ANIMATION_STAGES.length) % ANIMATION_STAGES.length
    goToStage(prevIndex)
  }

  const handleNext = () => {
    const nextIndex = (currentStageIndex + 1) % ANIMATION_STAGES.length
    goToStage(nextIndex)
  }

  return (
    <div className="w-full">
      {/* Animation Display Area with Controls */}
      <div className="relative w-full mb-8">
        <div className="w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 shadow-lg transition-all duration-300">
          {ANIMATION_STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`transition-opacity duration-300 ${
                index === currentStageIndex ? 'opacity-100' : 'opacity-0 hidden'
              }`}
            >
              <div className="w-full h-full">
                <stage.component />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors pointer-events-auto"
            aria-label="Previous animation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors pointer-events-auto"
            aria-label="Next animation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Stage Title Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md">
            <h3 className="text-sm font-medium">{currentStage.title}</h3>
          </div>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ANIMATION_STAGES.map((stage, index) => (
          <div
            key={stage.id}
            onClick={() => goToStage(index)}
            className="cursor-pointer"
          >
            <ProcessStageCard
              title={stage.title}
              description={stage.description}
              isActive={index === currentStageIndex}
              icon={getStageIcon(stage.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
