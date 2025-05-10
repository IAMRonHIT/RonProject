"use client"

import React from "react"
import { MonacoEditorPanel } from "./MonacoEditorPanel"
import { cn } from "@/lib/utils"

interface IDEPanelProps {
  content: string
  language?: string
  readOnly?: boolean
  height?: string
  className?: string
  onChange?: (value: string | undefined) => void
}

export function IDEPanel({
  content,
  language = "json",
  readOnly = true,
  height = "400px",
  className,
  onChange
}: IDEPanelProps) {
  return (
    <div 
      className={cn(
        // Glassmorphic container styling
        "glassmorphic-editor-container",
        "rounded-md overflow-hidden",
        "border border-[#00FFFF]/50", // Electric teal border with opacity
        "bg-[rgba(0,128,128,0.15)]", // Teal with opacity
        "shadow-[0_0_24px_8px_rgba(0,255,255,0.6)]", // Glowing teal effect
        "backdrop-blur-[16px]", // Blur effect for glassmorphism
        "transition-all duration-300",
        "hover:shadow-[0_0_30px_10px_rgba(0,255,255,0.7)]", // Enhanced glow on hover
        
        className
      )}
    >
      {/* Add a subtle inner glow */}
      <div className="relative w-full h-full">
        {/* Inner glow overlay with electric teal */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#00FFFF10] to-transparent z-10"></div>
        
        <MonacoEditorPanel
          content={content}
          language={language}
          readOnly={readOnly}
          height={height}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
