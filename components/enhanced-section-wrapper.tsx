"use client"

import React, { useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useTheme } from 'next-themes'

interface EnhancedSectionWrapperProps {
  children: ReactNode
  className?: string
  withBackground?: boolean
  backgroundStyle?: 'grid' | 'gradient' | 'particles' | 'wave' | 'none'
  accentColor?: string
  secondaryColor?: string
  intensity?: 'low' | 'medium' | 'high'
  animateOnScroll?: boolean
  animationType?: 'fade' | 'slide' | 'zoom' | 'parallax' | 'none'
  withFloatingElements?: boolean
  id?: string
}

/**
 * Enhanced Section Wrapper 
 * A highly configurable component to add animated backgrounds and effects to any section
 * It provides visual consistency across the site while enhancing the user experience
 */
export function EnhancedSectionWrapper({
  children,
  className = "",
  withBackground = true,
  backgroundStyle = 'gradient',
  accentColor = "#38bdf8", // Default teal/blue
  secondaryColor = "#8b5cf6", // Default purple
  intensity = 'medium',
  animateOnScroll = true,
  animationType = 'fade',
  withFloatingElements = true,
  id
}: EnhancedSectionWrapperProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '0px 0px -10% 0px', // Slightly above the bottom of the viewport
  })
  
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  
  // Calculate opacity based on intensity
  const getOpacity = (baseOpacity: number): number => {
    const intensityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5
    }
    return Math.min(1, baseOpacity * intensityMultiplier[intensity])
  }
  
  // Helper to manage floating elements
  const getFloatingElements = () => {
    // Number of elements based on intensity
    const count = {
      low: 3,
      medium: 5,
      high: 8
    }[intensity]
    
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      size: Math.random() * 100 + 50, // 50-150px
      x: `${Math.random() * 90 + 5}%`, // 5-95%
      y: `${Math.random() * 90 + 5}%`, // 5-95%
      opacity: Math.random() * 0.15 + 0.05, // 0.05-0.2
      duration: Math.random() * 20 + 20, // 20-40s
      delay: Math.random() * 10
    }))
  }
  
  // Generate floating elements
  const [floatingElements] = useState(getFloatingElements)
  
  // Calculate animation variants based on animation type
  const getAnimationVariants = () => {
    switch (animationType) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.8, ease: 'easeOut' }
          }
        }
      case 'slide':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8, 
              ease: [0.2, 0.65, 0.3, 0.9] // Custom easing
            }
          }
        }
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.8, 
              ease: [0.2, 0.65, 0.3, 0.9]
            }
          }
        }
      case 'parallax':
        return {
          hidden: { opacity: 0, y: 100 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 1.2, 
              ease: [0.2, 0.65, 0.3, 0.9]
            }
          }
        }
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 }
        }
    }
  }
  
  // Get background style based on selected type
  const getBackgroundStyles = () => {
    if (!withBackground) return {}
    
    // Base container for all background styles
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden'
    }
    
    // Calculate color with intensity
    const primaryRgba = hexToRgba(accentColor, getOpacity(0.3))
    const secondaryRgba = hexToRgba(secondaryColor, getOpacity(0.25))
    
    switch (backgroundStyle) {
      case 'grid':
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(to right, ${primaryRgba} 1px, transparent 1px),
            linear-gradient(to bottom, ${primaryRgba} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: getOpacity(0.15)
        }
      case 'gradient':
        return {
          ...baseStyle,
          background: `
            radial-gradient(circle at 20% 30%, ${primaryRgba} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${secondaryRgba} 0%, transparent 50%)
          `,
          filter: 'blur(80px)'
        }
      case 'particles':
        // Particles are handled by separate elements
        return {
          ...baseStyle
        }
      case 'wave':
        // Wave pattern is handled through a mask and animation
        return {
          ...baseStyle,
          background: `linear-gradient(90deg, ${primaryRgba} 0%, ${secondaryRgba} 100%)`,
          maskImage: `
            repeating-linear-gradient(
              45deg,
              #000 25%,
              transparent 25%,
              transparent 75%,
              #000 75%,
              #000
            )
          `,
          maskSize: '10px 10px',
          maskPosition: '0 0, 5px 5px'
        }
      default:
        return {}
    }
  }
  
  // Get animation variants
  const contentVariants = getAnimationVariants()
  
  return (
    <section
      id={id}
      ref={ref}
      className={`relative ${className}`}
    >
      {/* Enhanced Background Effect */}
      {withBackground && (
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          style={getBackgroundStyles()}
          aria-hidden="true"
        >
          {/* Grid overlay for grid style */}
          {backgroundStyle === 'grid' && (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-30">
              <defs>
                <pattern id="smallGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                  <path 
                    d="M 15 0 L 0 0 0 15" 
                    fill="none" 
                    stroke={accentColor} 
                    strokeWidth="0.5" 
                    opacity={getOpacity(0.3)}
                  />
                </pattern>
                <pattern id="grid" width="75" height="75" patternUnits="userSpaceOnUse">
                  <rect width="75" height="75" fill="url(#smallGrid)" />
                  <path 
                    d="M 75 0 L 0 0 0 75" 
                    fill="none" 
                    stroke={accentColor} 
                    strokeWidth="1" 
                    opacity={getOpacity(0.5)}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}
          
          {/* Particles for particle style */}
          {backgroundStyle === 'particles' && withFloatingElements && (
            <>
              {floatingElements.map((element) => (
                <motion.div
                  key={element.id}
                  className="absolute rounded-full bg-gradient-to-br pointer-events-none opacity-0"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.size,
                    height: element.size,
                    background: `radial-gradient(circle at center, ${hexToRgba(accentColor, element.opacity * 2)} 0%, ${hexToRgba(secondaryColor, element.opacity)} 50%, transparent 70%)`,
                    filter: 'blur(50px)'
                  }}
                  animate={{
                    x: ['-20px', '20px', '-20px'],
                    y: ['-30px', '30px', '-30px'],
                    opacity: [element.opacity, element.opacity * 1.5, element.opacity],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: element.duration,
                    ease: 'easeInOut',
                    delay: element.delay,
                    repeat: Infinity,
                  }}
                />
              ))}
            </>
          )}
          
          {/* Wave animation for wave style */}
          {backgroundStyle === 'wave' && (
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              style={{
                background: `linear-gradient(45deg, 
                  ${hexToRgba(accentColor, getOpacity(0.2))} 25%, 
                  transparent 25%, 
                  transparent 50%, 
                  ${hexToRgba(secondaryColor, getOpacity(0.2))} 50%, 
                  ${hexToRgba(secondaryColor, getOpacity(0.2))} 75%, 
                  transparent 75%, 
                  transparent)`,
                backgroundSize: '100px 100px'
              }}
            />
          )}
        </div>
      )}
      
      {/* Floating elements that appear in any background mode */}
      {withFloatingElements && backgroundStyle !== 'particles' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {floatingElements.slice(0, 3).map((element) => (
            <motion.div
              key={`float-${element.id}`}
              className="absolute rounded-full opacity-0"
              style={{
                left: element.x,
                top: element.y,
                width: element.size * 0.7,
                height: element.size * 0.7,
                background: `radial-gradient(circle at center, 
                  ${hexToRgba(accentColor, element.opacity)} 0%, 
                  ${hexToRgba(secondaryColor, element.opacity * 0.8)} 60%, 
                  transparent 100%)`,
                filter: 'blur(40px)'
              }}
              animate={{
                x: ['-10px', '10px', '-10px'],
                y: ['-20px', '20px', '-20px'],
                opacity: inView ? [element.opacity * 0.5, element.opacity, element.opacity * 0.5] : 0,
              }}
              transition={{
                duration: element.duration * 0.8,
                ease: 'easeInOut',
                delay: element.delay,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Main content with animation */}
      <motion.div
        className="relative z-10"
        initial="hidden"
        animate={inView || !animateOnScroll ? 'visible' : 'hidden'}
        variants={contentVariants}
      >
        {children}
      </motion.div>
      
      {/* Optional: Add subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-noise mix-blend-overlay pointer-events-none" />
      
      {/* Inline style for noise texture */}
      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </section>
  )
}