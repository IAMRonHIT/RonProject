"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { getThemeColors } from '@/lib/animation-utils'
import { HealthcareDataProcessingAnimation } from '@/public/animations/data2'
import { TokenizationAnimation } from '@/public/animations/tokens'
import { ModelTrainingAnimation } from '@/public/animations/finetune'
import { ContinuousLearningAnimation } from '@/public/animations/contlear'
import { DeepResearchAnimation } from '@/public/animations/distill'

interface FrameworkDetailedAnimationProps {
  activeStage: number
}

export function FrameworkDetailedAnimation({ activeStage }: FrameworkDetailedAnimationProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const themeColors = getThemeColors(isDark)

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.25,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      scale: 0.95,
      transition: { 
        duration: 0.6,
        ease: "easeIn"
      }
    }
  }

  return (
    <motion.div
      key={activeStage}
      className="w-full h-[700px] bg-slate-900/30 border border-blue-500/30 rounded-xl p-6 overflow-hidden"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Stage 0: Data Processing */}
      {activeStage === 0 && (
        <div className="h-full">
          <HealthcareDataProcessingAnimation />
        </div>
      )}

      {/* Stage 1: Model Training */}
      {activeStage === 1 && (
        <div className="h-full">
          <TokenizationAnimation />
        </div>
      )}

      {/* Stage 2: Continuous Learning */}
      {activeStage === 2 && (
        <div className="h-full">
          <ContinuousLearningAnimation />
        </div>
      )}

      {/* Stage 3: Deep Research & Resources */}
      {activeStage === 3 && (
        <div className="h-full">
          <DeepResearchAnimation />
        </div>
      )}
    </motion.div>
  )
}