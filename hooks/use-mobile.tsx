"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the current device is mobile
 * Uses a combination of screen width and user agent detection
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < 768

      // Check user agent for mobile devices
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Consider it mobile if either condition is true
      setIsMobile(isMobileWidth || isMobileAgent)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}

