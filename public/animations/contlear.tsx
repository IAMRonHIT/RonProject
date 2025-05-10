"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

export function ContinuousLearningAnimation() {
  const [activePhase, setActivePhase] = useState(0);
  const [feedbackData, setFeedbackData] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState(78);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const iterations = useRef(0);
  const controls = useAnimation();
  
  // Simulate improvement data over time
  const improvementData = [
    { month: "Jan", accuracy: 78 },
    { month: "Feb", accuracy: 82 },
    { month: "Mar", accuracy: 83 },
    { month: "Apr", accuracy: 87 },
    { month: "May", accuracy: 89 },
    { month: "Jun", accuracy: 92 },
    { month: "Jul", accuracy: 94 },
    { month: "Aug", accuracy: 95 }
  ];
  
  // Auto-progress through phases
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activePhase < 3) {
        setActivePhase(prev => prev + 1);
      } else if (!showInsights) {
        setShowInsights(true);
      }
    }, activePhase === 0 ? 3000 : 5000);
    
    return () => clearTimeout(timer);
  }, [activePhase, showInsights]);
  
  // Generate new feedback data every 1.5 seconds during feedback collection
  useEffect(() => {
    let intervalId;
    
    if (activePhase === 1) {
      intervalId = setInterval(() => {
        const newFeedback = {
          id: `feedback-${Date.now()}`,
          type: Math.random() > 0.3 ? 'positive' : 'corrective',
          source: ['physician', 'clinician', 'specialist', 'researcher'][Math.floor(Math.random() * 4)],
          area: ['diagnosis', 'treatment', 'medication', 'procedure'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString(),
          value: Math.random() * 0.8 + 0.2 // 0.2 to 1.0
        };
        
        setFeedbackData(prev => [...prev, newFeedback].slice(-12)); // Keep only the most recent 12
        setFeedbackCount(prev => prev + 1);
      }, 1500);
    }
    
    return () => clearInterval(intervalId);
  }, [activePhase]);
  
  // Update model accuracy based on feedback
  useEffect(() => {
    if (activePhase === 2) {
      const interval = setInterval(() => {
        iterations.current += 1;
        
        if (iterations.current <= 5) {
          setModelAccuracy(prev => {
            const newAccuracy = prev + Math.random() * 3;
            return newAccuracy > 98 ? 98 : Math.round(newAccuracy * 10) / 10;
          });
        } else {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
    
    if (activePhase === 3) {
      controls.start({
        pathLength: 1,
        transition: { duration: 0.8, ease: "easeOut" }
      });
    }
  }, [activePhase, controls]);
  
  // Generate data particles for the feedback loop animation
  const generateDataParticles = (count = 20) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: i * 0.3,
      offset: Math.random()
    }));
  };
  
  const dataParticles = generateDataParticles();
  
  // Clinical metrics
  const metrics = [
    { 
      name: "Diagnostic Accuracy", 
      initialValue: 78, 
      finalValue: 96, 
      color: "#38bdf8",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
    },
    { 
      name: "Treatment Recommendations", 
      initialValue: 71, 
      finalValue: 93, 
      color: "#818cf8",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
    },
    { 
      name: "Medication Management", 
      initialValue: 75, 
      finalValue: 92, 
      color: "#c084fc",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
    },
    { 
      name: "Patient Outcome Prediction", 
      initialValue: 68, 
      finalValue: 91, 
      color: "#34d399",
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
    }
  ];
  
  // Learning sources
  const learningSources = [
    { 
      name: "Clinical Feedback", 
      color: "#38bdf8", 
      value: 35,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
    },
    { 
      name: "New Research", 
      color: "#818cf8", 
      value: 25,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
    },
    { 
      name: "Medical Literature", 
      color: "#c084fc", 
      value: 20,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg> 
    },
    { 
      name: "Patient Data", 
      color: "#34d399", 
      value: 20,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
    }
  ];
  
  // Feedback types for the collection phase
  const getFeedbackTypeColor = (type) => {
    return type === 'positive' ? 'rgba(52, 211, 153, 0.7)' : 'rgba(251, 113, 133, 0.7)';
  };
  
  // Improvement insights for final phase
  const improvementInsights = [
    "Reduced diagnostic errors by 47%",
    "Improved treatment selection timing by 56%",
    "Enhanced medication conflict detection by 68%",
    "Increased detection of rare conditions by 72%",
    "Better prediction of recovery timelines by 39%"
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900/10 to-blue-900/10 rounded-lg p-6">
      <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center scale-[0.85]">
        <div className="text-center mb-6">
          <motion.h3 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Continuous Learning System
          </motion.h3>
          <motion.p 
            className="text-gray-300 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our model continuously improves through real-world feedback and new medical data
          </motion.p>
        </div>
        
        {/* Learning Cycle Progress Indicators */}
        <motion.div
          className="flex justify-between w-full max-w-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            "Initial Model", 
            "Feedback Collection", 
            "Model Improvement", 
            "Enhanced Performance"
          ].map((step, idx) => (
            <div key={step} className="flex flex-col items-center">
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activePhase >= idx 
                    ? 'bg-gradient-to-br from-teal-500 to-blue-500'
                    : 'bg-slate-800 border border-slate-700'
                }`}
                animate={{ 
                  scale: activePhase === idx ? [1, 1.1, 1] : 1,
                  transition: { duration: 2, repeat: activePhase === idx ? Infinity : 0 }
                }}
              >
                {idx === 0 && (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                )}
                {idx === 1 && (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                {idx === 2 && (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {idx === 3 && (
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )}
              </motion.div>
              <span className={`text-xs mt-2 ${activePhase >= idx ? 'text-teal-300' : 'text-slate-500'}`}>
                {step}
              </span>
              {idx < 3 && (
                <motion.div 
                  className="w-full h-0.5 mt-6 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: activePhase > idx ? "100%" : 0,
                    opacity: activePhase > idx ? 1 : 0
                  }}
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', left: `calc(12.5% + ${idx * 25}%)`, width: "25%" }}
                />
              )}
            </div>
          ))}
        </motion.div>
        
        {/* Main Visualization Area */}
        <div className="relative w-full h-[400px] border border-slate-700/50 rounded-lg bg-slate-900/30 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Phase 0: Initial Model */}
            {activePhase === 0 && (
              <motion.div
                key="initial-model"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-56 h-56 relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.6, 0.8, 0.6],
                      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-4 rounded-full bg-slate-800/80 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.02, 1],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <div className="text-3xl font-bold text-teal-300">{modelAccuracy}%</div>
                      <div className="text-xs text-blue-300 mt-2">Base Model Accuracy</div>
                      <div className="mt-4 flex justify-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className={`w-1.5 h-8 rounded-full ${i < 3 ? 'bg-teal-500' : 'bg-slate-600'}`}
                            initial={{ height: 0 }}
                            animate={{ height: 8 + (i * 4) }}
                            transition={{ delay: 0.7 + (i * 0.1), duration: 0.4 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <svg className="w-full h-full" viewBox="0 0 224 224">
                    <motion.circle 
                      cx="112" 
                      cy="112" 
                      r="100" 
                      stroke="url(#blueGreenGradient)" 
                      strokeWidth="2"
                      strokeDasharray="629"
                      fill="none"
                      strokeDashoffset="629"
                      animate={{ 
                        strokeDashoffset: [629, 629 * (1 - modelAccuracy/100)],
                        transition: { duration: 1.5, delay: 0.5, ease: "easeOut" }
                      }}
                    />
                    <defs>
                      <linearGradient id="blueGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
                
                {/* Initial capabilities */}
                <motion.div
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  {["Medical Terminology", "Basic Diagnosis", "Treatment Options", "Clinical Guidelines"].map((capability, idx) => (
                    <motion.div
                      key={capability}
                      className="flex items-center text-xs bg-slate-800/70 border border-slate-700 px-3 py-2 rounded-md"
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + (idx * 0.1) }}
                    >
                      <div className={`w-2 h-2 rounded-full ${idx < 2 ? 'bg-teal-400' : 'bg-blue-400'} mr-2`}></div>
                      {capability}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
            
            {/* Phase 1: Feedback Collection */}
            {activePhase === 1 && (
              <motion.div
                key="feedback-collection"
                className="absolute inset-0 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mt-8 mb-4 bg-slate-800/60 border border-teal-500/30 rounded-md px-4 py-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-teal-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-sm font-medium text-teal-300">Feedback Collection System</h4>
                    <div className="ml-3 px-2 py-0.5 bg-teal-500/20 rounded-full text-xs text-teal-300">{feedbackCount} inputs</div>
                  </div>
                </motion.div>
                
                {/* Main feedback visualization */}
                <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                  {/* Central model */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-slate-800/70 border border-blue-500/30 flex items-center justify-center z-10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      transition: { duration: 0.6, delay: 0.5 }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-300">{modelAccuracy}%</div>
                      <div className="text-xs text-gray-300 mt-1">Current Model</div>
                    </div>
                    
                    {/* Pulsing effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-blue-500/40"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                        transition: { duration: 3, repeat: Infinity }
                      }}
                    />
                  </motion.div>
                  
                  {/* Circular path for feedback sources */}
                  <svg className="absolute w-full h-full" viewBox="0 0 800 400" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="feedbackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                    
                    {/* Feedback collection orbit */}
                    <motion.circle
                      cx="400"
                      cy="200"
                      r="150"
                      stroke="url(#feedbackGradient)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      initial={{ rotate: 0 }}
                      animate={{ 
                        rotate: 360,
                        transition: { duration: 120, repeat: Infinity, ease: "linear" }
                      }}
                    />
                    
                    {/* Feedback sources */}
                    {learningSources.map((source, idx) => {
                      const angle = (idx * Math.PI / 2) + Math.PI / 4;
                      const x = 400 + Math.cos(angle) * 150;
                      const y = 200 + Math.sin(angle) * 150;
                      
                      return (
                        <motion.g key={source.name}>
                          <motion.circle
                            cx={x}
                            cy={y}
                            r="25"
                            fill={`${source.color}20`}
                            stroke={source.color}
                            strokeWidth="1.5"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: 1, 
                              opacity: 1,
                              transition: { duration: 0.5, delay: 0.3 + (idx * 0.2) }
                            }}
                          />
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 + (idx * 0.2) }}
                          >
                            <foreignObject x={x-20} y={y-20} width="40" height="40">
                              <div className="w-full h-full flex items-center justify-center text-white">
                                {source.icon}
                              </div>
                            </foreignObject>
                          </motion.g>
                        </motion.g>
                      );
                    })}
                    
                    {/* Feedback particles flowing to the model */}
                    {feedbackData.map((feedback, idx) => {
                      // Calculate a position along the circle
                      const sourceIdx = ["physician", "clinician", "specialist", "researcher"].indexOf(feedback.source);
                      const angle = (sourceIdx * Math.PI / 2) + Math.PI / 4;
                      const sourceX = 400 + Math.cos(angle) * 150;
                      const sourceY = 200 + Math.sin(angle) * 150;
                      
                      return (
                        <motion.circle
                          key={feedback.id}
                          r="4"
                          fill={getFeedbackTypeColor(feedback.type)}
                          initial={{ 
                            cx: sourceX,
                            cy: sourceY,
                            opacity: 0,
                            scale: 0
                          }}
                          animate={{
                            cx: [sourceX, 400, 400],
                            cy: [sourceY, 200, 200],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                            transition: { 
                              duration: 1.5,
                              times: [0, 0.7, 1]
                            }
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Feedback logs */}
                  <div className="absolute bottom-4 left-4 right-4 h-24 overflow-hidden">
                    <div className="flex flex-col-reverse space-y-reverse space-y-1">
                      {feedbackData.slice(0, 4).map((feedback, idx) => (
                        <motion.div
                          key={feedback.id}
                          className={`text-xs px-3 py-2 rounded-md flex items-center ${
                            feedback.type === 'positive' 
                              ? 'bg-teal-500/10 border border-teal-500/30' 
                              : 'bg-rose-500/10 border border-rose-500/30'
                          }`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            feedback.type === 'positive' ? 'bg-teal-400' : 'bg-rose-400'
                          }`} />
                          <span className={`${feedback.type === 'positive' ? 'text-teal-300' : 'text-rose-300'}`}>
                            {feedback.source} provided {feedback.type} feedback on {feedback.area}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Phase 2: Model Improvement */}
            {activePhase === 2 && (
              <motion.div
                key="model-improvement"
                className="absolute inset-0 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mt-8 mb-4 bg-slate-800/60 border border-blue-500/30 rounded-md px-4 py-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <h4 className="text-sm font-medium text-blue-300">Model Training in Progress</h4>
                    <div className="ml-3 px-2 py-0.5 bg-blue-500/20 rounded-full text-xs text-blue-300">Iteration {Math.min(iterations.current, 5)}/5</div>
                  </div>
                </motion.div>
                
                <div className="w-full flex-1 flex items-center">
                  <div className="w-1/2 p-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-32 h-32 rounded-full bg-slate-800/70 border border-teal-500/30 flex items-center justify-center"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            transition: { duration: 2, repeat: Infinity }
                          }}
                        >
                          <motion.div
                            className="text-center"
                            animate={{ scale: 1 }}
                          >
                            <motion.div 
                              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500"
                              animate={{ 
                                opacity: [0.7, 1, 0.7],
                                transition: { duration: 2, repeat: Infinity }
                              }}
                            >
                              {modelAccuracy}%
                            </motion.div>
                            <div className="text-xs text-gray-300 mt-1">Accuracy</div>
                          </motion.div>
                        </motion.div>
                      </div>
                      
                      <svg width="300" height="300" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="#0f172a"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="282.74"
                          animate={{ 
                            strokeDashoffset: 282.74 * (1 - modelAccuracy/100),
                            transition: { duration: 0.5 }
                          }}
                          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="w-1/2 p-4 space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-sm font-medium text-blue-300 mb-3">Training Progress</div>
                      <div className="space-y-3">
                        {metrics.map((metric, idx) => {
                          // Calculate current value based on iterations
                          const progressRatio = Math.min(iterations.current / 5, 1);
                          const currentValue = metric.initialValue + progressRatio * (metric.finalValue - metric.initialValue);
                          
                          return (
                            <div key={metric.name} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400 flex items-center">
                                  <span className="w-4 h-4 mr-1 text-gray-300">{metric.icon}</span>
                                  {metric.name}
                                </span>
                                <motion.span 
                                  className="text-teal-300"
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  {Math.round(currentValue)}%
                                </motion.span>
                              </div>
                              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: metric.color }}
                                  initial={{ width: `${metric.initialValue}%` }}
                                  animate={{ width: `${currentValue}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 * idx }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                    
                    {iterations.current >= 3 && (
                      <motion.div
                        className="mt-4 p-3 bg-slate-800/60 border border-green-500/30 rounded-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center text-xs text-green-300">
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Convergence detected. Finalizing model improvements...
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Phase 3: Performance Improvements */}
            {activePhase === 3 && (
              <motion.div
                key="performance-improvements"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mt-8 mx-auto bg-slate-800/60 border border-green-500/30 rounded-md px-4 py-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-medium text-green-300">Enhanced Model Performance</h4>
                    <div className="ml-3 px-2 py-0.5 bg-green-500/20 rounded-full text-xs text-green-300">
                      +{modelAccuracy - 78}% improvement
                    </div>
                  </div>
                </motion.div>
                
                <div className="flex-1 grid grid-cols-2 p-6 gap-6">
                  {/* Performance over time chart - zoomed out for better visibility */}
                  <motion.div
                    className="bg-slate-800/40 rounded-lg border border-slate-700 p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h4 className="text-sm font-medium text-blue-300 mb-4">Continuous Improvement</h4>
                    
                    <div className="relative h-[230px]">
                      {/* Chart grid lines - adjusted for lower starting percentage */}
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="absolute w-full h-px bg-slate-700/50" 
                          style={{ bottom: `${idx * 20}%` }}
                        >
                          <span className="absolute -left-6 -top-2 text-xs text-gray-500">
                            {70 + idx * 5}%
                          </span>
                        </div>
                      ))}
                      
                      {/* X-axis month labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                        {improvementData.map((point, idx) => (
                          <span key={idx} className="text-xs text-gray-500">
                            {point.month}
                          </span>
                        ))}
                      </div>
                      
                      {/* Chart line - adjusted viewBox and calculation for better visibility */}
                      <svg className="absolute inset-0 h-[220px]" preserveAspectRatio="none" viewBox="0 0 8 30">
                        <motion.path
                          d={`M0,${30 - (improvementData[0].accuracy - 70) * 30 / 30} ${improvementData.map((point, idx) => {
                            return `L${idx},${30 - (point.accuracy - 70) * 30 / 30}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="url(#chartGradient)"
                          strokeWidth="0.3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 0.8 }}
                        />
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Data points - adjusted calculation for better visibility */}
                      {improvementData.map((point, idx) => (
                        <motion.div
                          key={idx}
                          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
                          style={{ 
                            bottom: `${(point.accuracy - 70) * 100 / 30}%`, 
                            left: `${idx * 100 / (improvementData.length - 1)}%`,
                            transform: 'translate(-50%, 50%)'
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.8 + (idx * 0.1), duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Learning sources and insights */}
                  <motion.div
                    className="flex flex-col"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="bg-slate-800/40 rounded-lg border border-slate-700 p-4 mb-4">
                      <h4 className="text-sm font-medium text-teal-300 mb-3">Learning Sources</h4>
                      <div className="flex justify-between items-center">
                        {learningSources.map((source, idx) => (
                          <motion.div
                            key={source.name}
                            className="text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + (idx * 0.1) }}
                          >
                            <div className={`w-10 h-10 mx-auto rounded-full bg-opacity-20 flex items-center justify-center mb-1`}
                                 style={{ backgroundColor: `${source.color}30` }}>
                              <div className="text-white">
                                {source.icon}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">{source.name}</div>
                            <div className="text-xs text-teal-300 mt-1">{source.value}%</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {showInsights && (
                        <motion.div
                          className="bg-slate-800/40 rounded-lg border border-slate-700 p-4 flex-1"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          <h4 className="text-sm font-medium text-green-300 mb-3">Key Improvements</h4>
                          <div className="space-y-2">
                            {improvementInsights.map((insight, idx) => (
                              <motion.div
                                key={insight}
                                className="flex items-center text-xs"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                                <span className="text-gray-300">{insight}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}