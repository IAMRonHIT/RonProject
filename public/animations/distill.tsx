"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function DeepResearchAnimation() {
  const [activeStage, setActiveStage] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  
  // Auto-progress through stages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStage < 3) {
        setActiveStage(prev => prev + 1);
      } else if (activeStage === 3 && !showInsights) {
        setShowInsights(true);
      }
    }, activeStage === 3 ? 2000 : 4000);
    
    return () => clearTimeout(timer);
  }, [activeStage, showInsights]);
  
  // Knowledge nodes for the visualization
  const nodes = [
    { id: 1, label: "Clinical Trials", x: 150, y: 100, size: 30, color: "#c084fc", category: "research" },
    { id: 2, label: "Medical Guidelines", x: 350, y: 80, size: 28, color: "#818cf8", category: "guidelines" },
    { id: 3, label: "Patient Data", x: 250, y: 200, size: 35, color: "#38bdf8", category: "data" },
    { id: 4, label: "Research Papers", x: 450, y: 180, size: 32, color: "#a78bfa", category: "research" },
    { id: 5, label: "Treatment Outcomes", x: 120, y: 280, size: 30, color: "#34d399", category: "data" },
    { id: 6, label: "Diagnostic Criteria", x: 320, y: 320, size: 26, color: "#60a5fa", category: "guidelines" },
    { id: 7, label: "Meta Analyses", x: 500, y: 280, size: 28, color: "#c084fc", category: "research" },
    { id: 8, label: "Expert Consensus", x: 600, y: 120, size: 25, color: "#f472b6", category: "guidelines" },
  ];
  
  // Define connections between knowledge nodes
  const connections = [
    { source: 1, target: 2, strength: 0.7 },
    { source: 1, target: 3, strength: 0.5 },
    { source: 2, target: 4, strength: 0.8 },
    { source: 2, target: 6, strength: 0.9 },
    { source: 3, target: 5, strength: 0.6 },
    { source: 3, target: 6, strength: 0.4 },
    { source: 4, target: 7, strength: 0.7 },
    { source: 4, target: 8, strength: 0.5 },
    { source: 5, target: 6, strength: 0.6 },
    { source: 7, target: 8, strength: 0.8 },
    { source: 7, target: 2, strength: 0.6 },
    { source: 6, target: 8, strength: 0.3 },
  ];
  
  // Sample insights derived from the model
  const clinicalInsights = [
    { id: 1, text: "83% improvement in early diagnosis accuracy", category: "diagnostic" },
    { id: 2, text: "Reduced treatment selection time by 65%", category: "efficiency" },
    { id: 3, text: "27% fewer unnecessary tests ordered", category: "cost" },
    { id: 4, text: "Improved medication adherence prediction", category: "outcome" },
    { id: 5, text: "Identified novel risk factors for complications", category: "research" },
  ];
  
  // Return a color based on the category
  const getCategoryColor = (category) => {
    switch(category) {
      case "research": return "rgba(192, 132, 252, 0.7)"; // purple
      case "guidelines": return "rgba(96, 165, 250, 0.7)"; // blue
      case "data": return "rgba(52, 211, 153, 0.7)"; // green
      case "diagnostic": return "rgba(248, 113, 113, 0.7)"; // red
      case "efficiency": return "rgba(251, 191, 36, 0.7)"; // amber
      case "cost": return "rgba(139, 92, 246, 0.7)"; // violet
      case "outcome": return "rgba(52, 211, 153, 0.7)"; // green
      default: return "rgba(156, 163, 175, 0.7)"; // gray
    }
  };
  
  // Return a position for the target node in the distillation process
  const getDistilledPosition = (node) => {
    const centerX = 350;
    const centerY = 200;
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 30;
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: node.size * 0.6
    };
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-lg p-6">
      <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center scale-[0.85]">
        <div className="text-center mb-6">
          <motion.h3 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Knowledge Distillation
          </motion.h3>
          <motion.p 
            className="text-gray-300 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Compressing complex medical knowledge into accurate, efficient models
          </motion.p>
        </div>
        
        {/* Process Step Indicators */}
        <motion.div
          className="flex justify-between w-full max-w-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {[
            "Knowledge Acquisition", 
            "Pattern Recognition", 
            "Model Compression", 
            "Clinical Insights"
          ].map((step, idx) => (
            <div key={step} className="flex flex-col items-center">
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeStage >= idx 
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                    : 'bg-slate-800 border border-slate-700'
                }`}
                animate={{
                  scale: activeStage === idx ? [1, 1.1, 1] : 1,
                  transition: { duration: 1.5, repeat: activeStage === idx ? Infinity : 0 }
                }}
              >
                <span className="text-white text-sm font-medium">{idx + 1}</span>
              </motion.div>
              <span className={`text-xs mt-2 ${activeStage >= idx ? 'text-indigo-300' : 'text-slate-500'}`}>
                {step}
              </span>
              {idx < 3 && (
                <motion.div 
                  className={`h-0.5 w-12 mt-5 ${activeStage > idx ? 'bg-indigo-500/50' : 'bg-slate-700'}`}
                  initial={{ width: 0 }}
                  animate={{ width: activeStage > idx ? 12 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', left: `calc(25% * ${idx + 1})`, transform: 'translateX(-50%)' }}
                />
              )}
            </div>
          ))}
        </motion.div>
        
        {/* Main Visualization Area */}
        <div className="relative w-full h-[400px] border border-slate-700/50 rounded-lg bg-slate-900/30 overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 700 400">
            {/* Background grid effect */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148, 163, 184, 0.05)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Central model/distillation effect for stages 2+ */}
            {activeStage >= 2 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <motion.circle
                  cx="350"
                  cy="200"
                  r="50"
                  fill="url(#centralGradient)"
                  animate={{
                    r: [50, 55, 50],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                <motion.circle
                  cx="350"
                  cy="200"
                  r="70"
                  fill="none"
                  stroke="url(#pulseGradient)"
                  strokeWidth="2"
                  animate={{
                    r: [70, 90, 70],
                    opacity: [0.2, 0.5, 0.2],
                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                
                {/* Model inner structure suggestion */}
                {activeStage >= 3 && (
                  <>
                    <motion.line x1="335" y1="180" x2="365" y2="180" stroke="rgba(255,255,255,0.7)" strokeWidth="2" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                    <motion.line x1="330" y1="190" x2="370" y2="190" stroke="rgba(255,255,255,0.7)" strokeWidth="2" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
                    <motion.line x1="335" y1="200" x2="365" y2="200" stroke="rgba(255,255,255,0.7)" strokeWidth="2" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                    <motion.line x1="330" y1="210" x2="370" y2="210" stroke="rgba(255,255,255,0.7)" strokeWidth="2" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                    <motion.line x1="335" y1="220" x2="365" y2="220" stroke="rgba(255,255,255,0.7)" strokeWidth="2" 
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
                  </>
                )}
              </motion.g>
            )}
            
            {/* Knowledge Connections */}
            {connections.map((conn) => {
              const source = nodes.find(n => n.id === conn.source);
              const target = nodes.find(n => n.id === conn.target);
              const sourcePos = activeStage >= 2 ? getDistilledPosition(source) : source;
              const targetPos = activeStage >= 2 ? getDistilledPosition(target) : target;
              
              // For stages 2+, all connections go through the center
              const renderPath = () => {
                if (activeStage < 2) {
                  return `M${source.x},${source.y} L${target.x},${target.y}`;
                } else {
                  // Make paths curve toward the center in stage 2+
                  const centerX = 350;
                  const centerY = 200;
                  
                  return `M${sourcePos.x},${sourcePos.y} Q${centerX},${centerY} ${targetPos.x},${targetPos.y}`;
                }
              };
              
              return (
                <motion.path
                  key={`${conn.source}-${conn.target}`}
                  d={renderPath()}
                  stroke={getCategoryColor(source.category)}
                  strokeWidth={1 + conn.strength}
                  strokeOpacity={0.5}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: activeStage >= 2 ? 0.7 : 0.5 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: activeStage >= 1 ? 0.2 : (conn.source * 0.1) 
                  }}
                />
              );
            })}
            
            {/* Knowledge Nodes */}
            {nodes.map((node) => {
              // Determine node positions based on the active stage
              const nodePos = activeStage >= 2 ? getDistilledPosition(node) : node;
              
              return (
                <motion.g key={node.id} animate={{ 
                  x: activeStage >= 2 ? nodePos.x - node.x : 0,
                  y: activeStage >= 2 ? nodePos.y - node.y : 0,
                  scale: activeStage >= 2 ? (nodePos.size / node.size) : 1
                }} transition={{ duration: 1.5, type: "spring" }}>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size / 2}
                    fill={getCategoryColor(node.category)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: activeStage >= 3 ? 0.4 : 0.8 
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.3 + (node.id * 0.15) 
                    }}
                  />
                  
                  {/* Node labels for stage 0 and 1 */}
                  {activeStage < 2 && (
                    <motion.text
                      x={node.x}
                      y={node.y + node.size/2 + 15}
                      fontSize="10"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.7)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + (node.id * 0.1) }}
                    >
                      {node.label}
                    </motion.text>
                  )}
                  
                  {/* Pulsing effect for nodes during acquisition stage */}
                  {activeStage === 0 && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size / 2 + 5}
                      fill="transparent"
                      stroke={getCategoryColor(node.category)}
                      strokeWidth="1"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ 
                        scale: [0.9, 1.3, 0.9], 
                        opacity: [0, 0.4, 0],
                        transition: { 
                          duration: 3,
                          repeat: Infinity,
                          delay: node.id * 0.2
                        }
                      }}
                    />
                  )}
                </motion.g>
              );
            })}
            
            {/* Data flow animation for stage 2+ */}
            {activeStage >= 2 && (
              <>
                {nodes.map((node) => {
                  const nodePos = getDistilledPosition(node);
                  
                  return (
                    <motion.circle
                      key={`flow-${node.id}`}
                      r={3}
                      fill={getCategoryColor(node.category)}
                      initial={{ 
                        cx: nodePos.x, 
                        cy: nodePos.y,
                        opacity: 0 
                      }}
                      animate={{
                        cx: [nodePos.x, 350, nodePos.x],
                        cy: [nodePos.y, 200, nodePos.y],
                        opacity: [0, 0.8, 0],
                        transition: { 
                          duration: 2 + Math.random() * 3,
                          repeat: Infinity,
                          delay: node.id * 0.3,
                          ease: "easeInOut"
                        }
                      }}
                    />
                  );
                })}
              </>
            )}
            
            {/* Stage 3: Insights rays emanating from the center */}
            {activeStage === 3 && showInsights && (
              <>
                {Array.from({ length: 8 }).map((_, idx) => {
                  const angle = (idx * Math.PI / 4) + (Math.random() * 0.2);
                  const length = 150 + Math.random() * 50;
                  const endX = 350 + Math.cos(angle) * length;
                  const endY = 200 + Math.sin(angle) * length;
                  
                  return (
                    <motion.line
                      key={`ray-${idx}`}
                      x1="350"
                      y1="200"
                      x2={endX}
                      y2={endY}
                      stroke={`hsl(${210 + idx * 20}, 70%, 60%)`}
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: [0, 0.8, 0.4],
                        transition: { 
                          duration: 2,
                          delay: 0.1 * idx,
                          repeat: Infinity,
                          repeatType: "loop",
                          repeatDelay: idx * 0.3
                        }
                      }}
                    />
                  );
                })}
              </>
            )}
            
            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
              </linearGradient>
              
              <radialGradient id="centralGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
              </radialGradient>
              
              <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          
          {/* Labels/Annotations for each stage */}
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/80 border border-purple-500/30 px-4 py-2 rounded-md max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-sm font-medium text-purple-300 mb-1">Knowledge Acquisition</h4>
                <p className="text-xs text-gray-300">Large models ingest vast amounts of medical literature, clinical guidelines, and research data.</p>
              </motion.div>
            )}
            
            {activeStage === 1 && (
              <motion.div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/80 border border-indigo-500/30 px-4 py-2 rounded-md max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-sm font-medium text-indigo-300 mb-1">Pattern Recognition</h4>
                <p className="text-xs text-gray-300">The model identifies complex patterns and relationships within medical knowledge domains.</p>
              </motion.div>
            )}
            
            {activeStage === 2 && (
              <motion.div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/80 border border-blue-500/30 px-4 py-2 rounded-md max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-sm font-medium text-blue-300 mb-1">Model Compression</h4>
                <p className="text-xs text-gray-300">Essential knowledge is distilled into a smaller, more efficient model while preserving accuracy.</p>
              </motion.div>
            )}
            
            {activeStage === 3 && (
              <motion.div 
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/80 border border-teal-500/30 px-4 py-2 rounded-md max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-sm font-medium text-teal-300 mb-1">Clinical Insights Generation</h4>
                <p className="text-xs text-gray-300">The distilled model delivers actionable insights and recommendations at the point of care.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Clinical Insights Section - Appears in Stage 3 */}
        <AnimatePresence>
          {showInsights && (
            <motion.div 
              className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {clinicalInsights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
                       style={{ background: getCategoryColor(insight.category) }}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-200">{insight.text}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Performance comparison - Appears in final stage */}
        {showInsights && (
          <motion.div
            className="w-full mt-6 bg-slate-800/60 border border-indigo-500/20 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h4 className="text-sm font-medium text-indigo-300 mb-3">Performance Comparison</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Model Size</span>
                  <span>95% smaller</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Inference Speed</span>
                  <span>87% faster</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "87%" }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Clinical Accuracy</span>
                  <span>96% retained</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "96%" }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Resource Utilization</span>
                  <span>91% reduced</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "91%" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}