"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
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
  const [isInitialRender, setIsInitialRender] = useState(true)
  const controls = useAnimation()

  // Simplified animation variants for the container to avoid animation issues
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  }

  // Particle animation controls
  const [particleOpacity, setParticleOpacity] = useState(0)
  useEffect(() => {
    // Reset initial render flag when stage changes
    setIsInitialRender(true)
    // Start with particles hidden, then fade them in
    setParticleOpacity(0)
    const timer = setTimeout(() => {
      setParticleOpacity(0.7)
    }, 800) // Slightly delayed from main animation
    
    controls.start("visible").then(() => {
      setIsInitialRender(false)
    })
    
    return () => clearTimeout(timer)
  }, [activeStage, controls])

  // Get the title and theme color for the current stage
  const getStageInfo = () => {
    switch(activeStage) {
      case 0: return { title: "Data Processing", color: "#38bdf8", altColor: "#4ade80" }
      case 1: return { title: "Model Training", color: "#22d3ee", altColor: "#a78bfa" }
      case 2: return { title: "Continuous Learning", color: "#2dd4bf", altColor: "#f472b6" }
      case 3: return { title: "Deep Research", color: "#4ade80", altColor: "#fcd34d" }
      default: return { title: "", color: "#38bdf8", altColor: "#4ade80" }
    }
  }

  const { title, color, altColor } = getStageInfo()

  return (
    <motion.div
      key={activeStage}
      className="w-full h-[700px] relative bg-slate-950/50 border border-blue-500/40 rounded-xl p-6 overflow-hidden shadow-[0_0_35px_rgba(56,189,248,0.2)]"
      initial="hidden"
      animate={controls}
      exit="exit"
      variants={containerVariants}
    >
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-5">
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#glow)" />
        </svg>
        
        {/* Floating particles effect */}
        <div 
          className="absolute inset-0" 
          style={{ 
            opacity: particleOpacity,
            transition: "opacity 1.5s ease-in-out" 
          }}
        >
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: Math.random() * 4 + 1 + "px",
                height: Math.random() * 4 + 1 + "px",
                backgroundColor: i % 3 === 0 ? color : i % 3 === 1 ? "#ffffff" : altColor,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                filter: `blur(${Math.random() * 2}px)`,
                boxShadow: i % 5 === 0 ? `0 0 6px ${color}` : 'none'
              }}
              animate={{
                y: [Math.random() * -20 - 10, Math.random() * 20 + 10],
                x: [Math.random() * -20 - 10, Math.random() * 20 + 10],
                scale: [Math.random() * 0.5 + 0.5, Math.random() * 1 + 1],
                opacity: [Math.random() * 0.3 + 0.2, Math.random() * 0.7 + 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </div>

      {/* Stage Title that zooms in */}
      <AnimatePresence mode="wait">
        {isInitialRender && (
          <motion.div 
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-30 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.6 }}
          >
            <motion.h2 
              className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br"
              style={{ 
                backgroundImage: `linear-gradient(to bottom right, ${color}, ${altColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              initial={{ scale: 0.7, filter: "blur(10px)" }}
              animate={{ 
                scale: 1.5, 
                filter: "blur(0px)",
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              }}
              exit={{ 
                scale: 2.2, 
                filter: "blur(15px)",
                transition: { duration: 0.8 }
              }}
            >
              {title}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main animation content with enhanced container */}
      <motion.div 
        className="h-full w-full z-10 relative"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.5, delay: 0.3 } 
          }
        }}
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

      {/* Stage indicator dots with enhanced styling */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={`indicator-${index}`}
            className={`w-2.5 h-2.5 rounded-full ${index === activeStage ? 'bg-white' : 'bg-gray-600'}`}
            animate={{
              scale: index === activeStage ? [1, 1.3, 1] : 1,
              backgroundColor: index === activeStage ? color : 'rgba(75, 85, 99, 0.5)',
              boxShadow: index === activeStage ? `0 0 10px ${color}` : 'none'
            }}
            transition={{
              scale: { 
                repeat: Infinity, 
                duration: 2,
                repeatType: "loop"
              },
              backgroundColor: { duration: 0.4 }
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}