"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProcessStageCard } from '@/components/ui/stagecard'
import { Database, Cpu, BarChart3, BookOpen } from 'lucide-react'
import { FrameworkDetailedAnimation } from '@/components/framework-detailed-animation'

export function FrameworkAnimationSequence() {
  const [activeStage, setActiveStage] = useState(0)
  
  const stages = [
    {
      id: 0,
      title: "Data Processing",
      description: "Transform raw healthcare data into structured formats for AI processing",
      icon: <Database className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 1,
      title: "Model Training",
      description: "Specialized tokenization and fine-tuning for healthcare context understanding",
      icon: <Cpu className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 2,
      title: "Continuous Learning",
      description: "Models improve through feedback loops and real-world healthcare data integration",
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 3,
      title: "Deep Research & Resources",
      description: "Our framework leverages resource tool calling and deep research for evidence-based approaches",
      icon: <BookOpen className="w-6 h-6 text-cyan-400" />
    }
  ]

  // Function to advance to the next stage
  const nextStage = () => {
    setActiveStage((prev) => (prev + 1) % stages.length)
  }

  // Function to go back to the previous stage
  const prevStage = () => {
    setActiveStage((prev) => (prev - 1 + stages.length) % stages.length)
  }

  // Automatic stage advancement
  React.useEffect(() => {
    const timer = setTimeout(() => {
      nextStage()
    }, 25000)  // Change stage every 25 seconds to give more time to appreciate each animation

    return () => clearTimeout(timer)
  }, [activeStage])

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        {/* Stage cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stages.map((stage) => (
            <div 
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className="cursor-pointer"
            >
              <ProcessStageCard
                title={stage.title}
                description={stage.description}
                isActive={activeStage === stage.id}
                icon={stage.icon}
              />
            </div>
          ))}
        </div>

        {/* Detailed Animation */}
        <AnimatePresence mode="wait">
          <FrameworkDetailedAnimation activeStage={activeStage} key={activeStage} />
        </AnimatePresence>

        {/* Stage navigation */}
        <div className="flex justify-center space-x-6 mt-10">
          <motion.button
            onClick={prevStage}
            className="px-6 py-2.5 rounded-md bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 transition-all border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Previous Stage
          </motion.button>
          <motion.button
            onClick={nextStage}
            className="px-6 py-2.5 rounded-md bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 transition-all border border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Next Stage
          </motion.button>
        </div>

        {/* Stage details */}
        <motion.div
          key={`details-${activeStage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-slate-900/40 border border-blue-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        >
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">
            {stages[activeStage].title}
          </h3>
          
          {activeStage === 0 && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Our framework begins with sophisticated data processing techniques that transform raw healthcare data into structured formats suitable for AI analysis. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Cleaning and normalizing medical records</li>
                <li>Standardizing terminology across different healthcare systems</li>
                <li>Extracting key clinical information from unstructured notes</li>
                <li>Ensuring HIPAA compliance and data security throughout the process</li>
              </ul>
            </div>
          )}

          {activeStage === 1 && (
            <div className="space-y-6">
              <p className="text-gray-300">
                We use specialized tokenization and fine-tuning techniques to create AI models that truly understand healthcare context:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Custom medical vocabulary tokenization</li>
                <li>Domain-specific pre-training on healthcare literature</li>
                <li>Fine-tuning with expert-annotated clinical data</li>
                <li>Validation against established medical knowledge bases</li>
              </ul>
            </div>
          )}

          {activeStage === 2 && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Our models continuously improve through sophisticated feedback mechanisms:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Automated learning from new clinical interactions</li>
                <li>Expert clinician feedback integration</li>
                <li>Regular retraining with updated medical guidelines</li>
                <li>Performance monitoring across diverse healthcare scenarios</li>
              </ul>
            </div>
          )}

          {activeStage === 3 && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Our framework leverages advanced resource tool calling and deep research capabilities:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Real-time access to medical knowledge bases and research papers</li>
                <li>Evidence-based approach with citations to relevant clinical studies</li>
                <li>Integration with healthcare databases for contextual information</li>
                <li>Ability to retrieve and analyze the latest medical guidelines and protocols</li>
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}