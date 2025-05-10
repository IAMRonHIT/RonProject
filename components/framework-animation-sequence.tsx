"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { ProcessStageCard } from '@/components/ui/stagecard'
import { Database, Cpu, BarChart3, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { FrameworkDetailedAnimation } from '@/components/framework-detailed-animation'
import { useInView } from 'react-intersection-observer'

export function FrameworkAnimationSequence() {
  const [activeStage, setActiveStage] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const stageControls = useAnimation()
  
  // Use inView to optimize animations when visible
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: false
  })
  
  // Define stages with enhanced colors and animations
  const stages = [
    {
      id: 0,
      title: "Data Processing",
      description: "Transform raw healthcare data into structured formats for AI processing",
      icon: <Database className="w-6 h-6 text-cyan-400" />,
      color: "#38bdf8",
      duration: 25000 // 25 seconds per stage
    },
    {
      id: 1,
      title: "Model Training",
      description: "Specialized tokenization and fine-tuning for healthcare context understanding",
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      color: "#a78bfa",
      duration: 25000
    },
    {
      id: 2,
      title: "Continuous Learning",
      description: "Models improve through feedback loops and real-world healthcare data integration",
      icon: <BarChart3 className="w-6 h-6 text-teal-400" />,
      color: "#2dd4bf",
      duration: 25000
    },
    {
      id: 3,
      title: "Deep Research & Resources",
      description: "Our framework leverages resource tool calling and deep research for evidence-based approaches",
      icon: <BookOpen className="w-6 h-6 text-green-400" />,
      color: "#4ade80",
      duration: 25000
    }
  ]

  // Get current stage data
  const currentStage = stages[activeStage]

  // Function to advance to the next stage with enhanced animation
  const nextStage = () => {
    // Reset progress
    setProgressPercentage(0)
    // Pause autoplay briefly to prevent immediate advancement
    setIsAutoplayPaused(true)
    setTimeout(() => setIsAutoplayPaused(false), 500)
    
    // Trigger exit animation for current stage
    stageControls.start({
      opacity: 0,
      x: -50,
      transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1.0] }
    }).then(() => {
      // Change stage
      setActiveStage((prev) => (prev + 1) % stages.length)
      // Trigger entry animation for new stage
      stageControls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
      })
    })
  }

  // Function to go back to the previous stage
  const prevStage = () => {
    // Reset progress
    setProgressPercentage(0)
    // Pause autoplay briefly
    setIsAutoplayPaused(true)
    setTimeout(() => setIsAutoplayPaused(false), 500)
    
    // Trigger exit animation for current stage
    stageControls.start({
      opacity: 0,
      x: 50,
      transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1.0] }
    }).then(() => {
      // Change stage
      setActiveStage((prev) => (prev - 1 + stages.length) % stages.length)
      // Trigger entry animation for new stage
      stageControls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
      })
    })
  }

  // Handle direct stage selection
  const selectStage = (stageId) => {
    if (stageId === activeStage) return
    
    setProgressPercentage(0)
    setIsAutoplayPaused(true)
    setTimeout(() => setIsAutoplayPaused(false), 500)
    
    // Determine direction for animation
    const isForward = stageId > activeStage
    
    stageControls.start({
      opacity: 0,
      x: isForward ? -50 : 50,
      transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1.0] }
    }).then(() => {
      setActiveStage(stageId)
      stageControls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1.0] }
      })
    })
  }

  // Automatic stage advancement with progress bar
  useEffect(() => {
    if (!inView || isAutoplayPaused) return
    
    // Initialize animation control
    stageControls.start({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    })
    
    const duration = currentStage.duration
    const interval = 100 // Update progress every 100ms
    let elapsed = 0
    
    const timer = setInterval(() => {
      elapsed += interval
      const newProgress = (elapsed / duration) * 100
      setProgressPercentage(newProgress)
      
      if (elapsed >= duration) {
        clearInterval(timer)
        nextStage()
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [activeStage, inView, isAutoplayPaused, currentStage.duration])

  // Reset progress when component goes out of view
  useEffect(() => {
    if (!inView) {
      setProgressPercentage(0)
    }
  }, [inView])

  return (
    <div className="w-full" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Stage cards with enhanced animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stages.map((stage) => (
            <motion.div 
              key={stage.id}
              onClick={() => selectStage(stage.id)}
              className="cursor-pointer transform-gpu"
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 } 
              }}
              animate={{
                y: activeStage === stage.id ? [0, -5, 0] : 0,
                boxShadow: activeStage === stage.id 
                  ? [`0 0 20px ${stage.color}40`, `0 0 30px ${stage.color}60`, `0 0 20px ${stage.color}40`]
                  : `0 0 0px transparent`
              }}
              transition={{
                y: { 
                  repeat: activeStage === stage.id ? Infinity : 0, 
                  duration: 3,
                  repeatType: "loop"
                },
                boxShadow: { 
                  repeat: activeStage === stage.id ? Infinity : 0,
                  duration: 2,
                  repeatType: "reverse"
                }
              }}
            >
              <ProcessStageCard
                title={stage.title}
                description={stage.description}
                isActive={activeStage === stage.id}
                icon={
                  <motion.div
                    animate={{
                      rotate: activeStage === stage.id ? [0, 15, 0, -15, 0] : 0
                    }}
                    transition={{
                      rotate: { 
                        repeat: activeStage === stage.id ? Infinity : 0, 
                        duration: 6,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {React.cloneElement(stage.icon, {
                      className: `w-6 h-6 ${activeStage === stage.id ? 'text-white' : `text-${stage.color}`}`
                    })}
                  </motion.div>
                }
                color={stage.color}
              />
              
              {/* Progress indicator for active stage */}
              {activeStage === stage.id && (
                <motion.div 
                  className="h-1 bg-gradient-to-r mt-1 rounded-full overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${stage.color}, ${stage.color}aa)`,
                    width: `${progressPercentage}%`
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Detailed Animation with enhanced container */}
        <div className="relative">
          {/* Color highlight beams in background */}
          <div className="absolute -inset-10 z-0 opacity-30 blur-3xl pointer-events-none">
            <motion.div 
              className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                background: [
                  `radial-gradient(circle at 30% 40%, ${currentStage.color}40 0%, transparent 60%)`,
                  `radial-gradient(circle at 70% 60%, ${currentStage.color}40 0%, transparent 60%)`,
                  `radial-gradient(circle at 30% 40%, ${currentStage.color}40 0%, transparent 60%)`
                ]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            <FrameworkDetailedAnimation activeStage={activeStage} key={activeStage} />
          </AnimatePresence>
        </div>

        {/* Enhanced Stage navigation with glowing buttons */}
        <div className="flex justify-center space-x-6 mt-10">
          <motion.button
            onClick={prevStage}
            className="group relative px-8 py-3 rounded-md bg-blue-500/20 text-blue-200 transition-all border border-blue-500/30 overflow-hidden backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover effect glow */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-600/30 to-cyan-500/30"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            
            {/* Button content */}
            <div className="flex items-center space-x-2 relative z-10">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Previous</span>
            </div>
            
            {/* Shadow effect */}
            <motion.div 
              className="absolute inset-0 -z-10"
              animate={{ 
                boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.3)", "0 0 0px rgba(59,130,246,0)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.button>
          
          <motion.button
            onClick={nextStage}
            className="group relative px-8 py-3 rounded-md bg-blue-500/30 text-blue-100 transition-all border border-blue-400/40 overflow-hidden backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover effect glow */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/30 to-blue-600/30"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            
            {/* Button content */}
            <div className="flex items-center space-x-2 relative z-10">
              <span>Next</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            {/* Pulsing shadow effect */}
            <motion.div 
              className="absolute inset-0 -z-10"
              animate={{ 
                boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 25px rgba(59,130,246,0.4)", "0 0 0px rgba(59,130,246,0)"]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.button>
        </div>

        {/* Stage details - animated transitions */}
        <motion.div
          key={`details-${activeStage}`}
          initial={{ opacity: 0, y: 30 }}
          animate={stageControls}
          className="mt-16 bg-slate-900/50 border border-blue-500/40 rounded-xl p-8 shadow-[0_0_35px_rgba(59,130,246,0.15)] relative overflow-hidden"
        >
          {/* Dynamic background accent */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${currentStage.color}50 0%, transparent 70%)`
            }}
          />
          
          {/* Dynamic glow line at top */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(to right, transparent, ${currentStage.color}, transparent)`
            }}
          />
          
          <motion.h3 
            className="text-2xl font-bold mb-6 relative inline-block"
            style={{ color: currentStage.color }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {stages[activeStage].title}
            
            {/* Underline effect */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: currentStage.color }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.7, delay: 0.4 }}
            />
          </motion.h3>
          
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <DetailsContent 
                key="content-0"
                description="Our framework begins with sophisticated data processing techniques that transform raw healthcare data into structured formats suitable for AI analysis. This includes:"
                items={[
                  "Cleaning and normalizing medical records",
                  "Standardizing terminology across different healthcare systems",
                  "Extracting key clinical information from unstructured notes",
                  "Ensuring HIPAA compliance and data security throughout the process"
                ]}
              />
            )}

            {activeStage === 1 && (
              <DetailsContent 
                key="content-1"
                description="We use specialized tokenization and fine-tuning techniques to create AI models that truly understand healthcare context:"
                items={[
                  "Custom medical vocabulary tokenization",
                  "Domain-specific pre-training on healthcare literature",
                  "Fine-tuning with expert-annotated clinical data",
                  "Validation against established medical knowledge bases"
                ]}
              />
            )}

            {activeStage === 2 && (
              <DetailsContent 
                key="content-2"
                description="Our models continuously improve through sophisticated feedback mechanisms:"
                items={[
                  "Automated learning from new clinical interactions",
                  "Expert clinician feedback integration",
                  "Regular retraining with updated medical guidelines",
                  "Performance monitoring across diverse healthcare scenarios"
                ]}
              />
            )}

            {activeStage === 3 && (
              <DetailsContent 
                key="content-3"
                description="Our framework leverages advanced resource tool calling and deep research capabilities:"
                items={[
                  "Real-time access to medical knowledge bases and research papers",
                  "Evidence-based approach with citations to relevant clinical studies",
                  "Integration with healthcare databases for contextual information",
                  "Ability to retrieve and analyze the latest medical guidelines and protocols"
                ]}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Extracted component for stage details content with staggered animations
function DetailsContent({ description, items }) {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.p 
        className="text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {description}
      </motion.p>
      
      <motion.ul className="space-y-3 text-gray-300 relative">
        {items.map((item, index) => (
          <motion.li 
            key={index}
            className="pl-6 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
          >
            {/* Custom styled bullet point with glow */}
            <motion.div 
              className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-400"
              animate={{ 
                boxShadow: ["0 0 0px rgba(56,189,248,0)", "0 0 8px rgba(56,189,248,0.6)", "0 0 0px rgba(56,189,248,0)"]
              }}
              transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
            />
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  )
}