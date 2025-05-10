"use client"

import { useEffect, useRef, useState } from "react"
import { useFlashlight } from "./flashlight-controller"
import { useIsMobile } from "@/hooks/use-mobile"

interface FlashlightBeamProps {
  className?: string
  enhancedMode?: boolean // New prop to enable enhanced visual effects
}

/**
 * FlashlightBeam renders a visually stunning beam effect on a canvas overlay
 * It creates an immersive light effect with multiple layers, dynamic colors, and interactive particle effects
 */
export function FlashlightBeam({ className, enhancedMode = true }: FlashlightBeamProps) {
  const { isFlashlightActive, flashlightPosition, flashlightIntensity } = useFlashlight()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isMobile = useIsMobile()
  const animationRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const lastPositionRef = useRef({ x: 0, y: 0 })
  
  // Enhanced color scheme with pulsing effect
  const [colorPhase, setColorPhase] = useState(0)
  
  // Set up dynamic color system for enhanced visuals
  useEffect(() => {
    if (!enhancedMode) return
    
    // Create subtle color pulsing effect
    const interval = setInterval(() => {
      setColorPhase(prev => (prev + 0.01) % 1)
    }, 50)
    
    return () => clearInterval(interval)
  }, [enhancedMode])
  
  // Dynamic color calculation based on phase
  const getBeamColors = () => {
    // Stronger teal color for Ron AI branding - adjusted for better visibility
    const baseTeal = { r: 20, g: 184, b: 166 }
    const accentBlue = { r: 56, g: 189, b: 248 }
    const accentPurple = { r: 168, g: 85, b: 247 }
    
    if (!enhancedMode) {
      return {
        outer: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, ${0.35 * flashlightIntensity})`,
        outerEnd: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, 0)`,
        main: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, ${1.0 * flashlightIntensity})`,
        mainMid: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, ${0.6 * flashlightIntensity})`,
        mainEnd: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, 0)`,
        center: `rgba(255, 255, 255, ${1.0 * flashlightIntensity})`,
        centerMid: `rgba(153, 246, 228, ${0.9 * flashlightIntensity})`,
        centerEnd: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, ${0.4 * flashlightIntensity})`,
        flare: `rgba(255, 255, 255, ${1.0 * flashlightIntensity})`,
        flareEnd: `rgba(${baseTeal.r}, ${baseTeal.g}, ${baseTeal.b}, 0)`,
      }
    }
    
    // Enhanced color interpolation for dynamic effect
    const blendWithPhase = (color1: { r: number, g: number, b: number }, color2: { r: number, g: number, b: number }, phase: number) => {
      const sinValue = (Math.sin(phase * Math.PI * 2) + 1) / 2 // 0 to 1 sinusoidal wave
      const r = Math.round(color1.r + (color2.r - color1.r) * sinValue)
      const g = Math.round(color1.g + (color2.g - color1.g) * sinValue)
      const b = Math.round(color1.b + (color2.b - color1.b) * sinValue)
      return { r, g, b }
    }
    
    // Create dynamic color blend between teal and blue
    // Stronger emphasis on teal for enhanced branding consistency
    const dynamicPrimary = blendWithPhase(
      baseTeal, 
      { r: Math.min(baseTeal.r + 40, 255), g: baseTeal.g, b: Math.min(baseTeal.b + 30, 255) }, 
      colorPhase
    )
    // Create secondary accent color with offset phase
    const dynamicAccent = blendWithPhase(baseTeal, accentBlue, (colorPhase + 0.5) % 1)
    
    // Increased intensity for more impact
    const intensityBoost = 1.4
    
    return {
      outer: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, ${0.35 * flashlightIntensity * intensityBoost})`,
      outerEnd: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, 0)`,
      main: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, ${0.95 * flashlightIntensity * intensityBoost})`,
      mainMid: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, ${0.6 * flashlightIntensity * intensityBoost})`,
      mainEnd: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, 0)`,
      center: `rgba(255, 255, 255, ${1.0 * flashlightIntensity * intensityBoost})`,
      centerMid: `rgba(${dynamicAccent.r}, ${dynamicAccent.g}, ${dynamicAccent.b}, ${0.85 * flashlightIntensity * intensityBoost})`,
      centerEnd: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, ${0.4 * flashlightIntensity * intensityBoost})`,
      flare: `rgba(255, 255, 255, ${1.0 * flashlightIntensity * intensityBoost})`,
      flareEnd: `rgba(${dynamicPrimary.r}, ${dynamicPrimary.g}, ${dynamicPrimary.b}, 0)`,
      particlePrimary: dynamicPrimary,
      particleAccent: dynamicAccent
    }
  }
  
  // Particle system for enhanced visual effects
  class Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    lifetime: number
    maxLifetime: number
    color: string
    
    constructor(x: number, y: number, colors: any) {
      this.x = x + (Math.random() - 0.5) * 30
      this.y = y + (Math.random() - 0.5) * 30
      this.size = Math.random() * 3 + 1.5
      
      // Create dynamic movement
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 1.5 + 0.5
      this.speedX = Math.cos(angle) * speed
      this.speedY = Math.sin(angle) * speed
      
      // Lifetime for fade-out effect
      this.maxLifetime = Math.random() * 100 + 100
      this.lifetime = this.maxLifetime
      
      // Use either primary or accent colors with some randomization
      const useAccent = Math.random() > 0.7
      const { particlePrimary, particleAccent } = colors
      const colorBase = useAccent ? particleAccent : particlePrimary
      
      // Add slight color variation
      const variance = 20
      const r = Math.min(255, Math.max(0, colorBase.r + (Math.random() - 0.5) * variance))
      const g = Math.min(255, Math.max(0, colorBase.g + (Math.random() - 0.5) * variance))
      const b = Math.min(255, Math.max(0, colorBase.b + (Math.random() - 0.5) * variance))
      
      this.color = `rgba(${r}, ${g}, ${b}, ${useAccent ? 0.9 : 0.7})`
    }
    
    update() {
      this.x += this.speedX
      this.y += this.speedY
      this.lifetime -= 2
      
      // Slow down particles over time
      this.speedX *= 0.98
      this.speedY *= 0.98
      
      // Slightly shrink particles as they age
      this.size = Math.max(0, this.size - 0.02)
    }
    
    draw(ctx: CanvasRenderingContext2D) {
      const opacity = (this.lifetime / this.maxLifetime)
      ctx.globalAlpha = opacity
      
      // Draw particle with blur effect for glow
      const glow = this.size * 2
      
      // Draw glowing particle using radial gradient
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glow
      )
      
      gradient.addColorStop(0, this.color)
      gradient.addColorStop(1, `rgba(0,0,0,0)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, glow, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw core of particle
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.globalAlpha = 1
    }
    
    isAlive(): boolean {
      return this.lifetime > 0
    }
  }

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

  // Create new particles based on flashlight movement
  const createParticles = (x: number, y: number, count: number) => {
    if (!enhancedMode || isMobile) return // Skip particle creation for performance on mobile
    
    const colors = getBeamColors()
    
    // Calculate movement distance to determine how many particles to create
    const dx = x - lastPositionRef.current.x
    const dy = y - lastPositionRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Create more particles when moving faster
    const particleCount = Math.min(count, Math.floor(distance * 0.5)) + 1
    
    // Add new particles
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(x, y, colors))
      
      // Limit max particles for performance
      if (particlesRef.current.length > 200) {
        particlesRef.current.shift()
      }
    }
    
    // Update last position
    lastPositionRef.current = { x, y }
  }
  
  // Update and render particles
  const updateParticles = (ctx: CanvasRenderingContext2D, dpr: number) => {
    if (!enhancedMode) return
    
    // Save and scale context for particles
    ctx.save()
    ctx.scale(dpr, dpr)
    
    // Set composite operation for additive blending
    ctx.globalCompositeOperation = "screen"
    
    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.update()
      if (particle.isAlive()) {
        particle.draw(ctx)
        return true
      }
      return false
    })
    
    ctx.restore()
  }

  // Main animation loop with enhanced visual effects
  useEffect(() => {
    if (!canvasRef.current || !isFlashlightActive) return
    
    const animate = (time: number) => {
      if (!canvasRef.current) return
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) return
      
      // Calculate delta time for consistent animation
      const deltaTime = time - (timeRef.current || time)
      timeRef.current = time
      
      // Apply device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      
      // Clear canvas with a fade effect for motion trails
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)" // Adjust alpha for longer/shorter trails
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Scale all coordinates by DPR
      ctx.save()
      ctx.scale(dpr, dpr)
      
      // Get dynamic colors
      const colors = getBeamColors()
      
      // Adjust beam size based on device
      const beamScale = isMobile ? 0.85 : 1.25
      
      // Create beam sway effect
      const currentTime = Date.now() / 3000
      const swayX = Math.sin(currentTime) * 5
      const swayY = Math.cos(currentTime * 1.3) * 5
      
      // Calculate beam position with sway
      const beamX = flashlightPosition.x + swayX
      const beamY = flashlightPosition.y + swayY
      
      // Create particles based on beam movement
      createParticles(beamX, beamY, enhancedMode ? 3 : 1)
      
      // Set composite operation for additive blending
      ctx.globalCompositeOperation = "screen"
      
      // Draw outer glow - wide, subtle effect
      const outerRadius = enhancedMode ? 370 * beamScale : 300 * beamScale
      const outerGradient = ctx.createRadialGradient(
        beamX, beamY, 0,
        beamX, beamY, outerRadius
      )
      
      outerGradient.addColorStop(0, colors.outer)
      outerGradient.addColorStop(0.7, colors.outer.replace(/,[^,]+$/, ',0.1)')) // Fade middle
      outerGradient.addColorStop(1, colors.outerEnd)
      
      ctx.fillStyle = outerGradient
      ctx.beginPath()
      ctx.arc(beamX, beamY, outerRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw main beam - primary light area with pulsing effect
      const pulseScale = enhancedMode ? 1 + Math.sin(time * 5) * 0.05 : 1
      const mainRadius = 240 * beamScale * pulseScale
      const mainGradient = ctx.createRadialGradient(
        beamX, beamY, 0,
        beamX, beamY, mainRadius
      )
      
      mainGradient.addColorStop(0, colors.main)
      mainGradient.addColorStop(0.4, colors.mainMid)
      mainGradient.addColorStop(1, colors.mainEnd)
      
      ctx.fillStyle = mainGradient
      ctx.beginPath()
      ctx.arc(beamX, beamY, mainRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw inner bright core - concentrated light
      const innerRadius = 100 * beamScale * pulseScale
      const innerGradient = ctx.createRadialGradient(
        beamX, beamY, 0,
        beamX, beamY, innerRadius
      )
      
      innerGradient.addColorStop(0, colors.center)
      innerGradient.addColorStop(0.5, colors.centerMid)
      innerGradient.addColorStop(1, colors.centerEnd)
      
      ctx.fillStyle = innerGradient
      ctx.beginPath()
      ctx.arc(beamX, beamY, innerRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw center hotspot - intense center point
      const centerRadius = 40 * beamScale * pulseScale
      const centerGradient = ctx.createRadialGradient(
        beamX, beamY, 0,
        beamX, beamY, centerRadius
      )
      
      centerGradient.addColorStop(0, colors.flare)
      centerGradient.addColorStop(1, colors.flareEnd)
      
      ctx.fillStyle = centerGradient
      ctx.beginPath()
      ctx.arc(beamX, beamY, centerRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Enhanced light rays in enhanced mode
      if (enhancedMode && !isMobile) {
        // Add dynamic light rays
        const rayCount = 12
        const rayLength = 220 * beamScale
        const rayWidth = 35 * beamScale
        
        // Draw rays with subtle animation
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + currentTime * 0.5
          const rayX = beamX + Math.cos(angle) * rayLength * 0.2
          const rayY = beamY + Math.sin(angle) * rayLength * 0.2
          
          const rayGradient = ctx.createRadialGradient(
            beamX, beamY, 0,
            rayX, rayY, rayLength
          )
          
          const rayOpacity = 0.08 + Math.sin(currentTime * 3 + i) * 0.03
          rayGradient.addColorStop(0, `rgba(255, 255, 255, ${rayOpacity * flashlightIntensity})`)
          rayGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
          
          ctx.save()
          ctx.translate(beamX, beamY)
          ctx.rotate(angle)
          
          ctx.fillStyle = rayGradient
          ctx.beginPath()
          ctx.ellipse(rayLength * 0.5, 0, rayLength * 0.8, rayWidth, 0, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.restore()
        }
      }
      
      // Enhanced lens flare effects
      if (!isMobile || enhancedMode) {
        // More dramatic lens flares
        const flarePositions = [
          { dist: 0.3, size: 8, opacity: 0.7 },
          { dist: 0.6, size: 12, opacity: 0.5 },
          { dist: 0.9, size: 5, opacity: 0.4 },
          { dist: 1.2, size: 10, opacity: 0.3 },
          { dist: 1.5, size: 6, opacity: 0.2 },
        ]
        
        if (enhancedMode) {
          // Add more flares in enhanced mode
          flarePositions.push(
            { dist: 1.7, size: 8, opacity: 0.15 },
            { dist: 1.9, size: 4, opacity: 0.1 }
          )
        }
        
        // Calculate center of canvas
        const centerX = dimensions.width / 2
        const centerY = dimensions.height / 2
        
        // Vector from center to light position
        const dx = beamX - centerX
        const dy = beamY - centerY
        
        flarePositions.forEach((flare) => {
          // Position flare along the line from center through light position
          const flareX = centerX - dx * flare.dist
          const flareY = centerY - dy * flare.dist
          
          // Draw flare with animation
          const pulseOpacity = enhancedMode 
            ? flare.opacity * (1 + Math.sin(currentTime * 4 + flare.dist * 5) * 0.2)
            : flare.opacity
          
          const flareGradient = ctx.createRadialGradient(
            flareX, flareY, 0, 
            flareX, flareY, flare.size * beamScale
          )
          
          flareGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity * flashlightIntensity})`)
          flareGradient.addColorStop(0.5, colors.flareEnd.replace('0)', `${pulseOpacity * 0.5 * flashlightIntensity})`))
          flareGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
          
          ctx.fillStyle = flareGradient
          ctx.beginPath()
          ctx.arc(flareX, flareY, flare.size * beamScale, 0, Math.PI * 2)
          ctx.fill()
        })
      }
      
      // Update and render particles
      updateParticles(ctx, dpr)
      
      ctx.restore()
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate)
    
    // Cleanup animation loop on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isFlashlightActive, flashlightPosition, flashlightIntensity, dimensions, isMobile, enhancedMode, colorPhase])

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

