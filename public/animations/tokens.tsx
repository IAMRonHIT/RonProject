"use client"

import React from 'react'
import { motion } from 'framer-motion'

export function TokenizationAnimation() {
  // Sample text to tokenize
  const sampleText = "Patient presents with fever and cough"
  const tokens = sampleText.split(' ')
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-lg p-6">
      <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center scale-[0.8]">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">
            Tokenization Process
          </h3>
          <p className="text-gray-300 max-w-md">
            Converting medical text into standardized tokens for AI processing
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 w-full max-w-2xl">
          {/* Input text */}
          <motion.div 
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 }
            }}
          >
            <div className="text-sm text-gray-400 mb-2">Input Text:</div>
            <div className="text-white text-lg font-mono">{sampleText}</div>
          </motion.div>
          
          {/* Tokenization Process */}
          <div className="relative flex justify-center items-center h-16">
            <motion.div 
              className="absolute w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: 1, 
                opacity: 1,
                transition: { 
                  duration: 1,
                  delay: 0.5
                }
              }}
            />
            <motion.div
              className="absolute bg-slate-800 border border-indigo-500/50 rounded-full p-2 shadow-lg shadow-indigo-500/20"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                transition: { 
                  duration: 0.8,
                  delay: 0.8
                  // Removed spring type to support multiple keyframes
                }
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-indigo-400"
              >
                <path 
                  d="M20 5H4C3.44772 5 3 5.44772 3 6V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V6C21 5.44772 20.5523 5 20 5Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M7 9L7 15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M11 9L11 15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M15 9L15 15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M19 9L19 15" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
          
          {/* Output tokens */}
          <div className="grid grid-cols-5 gap-2">
            {tokens.map((token, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center bg-slate-800/80 border border-purple-500/30 rounded-md p-2 text-center text-sm"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    duration: 0.5,
                    delay: 1 + (index * 0.2)
                  }
                }}
              >
                <div>
                  <div className="text-purple-300 font-mono">{token}</div>
                  <div className="text-gray-500 text-xs mt-1">#{(1000 + index).toString()}</div>
                </div>
              </motion.div>
            ))}
            
            {/* Placeholder for numerical ID tokens */}
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.div
                key={`id-${index}`}
                className="flex items-center justify-center bg-slate-800/80 border border-purple-500/30 rounded-md p-2 text-center text-sm"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    duration: 0.5,
                    delay: 1 + ((tokens.length + index) * 0.2)
                  }
                }}
              >
                <div>
                  <div className="text-purple-300 font-mono">{index < 3 ? 'medical_term' : 'symptom'}{index+1}</div>
                  <div className="text-gray-500 text-xs mt-1">#{(2000 + index).toString()}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 