"use client"

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function DataRefiningAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4">
      <div className="relative w-full max-w-3xl h-full flex flex-col items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <DataNodesAnimation />
          </svg>
        </div>
        <div className="z-10 text-center">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
            Data Preparation
          </h3>
          <p className="text-gray-300 max-w-md">
            Processing and organizing healthcare data from various sources for AI training
          </p>
        </div>
      </div>
    </div>
  )
}

function DataNodesAnimation() {
  const nodeCount = 20
  const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
    id: i,
    x: 100 + Math.random() * 600,
    y: 100 + Math.random() * 400,
    radius: 5 + Math.random() * 15,
    color: `rgb(${50 + Math.random() * 100}, ${150 + Math.random() * 100}, ${200 + Math.random() * 55})`,
    delay: Math.random() * 2
  }))

  const lines = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.85) {
        lines.push({
          id: `${i}-${j}`,
          x1: nodes[i].x,
          y1: nodes[i].y,
          x2: nodes[j].x,
          y2: nodes[j].y,
          color: `rgba(0, 180, 216, ${0.1 + Math.random() * 0.2})`,
          delay: Math.random()
        })
      }
    }
  }

  return (
    <>
      {/* Background grid */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Connection lines */}
      {lines.map((line) => (
        <motion.line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color}
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: [0, 0.8, 0.2],
            transition: { 
              delay: line.delay,
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse" 
            } 
          }}
        />
      ))}

      {/* Data nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={node.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.1, 1], 
              opacity: 1,
              transition: { 
                delay: node.delay,
                duration: 1,
                ease: "easeOut" 
              } 
            }}
          />
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.radius + 5}
            fill="transparent"
            stroke={node.color}
            strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.5, 0.8], 
              opacity: [0, 0.5, 0],
              transition: { 
                delay: node.delay,
                duration: 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              } 
            }}
          />
        </g>
      ))}

      {/* Central data processor */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { delay: 1, duration: 1 } 
        }}
      >
        <motion.rect
          x="350"
          y="250"
          width="100"
          height="100"
          rx="15"
          fill="rgba(56, 189, 248, 0.2)"
          stroke="rgba(56, 189, 248, 0.8)"
          strokeWidth="2"
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [0.9, 1, 0.9],
            rotateZ: [0, 2, -2, 0],
            transition: { 
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror" 
            } 
          }}
        />
        <motion.path
          d="M370 280 L385 290 L400 280 M400 280 L415 290 L430 280"
          stroke="rgba(186, 230, 253, 0.8)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: 1,
            transition: { 
              duration: 2,
              delay: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1
            } 
          }}
        />
        <motion.path
          d="M370 300 L385 310 L400 300 M400 300 L415 310 L430 300"
          stroke="rgba(186, 230, 253, 0.8)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: 1,
            transition: { 
              duration: 2,
              delay: 2,
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1
            } 
          }}
        />
        <motion.path
          d="M370 320 L385 330 L400 320 M400 320 L415 330 L430 320"
          stroke="rgba(186, 230, 253, 0.8)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ 
            pathLength: 1,
            transition: { 
              duration: 2,
              delay: 2.5,
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1
            } 
          }}
        />
      </motion.g>
    </>
  )
}