"use client"

import React from "react"
import { ExampleUsage } from "@/components/monaco/ExampleUsage"

export default function MonacoExamplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFFF] opacity-5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFFF] opacity-5 blur-[100px] rounded-full"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Neon title with enhanced glow */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          Monaco Editor <span className="text-slate-700 opacity-90">Glassmorphic IDE</span>
        </h1>
        
        {/* Subtitle with neon accent */}
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12 text-lg">
          A custom Monaco Editor implementation with a <span className="text-[#00FFFF] font-semibold">glassmorphic theme</span> for the Care Plan Generator.
        </p>
        
        {/* Divider with neon glow */}
        <div className="w-24 h-1 bg-[#00FFFF] mx-auto mb-12 shadow-[0_0_10px_rgba(0,255,255,0.7)] rounded-full"></div>
        
        <ExampleUsage />
      </div>
    </div>
  )
}
