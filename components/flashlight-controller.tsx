"use client"

import type React from "react"

import { useEffect, useRef, useState, createContext, useContext } from "react"
import type Spline from "@splinetool/react-spline"
import type { SPEObject } from "@splinetool/runtime"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * FlashlightContext provides state and position data for the flashlight effect
 * throughout the component tree
 */
interface FlashlightContextType {
  isFlashlightActive: boolean
  flashlightPosition: { x: number; y: number }
  flashlightDirection: { x: number; y: number; z: number }
  flashlightIntensity: number
}

const FlashlightContext = createContext<FlashlightContextType>({
  isFlashlightActive: false,
  flashlightPosition: { x: 0, y: 0 },
  flashlightDirection: { x: 0, y: 0, z: 0 },
  flashlightIntensity: 0,
})

export const useFlashlight = () => useContext(FlashlightContext)

interface FlashlightControllerProps {
  children: React.ReactNode
}

/**
 * FlashlightController manages the flashlight behavior, position tracking,
 * and robot head movement in the 3D scene
 */
export function FlashlightController({ children }: FlashlightControllerProps) {
  // Device detection
  const isMobile = useIsMobile()

  // Flashlight state
  const [isFlashlightActive, setIsFlashlightActive] = useState(false)
  const [flashlightPosition, setFlashlightPosition] = useState({ x: 0, y: 0 })
  const [flashlightDirection, setFlashlightDirection] = useState({ x: 0, y: 0, z: 1 })
  const [flashlightIntensity, setFlashlightIntensity] = useState(0)

  // Spline scene references
  const splineRef = useRef<typeof Spline | null>(null)
  const robotRef = useRef<SPEObject | null>(null)
  const robotHeadRef = useRef<SPEObject | null>(null)
  const flashlightRef = useRef<SPEObject | null>(null)

  // Mouse tracking
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useRef({ x: 0, y: 0 })
  const isMouseInContainer = useRef(false)

  // Handle Spline scene load
  const handleSplineLoad = (spline: any) => {
    splineRef.current = spline

    // Try to find robot and flashlight objects
    const scene = spline.findObjectByName("Scene")
    if (scene) {
      // Find robot and related objects by traversing the scene
      scene.traverse((object: SPEObject) => {
        // Store references to important objects
        if (object.name.toLowerCase().includes("robot")) {
          robotRef.current = object
          console.log("Found robot:", object.name)
        }
        if (object.name.toLowerCase().includes("head")) {
          robotHeadRef.current = object
          console.log("Found robot head:", object.name)
        }
        if (object.name.toLowerCase().includes("light") || object.name.toLowerCase().includes("flash")) {
          flashlightRef.current = object
          console.log("Found flashlight:", object.name)
        }
      })
    }

    // Activate flashlight immediately with higher intensity
    setIsFlashlightActive(true)
    setFlashlightIntensity(1.4) // Higher intensity for a brighter teal effect

    // Set initial position to center of container
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setFlashlightPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      })
    }
  }

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if mouse is within container
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        isMouseInContainer.current = true
        mousePosition.current = { x, y }
        setFlashlightPosition({ x, y })

        // Calculate direction vector (normalized)
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const dirX = (x - centerX) / rect.width
        const dirY = (y - centerY) / rect.height

        setFlashlightDirection({
          x: dirX,
          y: -dirY, // Y is inverted in 3D space
          z: 0.8, // Forward direction
        })
      } else {
        isMouseInContainer.current = false
      }
    }

    const handleMouseEnter = () => {
      isMouseInContainer.current = true
    }

    const handleMouseLeave = () => {
      isMouseInContainer.current = false
    }

    // Add event listeners to document for smoother tracking
    document.addEventListener("mousemove", handleMouseMove)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Handle touch events for mobile
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return

      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      // Check if touch is within container
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mousePosition.current = { x, y }
        setFlashlightPosition({ x, y })

        // Calculate direction vector (normalized)
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const dirX = (x - centerX) / rect.width
        const dirY = (y - centerY) / rect.height

        setFlashlightDirection({
          x: dirX,
          y: -dirY, // Y is inverted in 3D space
          z: 0.8, // Forward direction
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("touchmove", handleTouchMove as EventListener)
      container.addEventListener("touchstart", handleTouchMove as EventListener)
    }

    return () => {
      if (container) {
        container.removeEventListener("touchmove", handleTouchMove as EventListener)
        container.removeEventListener("touchstart", handleTouchMove as EventListener)
      }
    }
  }, [])

  // Animation loop for smooth flashlight movement and robot head tracking
  // with performance optimizations
  useEffect(() => {
    let animationFrameId: number
    let lastAnimationTime = 0
    
    // Use optimized frame rate based on device
    const targetFrameRate = isMobile ? 30 : 60 // Lower frame rate for mobile
    const frameInterval = 1000 / targetFrameRate
    
    // Use a timestamp for smooth animations
    const animate = (timestamp: number) => {
      // Skip frames to maintain target framerate
      const deltaTime = timestamp - lastAnimationTime
      if (deltaTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }
      
      lastAnimationTime = timestamp - (deltaTime % frameInterval)
      
      // Update robot head orientation to follow flashlight position
      if (isFlashlightActive) {
        try {
          // Determine which object to rotate (head preferred, then flashlight, then robot)
          const targetObject = robotHeadRef.current || flashlightRef.current || robotRef.current

          if (targetObject && targetObject.rotation) {
            // Calculate target rotation based on flashlight direction
            // Adjust rotation limits and sensitivity based on device
            const rotationSensitivity = isMobile ? 0.3 : 0.5
            const maxRotation = isMobile ? 0.2 : 0.4

            // Calculate target rotation with limits
            const targetRotationY = Math.max(
              -maxRotation,
              Math.min(maxRotation, flashlightDirection.x * rotationSensitivity),
            )

            const targetRotationX = Math.max(
              -maxRotation,
              Math.min(maxRotation, flashlightDirection.y * rotationSensitivity),
            )

            // Apply smooth rotation with easing
            // Adapt easing speed based on delta time for consistent animation regardless of frame rate
            const easingFactor = Math.min(1, deltaTime / 16.67) * 0.1
            targetObject.rotation.y += (targetRotationY - targetObject.rotation.y) * easingFactor
            targetObject.rotation.x += (targetRotationX - targetObject.rotation.x) * easingFactor

            // Optional: Add subtle bobbing motion for more lifelike appearance
            if (!isMouseInContainer.current) {
              // Use timestamp instead of Date.now() for more consistent animations
              const time = timestamp / 2000
              targetObject.rotation.x += Math.sin(time) * 0.003 * (deltaTime / 16.67)
              targetObject.rotation.y += Math.cos(time * 0.7) * 0.002 * (deltaTime / 16.67)
            }
          }
        } catch (error) {
          // Silently handle errors with Spline object manipulation
          // Avoid console logs in production for better performance
        }
      }

      // Automatic movement when mouse is not in container
      if (!isMouseInContainer.current && isFlashlightActive && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        // Calculate time-based position for automatic movement
        // Use different patterns for mobile vs desktop
        // Use timestamp instead of Date.now() for better animation consistency
        const time = timestamp / (isMobile ? 2000 : 3000)
        
        // Reduce animation complexity on mobile
        let x, y
        
        if (isMobile) {
          // Simpler pattern for mobile
          const radius = Math.min(rect.width, rect.height) * 0.2
          x = centerX + Math.cos(time) * radius
          y = centerY + Math.sin(time * 0.8) * radius
        } else {
          // More complex pattern for desktop
          const radius = Math.min(rect.width, rect.height) * 0.3
          x = centerX + Math.cos(time) * radius + Math.sin(time * 1.5) * (radius * 0.3)
          y = centerY + Math.sin(time * 0.7) * radius + Math.cos(time * 2) * (radius * 0.2)
        }

        // Smooth transition to automatic position with adaptive speed
        // Scale transition speed by delta time for frame-rate independence
        const baseSpeed = isMobile ? 0.04 : 0.02
        const transitionSpeed = baseSpeed * (deltaTime / 16.67)
        
        // Limit transition speed to avoid jumps on slow frames
        const cappedSpeed = Math.min(transitionSpeed, 0.2)
        
        setFlashlightPosition((prev) => ({
          x: prev.x + (x - prev.x) * cappedSpeed,
          y: prev.y + (y - prev.y) * cappedSpeed,
        }))
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isFlashlightActive, flashlightDirection, isMobile])

  return (
    <FlashlightContext.Provider
      value={{
        isFlashlightActive,
        flashlightPosition,
        flashlightDirection,
        flashlightIntensity,
      }}
    >
      <div ref={containerRef} className="relative w-full h-full">
        {children}
      </div>
    </FlashlightContext.Provider>
  )
}

