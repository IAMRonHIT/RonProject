"use client"

import React from 'react'
import { FrameworkAnimationSequence } from '@/components/framework-animation-sequence'
import { AnimationWrapper } from '@/components/animation-wrapper'
import { motion } from 'framer-motion'

export default function FrameworkPage() {
  return (
    <AnimationWrapper>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050818] to-[#0a0e24]">
        {/* Animated background elements */}
        <BackgroundAnimation />
        
        <div className="container mx-auto py-12 pt-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center font-audiowide bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Our Framework
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-lg mb-12 text-center max-w-3xl mx-auto text-blue-100/90 leading-relaxed">
                A visual explanation of how our framework processes healthcare data and creates efficient AI models.
              </p>
            </motion.div>
          </motion.div>

          <FrameworkAnimationSequence />
        </div>
      </div>
    </AnimationWrapper>
  )
}

function BackgroundAnimation() {
  // Grid pattern with more detail
  const gridSize = 25
  const gridLines = Array.from({ length: gridSize }).map((_, i) => i * (100 / gridSize))
  
  // Floating elements for the background - enhanced with more elements and varying sizes
  const floatingElements = [
    { id: 1, size: 150, x: "10%", y: "15%", duration: 20, delay: 0 },
    { id: 2, size: 120, x: "85%", y: "20%", duration: 25, delay: 5 },
    { id: 3, size: 180, x: "75%", y: "85%", duration: 30, delay: 2 },
    { id: 4, size: 100, x: "20%", y: "75%", duration: 22, delay: 8 },
    { id: 5, size: 130, x: "50%", y: "30%", duration: 28, delay: 3 },
    { id: 6, size: 90, x: "25%", y: "45%", duration: 24, delay: 6 },
    { id: 7, size: 110, x: "70%", y: "60%", duration: 26, delay: 4 }
  ]

  return (
    <>
      {/* Enhanced grid lines with subtle glow */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8BAAFC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Horizontal lines */}
          {gridLines.map((position) => (
            <line 
              key={`h-${position}`}
              x1="0" 
              y1={`${position}%`} 
              x2="100%" 
              y2={`${position}%`} 
              stroke="url(#lineGradient)" 
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={position % 5 === 0 ? "none" : "2,4"}
            />
          ))}
          
          {/* Vertical lines */}
          {gridLines.map((position) => (
            <line 
              key={`v-${position}`}
              x1={`${position}%`} 
              y1="0" 
              x2={`${position}%`} 
              y2="100%" 
              stroke="url(#lineGradient)" 
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={position % 5 === 0 ? "none" : "2,4"}
            />
          ))}
        </svg>
      </div>
      
      {/* Floating glow elements with enhanced intensity and colors */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full blur-[120px] opacity-[0.2] pointer-events-none"
          style={{
            width: element.size,
            height: element.size,
            left: element.x,
            top: element.y,
            background: element.id % 3 === 0 
              ? 'radial-gradient(circle, rgba(56, 189, 248, 0.9) 0%, rgba(20, 70, 140, 0) 70%)' 
              : element.id % 3 === 1
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(50, 20, 90, 0) 70%)'
                : 'radial-gradient(circle, rgba(52, 211, 153, 0.9) 0%, rgba(20, 80, 70, 0) 70%)'
          }}
          animate={{
            x: ["-7%", "7%", "-7%"],
            y: ["-7%", "7%", "-7%"],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: element.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: element.delay
          }}
        />
      ))}
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-noise mix-blend-overlay pointer-events-none"></div>
      
      {/* Add this style for noise texture */}
      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </>
  )
}