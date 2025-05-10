"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { FrameworkAnimationSequence } from '@/components/framework-animation-sequence'
import React from 'react'

export default function FrameworkHighlight() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.15,
  })

  return (
    <section
      ref={ref}
      className="relative py-20 bg-gradient-to-b from-[#050818] to-[#0a0e24] overflow-hidden"
    >
      {/* Background grid with enhanced style */}
      <BackgroundEffect inView={inView} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-6xl font-bold mb-4 text-center font-audiowide bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            Our Framework
          </h2>
          <motion.p 
            className="text-base md:text-lg text-blue-100/90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our innovative approach to healthcare AI through interactive animations
            that explain our framework step by step.
          </motion.p>
        </motion.div>

        {/* Framework Animation - Will only render when in view for better performance */}
        {inView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16"
          >
            <FrameworkAnimationSequence />
          </motion.div>
        )}

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]" asChild>
            <Link href="/framework">
              Explore Full Animations <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// Extracted background component for cleaner code
function BackgroundEffect({ inView }: { inView: boolean }) {
  // Floating elements for the background - enhanced with varying sizes for more visual interest
  const floatingElements = [
    { id: 1, size: 160, x: "15%", y: "20%", duration: 25, delay: 0 },
    { id: 2, size: 140, x: "80%", y: "25%", duration: 28, delay: 5 },
    { id: 3, size: 120, x: "65%", y: "80%", duration: 32, delay: 2 },
  ]

  return (
    <>
      {/* Enhanced Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8BAAFC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Grid lines with dashed pattern */}
          {Array.from({ length: 20 }).map((_, i) => {
            const position = i * 5;
            return (
              <React.Fragment key={`grid-${i}`}>
                <line 
                  x1="0" 
                  y1={`${position}%`} 
                  x2="100%" 
                  y2={`${position}%`} 
                  stroke="url(#lineGradient)" 
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={i % 4 === 0 ? "none" : "1,4"}
                />
                <line 
                  x1={`${position}%`} 
                  y1="0" 
                  x2={`${position}%`} 
                  y2="100%" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={i % 4 === 0 ? "none" : "1,4"}
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>
      
      {/* Enhanced Background glow */}
      <motion.div
        className="absolute inset-0 z-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(45, 212, 191, 0.35) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.35) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 60%)`,
          filter: "blur(100px)",
        }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.25 } : { opacity: 0 }}
        transition={{ duration: 1.2 }}
      />
      
      {/* Floating glow elements with enhanced intensity and colors */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full blur-[120px] opacity-0 pointer-events-none"
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { 
            opacity: 0.22,
            scale: 1,
            x: ["-5%", "5%", "-5%"],
            y: ["-5%", "5%", "-5%"],
          } : { 
            opacity: 0,
            scale: 0.8
          }}
          transition={{
            opacity: { duration: 1.5 },
            scale: { duration: 1.5 },
            x: { duration: element.duration, ease: "easeInOut", repeat: Infinity, delay: element.delay },
            y: { duration: element.duration, ease: "easeInOut", repeat: Infinity, delay: element.delay },
          }}
        />
      ))}
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-noise mix-blend-overlay pointer-events-none"></div>
      
      {/* Add style for noise texture */}
      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </>
  )
}