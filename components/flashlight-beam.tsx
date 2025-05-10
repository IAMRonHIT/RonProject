"use client"

import { useEffect, useRef, useState } from "react"
import { useFlashlight } from "./flashlight-controller"
import { useIsMobile } from "@/hooks/use-mobile"

interface FlashlightBeamProps {
  className?: string
}

/**
 * FlashlightBeam renders the visual beam effect on a canvas overlay
 * It creates a realistic light effect with multiple layers and falloff
 */
export function FlashlightBeam({ className }: FlashlightBeamProps) {
  const { isFlashlightActive, flashlightPosition, flashlightIntensity } = useFlashlight()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isMobile = useIsMobile()

  // Set up canvas dimensions with high-DPI support
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return
      const parent = canvasRef.current.parentElement
      if (!parent) return

      const { width, height } = parent.getBoundingClientRect()
      setDimensions({ width, height })

      // Set canvas dimensions with device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      canvasRef.current.width = width * dpr
      canvasRef.current.height = height * dpr

      // Scale the canvas back down with CSS
      canvasRef.current.style.width = `${width}px`
      canvasRef.current.style.height = `${height}px`
    }

    updateDimensions()

    // Debounced resize handler for better performance
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateDimensions, 100)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Draw flashlight beam with optimized rendering
  useEffect(() => {
    if (!canvasRef.current || !isFlashlightActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Apply device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1

    // Clear canvas with optimized approach
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Scale all coordinates by DPR
    ctx.save()
    ctx.scale(dpr, dpr)

    // Adjust beam size based on device
    const beamScale = isMobile ? 0.7 : 1

    // Set composite operation for additive blending
    ctx.globalCompositeOperation = "screen"

    // Draw outer glow - wide, subtle effect
    const outerRadius = 300 * beamScale
    const outerGradient = ctx.createRadialGradient(
      flashlightPosition.x,
      flashlightPosition.y,
      0,
      flashlightPosition.x,
      flashlightPosition.y,
      outerRadius,
    )

    // Teal color for Ron AI branding
    outerGradient.addColorStop(0, `rgba(20, 184, 166, ${0.25 * flashlightIntensity})`)
    outerGradient.addColorStop(0.6, `rgba(20, 184, 166, ${0.15 * flashlightIntensity})`)
    outerGradient.addColorStop(1, "rgba(20, 184, 166, 0)")

    ctx.fillStyle = outerGradient
    ctx.beginPath()
    ctx.arc(flashlightPosition.x, flashlightPosition.y, outerRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw main beam - primary light area
    const mainRadius = 200 * beamScale
    const mainGradient = ctx.createRadialGradient(
      flashlightPosition.x,
      flashlightPosition.y,
      0,
      flashlightPosition.x,
      flashlightPosition.y,
      mainRadius,
    )

    mainGradient.addColorStop(0, `rgba(20, 184, 166, ${0.9 * flashlightIntensity})`)
    mainGradient.addColorStop(0.4, `rgba(20, 184, 166, ${0.5 * flashlightIntensity})`)
    mainGradient.addColorStop(1, "rgba(20, 184, 166, 0)")

    ctx.fillStyle = mainGradient
    ctx.beginPath()
    ctx.arc(flashlightPosition.x, flashlightPosition.y, mainRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw inner bright core - concentrated light
    const innerRadius = 80 * beamScale
    const innerGradient = ctx.createRadialGradient(
      flashlightPosition.x,
      flashlightPosition.y,
      0,
      flashlightPosition.x,
      flashlightPosition.y,
      innerRadius,
    )

    innerGradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * flashlightIntensity})`)
    innerGradient.addColorStop(0.5, `rgba(153, 246, 228, ${0.8 * flashlightIntensity})`)
    innerGradient.addColorStop(1, `rgba(20, 184, 166, ${0.3 * flashlightIntensity})`)

    ctx.fillStyle = innerGradient
    ctx.beginPath()
    ctx.arc(flashlightPosition.x, flashlightPosition.y, innerRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw center hotspot - intense center point
    const centerRadius = 30 * beamScale
    const centerGradient = ctx.createRadialGradient(
      flashlightPosition.x,
      flashlightPosition.y,
      0,
      flashlightPosition.x,
      flashlightPosition.y,
      centerRadius,
    )

    centerGradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * flashlightIntensity})`)
    centerGradient.addColorStop(1, `rgba(153, 246, 228, ${0.9 * flashlightIntensity})`)

    ctx.fillStyle = centerGradient
    ctx.beginPath()
    ctx.arc(flashlightPosition.x, flashlightPosition.y, centerRadius, 0, Math.PI * 2)
    ctx.fill()

    // Optional: Add lens flare effect for more realism
    if (!isMobile) {
      // Skip on mobile for performance
      // Small flare dots
      const flarePositions = [
        { dist: 0.3, size: 5, opacity: 0.7 },
        { dist: 0.6, size: 8, opacity: 0.5 },
        { dist: 0.9, size: 3, opacity: 0.3 },
        { dist: 1.2, size: 6, opacity: 0.2 },
      ]

      // Calculate center of canvas
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2

      // Vector from center to light position
      const dx = flashlightPosition.x - centerX
      const dy = flashlightPosition.y - centerY

      flarePositions.forEach((flare) => {
        // Position flare along the line from center through light position
        const flareX = centerX - dx * flare.dist
        const flareY = centerY - dy * flare.dist

        // Draw flare
        const flareGradient = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, flare.size * beamScale)

        flareGradient.addColorStop(0, `rgba(255, 255, 255, ${flare.opacity * flashlightIntensity})`)
        flareGradient.addColorStop(1, "rgba(20, 184, 166, 0)")

        ctx.fillStyle = flareGradient
        ctx.beginPath()
        ctx.arc(flareX, flareY, flare.size * beamScale, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    ctx.restore()
  }, [isFlashlightActive, flashlightPosition, flashlightIntensity, dimensions, isMobile])

  if (!isFlashlightActive) return null

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className}`}
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  )
}

