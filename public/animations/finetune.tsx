"use client"

import React, { useState, useEffect } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

export function ModelTrainingAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const modelControls = useAnimation();
  
  // Neural network nodes for visualization
  const layers = [
    { id: 'input', nodes: 8, label: 'Input Layer' },
    { id: 'hidden1', nodes: 12, label: 'Hidden Layer 1' },
    { id: 'hidden2', nodes: 16, label: 'Hidden Layer 2' },
    { id: 'hidden3', nodes: 12, label: 'Hidden Layer 3' },
    { id: 'output', nodes: 6, label: 'Output Layer' }
  ];
  
  // Training metrics data
  const trainingMetrics = [
    { id: 'accuracy', label: 'Accuracy', initValue: 0.42, targetValue: 0.96, color: '#38bdf8' },
    { id: 'precision', label: 'Precision', initValue: 0.38, targetValue: 0.92, color: '#818cf8' },
    { id: 'recall', label: 'Recall', initValue: 0.45, targetValue: 0.94, color: '#c084fc' },
    { id: 'f1', label: 'F1 Score', initValue: 0.40, targetValue: 0.93, color: '#22d3ee' }
  ];
  
  // Domain-specific data points
  const domainData = [
    { type: 'Medical Records', count: 120000, color: '#60a5fa' },
    { type: 'Research Papers', count: 58000, color: '#a78bfa' },
    { type: 'Clinical Notes', count: 320000, color: '#34d399' },
    { type: 'Treatment Outcomes', count: 145000, color: '#f472b6' },
  ];
  
  useEffect(() => {
    const startAnimation = async () => {
      // Initial delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sequentially advance through steps
      for (let i = 0; i <= 4; i++) {
        setActiveStep(i);
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 1500 : 3000));
      }
      
      // Mark complete after all steps
      setAnimationComplete(true);
    };
    
    startAnimation();
  }, []);
  
  // Calculate node positions in the neural network
  const calculateNodePositions = (layerIndex, nodeIndex, totalNodes) => {
    const layerWidth = 800;
    const layerSpacing = layerWidth / (layers.length + 1);
    const x = (layerIndex + 1) * layerSpacing;
    
    const layerHeight = 350;
    const nodeSpacing = layerHeight / (totalNodes + 1);
    const y = (nodeIndex + 1) * nodeSpacing;
    
    return { x, y };
  };
  
  // Generate connections between layers
  const generateConnections = () => {
    const connections = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const fromLayer = layers[i];
      const toLayer = layers[i + 1];
      
      for (let fromNode = 0; fromNode < fromLayer.nodes; fromNode++) {
        for (let toNode = 0; toNode < toLayer.nodes; toNode++) {
          // Create connections more sparsely for better visualization
          if ((fromNode + toNode) % 3 === 0 || Math.random() > 0.7) {
            const from = calculateNodePositions(i, fromNode, fromLayer.nodes);
            const to = calculateNodePositions(i + 1, toNode, toLayer.nodes);
            
            connections.push({
              id: `${fromLayer.id}-${fromNode}-${toLayer.id}-${toNode}`,
              from,
              to,
              weight: Math.random(),
              layerIndex: i
            });
          }
        }
      }
    }
    
    return connections;
  };
  
  const connections = generateConnections();
  
  // Render the neural network visualization
  const renderNeuralNetwork = () => {
    return (
      <div className="relative w-full h-[400px] mt-8 mb-6">
        <svg width="100%" height="100%" viewBox="0 0 800 400" className="overflow-visible">
          {/* Connections between nodes */}
          {connections.map((connection, idx) => (
            <motion.line
              key={connection.id}
              x1={connection.from.x}
              y1={connection.from.y}
              x2={connection.to.x}
              y2={connection.to.y}
              strokeWidth={connection.weight * 1.5}
              initial={{ 
                stroke: "rgba(148, 163, 184, 0.1)",
                pathLength: 0,
                opacity: 0
              }}
              animate={{ 
                stroke: activeStep >= 2 
                  ? `rgba(${59 + (connection.weight * 100)}, ${130 + (connection.weight * 100)}, ${246 - (connection.weight * 100)}, ${0.3 + (connection.weight * 0.4)})`
                  : "rgba(148, 163, 184, 0.15)",
                pathLength: 1,
                opacity: 1
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3 + (idx % 10) * 0.02,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Render nodes for each layer */}
          {layers.map((layer, layerIndex) => (
            <g key={layer.id}>
              {/* Layer label */}
              <motion.text
                x={calculateNodePositions(layerIndex, 0, layer.nodes).x}
                y={20}
                textAnchor="middle"
                fontSize="12"
                fill="#94a3b8"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + layerIndex * 0.1 }}
              >
                {layer.label}
              </motion.text>
              
              {/* Nodes */}
              {Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
                const { x, y } = calculateNodePositions(layerIndex, nodeIndex, layer.nodes);
                const isActive = activeStep >= 1;
                const isHighlighted = activeStep >= 2 && 
                                     (nodeIndex % 4 === 0 || 
                                      (layerIndex === 2 && nodeIndex % 3 === 0) || 
                                      Math.random() > 0.7);
                
                return (
                  <g key={`${layer.id}-${nodeIndex}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={isHighlighted ? 6 : 4}
                      initial={{ 
                        fill: "rgba(148, 163, 184, 0.3)",
                        stroke: "rgba(148, 163, 184, 0.5)",
                        scale: 0
                      }}
                      animate={{ 
                        fill: isHighlighted 
                          ? (activeStep >= 3 ? "rgba(56, 189, 248, 0.5)" : "rgba(99, 102, 241, 0.4)") 
                          : (isActive ? "rgba(148, 163, 184, 0.3)" : "rgba(148, 163, 184, 0.2)"),
                        stroke: isHighlighted 
                          ? (activeStep >= 3 ? "rgba(56, 189, 248, 0.8)" : "rgba(99, 102, 241, 0.6)")
                          : "rgba(148, 163, 184, 0.5)",
                        scale: 1
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.1 + layerIndex * 0.1 + nodeIndex * 0.02 
                      }}
                    />
                    
                    {/* Pulsing effect for highlighted nodes */}
                    {isHighlighted && activeStep >= 2 && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={8}
                        fill="transparent"
                        stroke={activeStep >= 3 ? "rgba(56, 189, 248, 0.4)" : "rgba(99, 102, 241, 0.3)"}
                        strokeWidth={1.5}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [0.8, 1.5, 0.8],
                          opacity: [0, 0.5, 0],
                          transition: { 
                            duration: 2.5,
                            repeat: Infinity,
                            delay: nodeIndex * 0.1
                          }
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          ))}
          
          {/* Data flow animation */}
          {activeStep >= 2 && (
            <>
              {Array.from({ length: 15 }).map((_, idx) => (
                <motion.circle
                  key={`data-particle-${idx}`}
                  r={2 + Math.random() * 2}
                  fill={
                    idx % 4 === 0 ? "#38bdf8" : 
                    idx % 4 === 1 ? "#818cf8" : 
                    idx % 4 === 2 ? "#c084fc" : 
                    "#22d3ee"
                  }
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    pathOffset: [0, 1],
                    transition: { 
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: idx * 0.3,
                      ease: "linear"
                    }
                  }}
                >
                  <motion.mpath xlinkHref="#dataPath" />
                </motion.circle>
              ))}
              
              {/* Path for data particles */}
              <path 
                id="dataPath" 
                d="M100,60 C200,120 350,80 450,200 S650,250 750,170" 
                stroke="transparent" 
                fill="none" 
              />
            </>
          )}
        </svg>
        
        {/* Animated steps indicator */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <motion.div
                key={`step-${idx}`}
                className={`w-2 h-2 rounded-full ${activeStep >= idx + 1 ? 'bg-blue-500' : 'bg-slate-600'}`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: activeStep === idx + 1 ? [0.8, 1.2, 0.8] : 1,
                  transition: { 
                    duration: 1.5,
                    repeat: activeStep === idx + 1 ? Infinity : 0
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 overflow-hidden">
      <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center">
        <div className="text-center mb-4">
          <motion.h3 
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Advanced Model Fine-Tuning
          </motion.h3>
          <motion.p 
            className="text-gray-300 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Specializing large language models for healthcare through domain-specific training
          </motion.p>
        </div>
        
        {/* Step indicator */}
        <motion.div 
          className="w-full max-w-2xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700/50 -translate-y-1/2 rounded-full" />
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${activeStep * 25}%` }}
              transition={{ duration: 0.7 }}
            />
            <div className="relative flex justify-between">
              {[
                "Base Model", 
                "Feature Extraction", 
                "Training Process", 
                "Evaluation & Refinement", 
                "Healthcare-Optimized"
              ].map((step, idx) => (
                <div 
                  key={step} 
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 ${
                      activeStep >= idx 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-white'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: activeStep === idx ? [0.8, 1.2, 0.8] : 1,
                      transition: { 
                        duration: 2,
                        repeat: activeStep === idx ? Infinity : 0
                      }
                    }}
                  >
                    {activeStep > idx && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.div>
                  <motion.span 
                    className={`text-xs mt-2 ${
                      activeStep >= idx ? 'text-blue-300' : 'text-slate-500'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    {step}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="base-model"
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-blue-300 mb-4 flex items-center">
                  <DocumentIcon className="w-5 h-5 mr-2" />
                  Foundation Model
                </h4>
                <ul className="space-y-3">
                  {[
                    "Trained on broad internet corpus",
                    "General language understanding",
                    "Basic reasoning capabilities",
                    "Limited healthcare knowledge",
                    "General text generation"
                  ].map((feature, idx) => (
                    <motion.li 
                      key={idx}
                      className="flex items-center text-sm text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-purple-300 mb-4 flex items-center">
                  <TargetIcon className="w-5 h-5 mr-2" />
                  Fine-tuning Objectives
                </h4>
                <ul className="space-y-3">
                  {[
                    "Medical terminology recognition",
                    "Clinical context understanding",
                    "Healthcare regulation compliance",
                    "Evidence-based reasoning",
                    "Healthcare-specific outputs"
                  ].map((objective, idx) => (
                    <motion.li 
                      key={idx}
                      className="flex items-center text-sm text-gray-300"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                      {objective}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
          
          {activeStep === 1 && (
            <motion.div
              key="data-preparation"
              className="w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-lg font-medium text-center text-blue-300 mb-6">Healthcare Data Corpus</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {domainData.map((data, idx) => (
                  <motion.div
                    key={data.type}
                    className="bg-slate-800/70 border border-blue-500/20 rounded-lg p-4 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="w-16 h-16 mb-3 rounded-full flex items-center justify-center" 
                         style={{ background: `radial-gradient(circle, ${data.color}40 0%, transparent 70%)` }}>
                      <motion.div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: data.color }}
                        initial={{ scale: 0.8 }}
                        animate={{ 
                          scale: [0.8, 1.1, 0.8],
                          transition: { 
                            duration: 2,
                            repeat: Infinity,
                            delay: idx * 0.3
                          }
                        }}
                      />
                    </div>
                    <h5 className="text-sm font-medium text-gray-200 mb-1">{data.type}</h5>
                    <motion.div
                      className="text-xs text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                    >
                      {data.count.toLocaleString()} samples
                    </motion.div>
                    <motion.div
                      className="w-full h-1 bg-slate-700 rounded-full mt-3 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + idx * 0.1 }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: data.color }}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, delay: 1.2 + idx * 0.2 }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="mt-8 p-4 bg-slate-800/50 border border-purple-500/20 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-purple-300">Data Processing Pipeline</h5>
                  <div className="text-xs text-gray-400">Preprocessing Complete</div>
                </div>
                <div className="flex justify-between">
                  {['Cleaning', 'Normalization', 'Augmentation', 'Tokenization', 'Vectorization'].map((step, idx) => (
                    <motion.div
                      key={step}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 + idx * 0.15 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-purple-400"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            transition: { duration: 2, repeat: Infinity, delay: idx * 0.2 }
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeStep >= 2 && (
            <motion.div
              key="neural-network"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {renderNeuralNetwork()}
              
              {activeStep >= 3 && (
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {trainingMetrics.map((metric, idx) => (
                    <div key={metric.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{metric.label}</span>
                        <motion.span 
                          className="text-blue-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          {activeStep === 3 
                            ? Math.round((metric.initValue + (metric.targetValue - metric.initValue) * 0.6) * 100) 
                            : Math.round(metric.targetValue * 100)}%
                        </motion.span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: metric.color }}
                          initial={{ width: `${metric.initValue * 100}%` }}
                          animate={{ 
                            width: activeStep === 3 
                              ? `${(metric.initValue + (metric.targetValue - metric.initValue) * 0.6) * 100}%`
                              : `${metric.targetValue * 100}%` 
                          }}
                          transition={{ 
                            duration: 1.5,
                            delay: 0.5 + idx * 0.1,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              
              {activeStep >= 4 && (
                <motion.div
                  className="mt-6 p-4 bg-slate-800/60 border border-green-500/30 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h5 className="text-sm font-medium text-green-300">Model Successfully Fine-tuned</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    {[
                      { label: "Optimized for Medical Terminology", icon: "🔬" },
                      { label: "Clinical Guidelines Awareness", icon: "📋" },
                      { label: "Healthcare-Specific Reasoning", icon: "🧠" }
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center text-xs text-gray-300 bg-slate-700/30 p-2 rounded-md"
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.15 }}
                      >
                        <span className="mr-2">{feature.icon}</span>
                        {feature.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Icon components
function DocumentIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function TargetIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}