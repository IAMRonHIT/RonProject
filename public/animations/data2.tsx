"use client"

import React from 'react'
import { motion } from 'framer-motion'

export function HealthcareDataProcessingAnimation() {
  // Sample data elements
  const rawDataSources = [
    { id: 1, title: "EHR Records", color: "#38bdf8", delay: 0.2 },
    { id: 2, title: "Clinical Notes", color: "#22d3ee", delay: 0.4 },
    { id: 3, title: "Lab Results", color: "#2dd4bf", delay: 0.6 },
    { id: 4, title: "Imaging Data", color: "#4ade80", delay: 0.8 }
  ]
  
  // Processing steps
  const processingSteps = [
    { id: 1, title: "HIPAA Compliance", icon: "🔒", delay: 1.0 },
    { id: 2, title: "Standardization", icon: "📊", delay: 1.2 },
    { id: 3, title: "Normalization", icon: "🧪", delay: 1.4 },
    { id: 4, title: "Extraction", icon: "🔍", delay: 1.6 }
  ]
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/10 to-teal-900/10 rounded-lg p-6">
      <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center scale-[0.85]">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-500 mb-4">
            Healthcare Data Processing
          </h3>
          <p className="text-gray-300 max-w-md mx-auto">
            Transforming raw healthcare data into structured formats for AI processing
          </p>
        </div>
        
        <div className="relative w-full py-8">
          {/* Data flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Data Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-center text-blue-300 mb-2">Raw Data Sources</h4>
              
              {rawDataSources.map((source) => (
                <motion.div
                  key={source.id}
                  className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4"
                  style={{ borderLeftColor: source.color, borderLeftWidth: 4 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      duration: 0.6,
                      delay: source.delay
                    }
                  }}
                  whileHover={{ 
                    x: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-gray-200">{source.title}</span>
                  </div>
                  <motion.div 
                    className="w-full h-1 mt-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${source.color}30` }}
                  >
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: source.color }}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: "100%",
                        transition: { 
                          duration: 1.2,
                          delay: source.delay + 0.3
                        }
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            {/* Processing Column */}
            <div className="relative">
              <h4 className="text-lg font-medium text-center text-cyan-300 mb-6">Processing Pipeline</h4>
              
              <div className="relative h-full flex flex-col items-center justify-center">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { duration: 0.8, delay: 0.9 }
                  }}
                >
                  <svg width="80%" height="70%" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.path
                      d="M20 50 C50 50, 50 50, 100 50 C150 50, 150 50, 180 50"
                      stroke="url(#blueGradient)"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        transition: { duration: 1.5, delay: 1.0 }
                      }}
                    />
                    <motion.path
                      d="M20 100 C50 100, 50 100, 100 100 C150 100, 150 100, 180 100"
                      stroke="url(#blueGradient)"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        transition: { duration: 1.5, delay: 1.2 }
                      }}
                    />
                    <motion.path
                      d="M20 150 C50 150, 50 150, 100 150 C150 150, 150 150, 180 150"
                      stroke="url(#blueGradient)"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        transition: { duration: 1.5, delay: 1.4 }
                      }}
                    />
                    <motion.path
                      d="M20 200 C50 200, 50 200, 100 200 C150 200, 150 200, 180 200"
                      stroke="url(#blueGradient)"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: 1,
                        transition: { duration: 1.5, delay: 1.6 }
                      }}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
                
                <div className="space-y-10 w-full relative z-10">
                  {processingSteps.map((step) => (
                    <motion.div
                      key={step.id}
                      className="flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: step.delay
                        }
                      }}
                    >
                      <div className="bg-slate-800/80 border border-cyan-500/30 rounded-full p-3 flex items-center justify-center w-12 h-12">
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <div className="ml-3 bg-slate-800/60 border border-cyan-500/20 rounded-md px-3 py-1">
                        <span className="text-cyan-300 text-sm">{step.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Output Data Column */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-center text-teal-300 mb-2">Structured Output</h4>
              
              <motion.div
                className="bg-slate-800/50 border border-teal-500/30 rounded-lg p-5 h-[220px]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.8, delay: 2.0 }
                }}
              >
                <div className="text-sm text-teal-300 mb-3 font-medium">Standardized Healthcare Data</div>
                
                <div className="space-y-3 font-mono text-xs overflow-hidden">
                  {/* JSON-like data structure */}
                  <motion.div 
                    className="text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.2 }
                    }}
                  >
                    {`{`}
                  </motion.div>
                  <motion.div 
                    className="pl-4"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.3 }
                    }}
                  >
                    <span className="text-blue-300">"patient_id":</span> <span className="text-amber-300">"P12345"</span>,
                  </motion.div>
                  <motion.div 
                    className="pl-4"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.4 }
                    }}
                  >
                    <span className="text-blue-300">"demographics":</span> {`{...},`}
                  </motion.div>
                  <motion.div 
                    className="pl-4"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.5 }
                    }}
                  >
                    <span className="text-blue-300">"clinical_data":</span> {`{`}
                  </motion.div>
                  <motion.div 
                    className="pl-8"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.6 }
                    }}
                  >
                    <span className="text-blue-300">"vitals":</span> {`[...],`}
                  </motion.div>
                  <motion.div 
                    className="pl-8"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.7 }
                    }}
                  >
                    <span className="text-blue-300">"lab_results":</span> {`[...],`}
                  </motion.div>
                  <motion.div 
                    className="pl-8"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.8 }
                    }}
                  >
                    <span className="text-blue-300">"medications":</span> {`[...]`}
                  </motion.div>
                  <motion.div 
                    className="pl-4"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 2.9 }
                    }}
                  >
                    {`}`}
                  </motion.div>
                  <motion.div 
                    className="text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 0.5, delay: 3.0 }
                    }}
                  >
                    {`}`}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}