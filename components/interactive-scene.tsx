"use client"

import { useEffect, useState, useRef } from "react"
import { SplineScene } from "@/components/ui/splite"
import { FlashlightController } from "./flashlight-controller"
import { FlashlightBeam } from "./flashlight-beam"
import { useIsMobile } from "@/hooks/use-mobile"
import { safePlayVideo } from "@/utils/video-helpers"
import { cn } from "@/lib/utils"

// Define types for Spline objects
interface SplineObject {
  name: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    set: (x: number, y: number, z: number) => void;
  };
  traverse: (callback: (object: SplineObject) => void) => void;
}

interface SplineScene {
  findObjectByName: (name: string) => SplineObject | null;
}

interface InteractiveSceneProps {
  className?: string
  onLoad?: () => void
}

export function InteractiveScene({ className, onLoad }: InteractiveSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const splineRef = useRef<any>(null)
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoElements = useRef<HTMLVideoElement[]>([])

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
      onLoad?.()

      // Try to play any videos in the scene
      const videos = document.querySelectorAll("video")
      videos.forEach((video) => {
        videoElements.current.push(video)
        safePlayVideo(video)
      })

      // Ensure flashlight is visible by focusing on container
      if (containerRef.current) {
        containerRef.current.focus()
      }
    }, 1000) // Reduced timeout for faster loading

    return () => clearTimeout(timer)
  }, [onLoad])

  // Function to handle Spline scene load
  const handleSplineLoad = (spline: SplineScene) => {
    splineRef.current = spline
    console.log("Spline scene loaded")

    // Attempt to reposition the robot to the right side
    try {
      const scene = spline.findObjectByName("Scene")
      if (scene) {
        // Find the robot object
        let robotObject: SplineObject | null = null
        scene.traverse((object: SplineObject) => {
          if (object.name.toLowerCase().includes("robot")) {
            robotObject = object
          }
        })

        // If robot found, reposition it
        if (robotObject) {
          console.log("Repositioning robot to the right side")

          // Use type assertion to help TypeScript understand the object structure
          const typedRobot = robotObject as {
            position?: { x: number; y: number; z: number };
            scale?: { set: (x: number, y: number, z: number) => void };
          };

          // Move the robot to the right side
          // Note: Exact values may need adjustment based on the specific Spline scene
          if (typedRobot.position) {
            // Store original position for reference
            const originalX = typedRobot.position.x

            // Move to the right
            typedRobot.position.x = originalX + 2

            // Adjust based on mobile or desktop
            if (isMobile) {
              // Check if position and scale properties exist before accessing them
              if (typedRobot.position) {
                typedRobot.position.y -= 0.5 // Move up slightly on mobile
              }
              if (typedRobot.scale) {
                typedRobot.scale.set(0.7, 0.7, 0.7) // Scale down more on mobile
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Could not reposition robot:", error)
    }
  }

  // Handle visibility changes to pause/play videos when tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause videos when tab is not visible
        videoElements.current.forEach((video) => {
          if (!video.paused) {
            video.pause()
          }
        })
      } else {
        // Resume videos when tab becomes visible again
        videoElements.current.forEach((video) => {
          safePlayVideo(video)
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-[#000511] overflow-hidden",
        isMobile ? "h-[50vh]" : "h-screen",
        className
      )}
      tabIndex={0} // Make container focusable
      onMouseMove={() => {
        // Make sure flashlight is active on any mouse movement
        if (containerRef.current) {
          containerRef.current.focus()
        }
      }}
    >
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#000511]">
          <div className="loader"></div>
        </div>
      )}

      {/* Flashlight controller wraps everything for coordinated effects */}
      <FlashlightController>
        {/* Spline 3D scene with robot */}
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          onLoad={handleSplineLoad}
        />

        {/* Flashlight beam overlay */}
        <FlashlightBeam />
        
        {/* Instruction overlay (only shown briefly on initial load) */}
        {isLoaded && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 animate-fade-out"
          >
            <div className="bg-black/30 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              Move your cursor to control the flashlight
            </div>
          </div>
        )}
      </FlashlightController>
    </div>
  )
}

