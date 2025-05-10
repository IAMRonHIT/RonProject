"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { InteractiveScene } from "@/components/interactive-scene"
import { useIsMobile } from "@/hooks/use-mobile"

export default function RonAiHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const isMobile = useIsMobile()

  // Handle scene loading
  const handleSceneLoad = () => {
    setSceneLoaded(true);
    console.log("Interactive scene loaded");
  }

  // Handle resize for better mobile experience
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to ensure proper layout
      setSceneLoaded(false)
      setTimeout(() => setSceneLoaded(true), 100)
    }

    // Add resize listener with debounce
    let resizeTimer: NodeJS.Timeout
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 250)
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])
  
  // Initialize the scene on load
  useEffect(() => {
    // Short timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      if (heroRef.current) {
        const sceneContainer = heroRef.current.querySelector('.interactive-scene-container');
        if (sceneContainer) {
          // Force focus to activate flashlight
          (sceneContainer as HTMLElement).focus();
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000511] text-white relative overflow-hidden pt-16" ref={heroRef}>

      {/* Main content - Two column layout */}
      <div className="h-screen w-full relative flex flex-col md:flex-row">
        {/* Hero Text - Left side (full width on mobile, half on desktop) */}
        <div className="w-full md:w-1/2 h-full flex items-center z-10 px-5 sm:px-8 md:px-16">
          <div className="max-w-xl relative">
            <h1 className="font-['Audiowide'] text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-4 sm:mb-6">
              <span className="text-metallic block">Healthcare</span>
              <span className="text-metallic block">Automation</span>
              <span className="text-metallic-cyan block">Reimagined</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-gray-300">
              Ron AI automates complex healthcare workflows, reduces administrative burden, and enables proactive care
              through intelligent orchestration.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-[#000511] font-medium" asChild>
                <Link href="/framework">
                  Explore Framework <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF]/10">
                Watch Demo
              </Button>
            </div>

            <div className="mt-10 sm:mt-16 flex items-center">
              <div className="h-px bg-[#00BFFF]/30 flex-grow mr-4"></div>
              <span className="text-xs sm:text-sm uppercase tracking-widest text-gray-400 flex items-center">
                Explore Solutions <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* 3D Scene with flashlight reveal effect - Right side (hidden on small mobile, shown on larger screens) */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full relative mt-4 md:mt-0">
          <InteractiveScene 
            onLoad={handleSceneLoad} 
            className="interactive-scene-container" 
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-2">Scroll to explore</span>
        <div className="w-5 h-8 sm:w-6 sm:h-10 border border-gray-500 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#00BFFF] rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

