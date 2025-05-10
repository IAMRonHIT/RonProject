"use client"

import React, { useState } from "react"
import { IDEPanel } from "./IDEPanel"

export function ExampleUsage() {
  const [code, setCode] = useState<string>(`{
  "name": "care-plan-generator",
  "version": "2.0.0",
  "description": "A glassmorphic-themed JSON editor for the Care Plan Generator",
  "properties": {
    "theme": "#00FFFF",
    "enabled": true,
    "transparency": 0.8,
    "glowIntensity": 100
  }
}`)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Editor Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Read-Only Mode */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00FFFF] shadow-[0_0_5px_#00FFFF]"></div>
            <h3 className="text-xl font-semibold text-white">Read-Only Mode</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Display code with syntax highlighting and glassmorphic styling.
          </p>
          <IDEPanel
            content={code}
            readOnly={true}
            height="300px"
          />
        </div>
        
        {/* Editable Mode */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00FFFF] shadow-[0_0_5px_#00FFFF]"></div>
            <h3 className="text-xl font-semibold text-white">Editable Mode</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Edit code with real-time updates and glassmorphic cursor effects.
          </p>
          <IDEPanel
            content={code}
            readOnly={false}
            height="300px"
            onChange={(value) => setCode(value || "")}
          />
        </div>
      </div>
      
      {/* Current Value Display */}
      <div className="space-y-4 relative">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#00FFFF] shadow-[0_0_5px_#00FFFF]"></div>
          <h3 className="text-xl font-semibold text-white">Current Value</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          The editor's content is tracked in state and displayed below.
        </p>
        
        {/* Stylized output panel */}
        <div className="relative">
          {/* Glow effect behind the panel */}
          <div className="absolute -inset-1 bg-[#00FFFF] opacity-10 blur-md rounded-lg"></div>
          
          <pre className="relative bg-gray-900/70 backdrop-blur-sm p-6 rounded-lg border border-[#00FFFF50] text-gray-300 overflow-auto font-mono text-sm">
            {code}
          </pre>
        </div>
      </div>
    </div>
  )
}
