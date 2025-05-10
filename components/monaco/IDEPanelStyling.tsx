"use client"

import React from "react"
import { cn } from "@/lib/utils"

/**
 * This component demonstrates the Tailwind CSS classes needed for a div
 * that wraps the Monaco Editor component to create:
 * 
 * 1. A distinct panel appearance with a glassmorphic aesthetic
 * 2. A strong electric teal (#00FFFF) glow effect using box-shadows
 * 3. A semi-transparent background with blur effect for true glassmorphism
 */

interface IDEPanelWrapperProps {
  children: React.ReactNode
  className?: string
}

export function IDEPanelWrapper({ children, className }: IDEPanelWrapperProps) {
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
        
        // Pass through any additional classes
        className
      )}
    >
      {/* Add a subtle inner glow effect */}
      <div className="relative w-full h-full">
        {/* Inner glow overlay with electric teal */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#00FFFF10] to-transparent z-10"></div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  )
}

/**
 * Usage example:
 * 
 * <IDEPanelWrapper>
 *   <MonacoEditorPanel
 *     content={code}
 *     language="json"
 *     readOnly={true}
 *   />
 * </IDEPanelWrapper>
 */
