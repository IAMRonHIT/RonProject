"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useSpring } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useIsMobile } from "@/hooks/use-mobile"
import { safePlayVideo } from "@/utils/video-helpers"

// Define audience segments
const audienceSegments = [
  {
    id: "behavioral-health",
    title: "Behavioral Health Settings",
    description:
      "Ron AI streamlines documentation, automates prior authorizations, and ensures compliance for behavioral health providers, allowing more time for patient care.",
    videoSrc: "/therapy.mp4",
    color: "#00E5E0",
    nodePosition: { x: 30, y: 30 },
  },
  {
    id: "hospitals",
    title: "Hospitals",
    description:
      "Reduce administrative burden, optimize workflows, and improve care coordination across departments with Ron AI's intelligent automation platform.",
    videoSrc: "/Hospital.mp4",
    color: "#00B8A9",
    nodePosition: { x: 70, y: 20 },
  },
  {
    id: "medical-offices",
    title: "Medical Offices",
    description:
      "Streamline scheduling, documentation, and billing while enhancing patient communication through Ron AI's intuitive automation tools.",
    videoSrc: "/MedOffice.mp4",
    color: "#00D1C1",
    nodePosition: { x: 80, y: 60 },
  },
  {
    id: "homecare",
    title: "Homecare Agencies",
    description:
      "Coordinate care teams, manage remote workflows, and ensure compliance while providing personalized care with Ron AI's mobile-friendly platform.",
    videoSrc: "/Homecare.mp4",
    color: "#00E5E0",
    nodePosition: { x: 50, y: 80 },
  },
  {
    id: "providers",
    title: "All Healthcare Providers",
    description:
      "Whatever your specialty, Ron AI adapts to your unique workflows, reducing administrative tasks and helping you focus on delivering exceptional care.",
    videoSrc: "/OfficeVisit.mp4",
    color: "#00B8A9",
    nodePosition: { x: 20, y: 70 },
  },
  {
    id: "health-plans",
    title: "Health Plans",
    description:
      "Improve member satisfaction, streamline prior authorizations, and enhance provider collaboration through Ron AI's intelligent automation platform.",
    videoSrc: "/MedOffice.mp4", // Placeholder - would need specific Health Plans video
    color: "#00D1C1",
    nodePosition: { x: 40, y: 50 },
  },
  {
    id: "patients",
    title: "Patients",
    description:
      "Experience smoother healthcare journeys with less paperwork, faster approvals, and better coordination between all your care providers.",
    videoSrc: "/Patient.mp4",
    color: "#00E5E0",
    nodePosition: { x: 50, y: 40 },
  },
]

export function WhoItsForSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0)
  const segmentRefs = useRef<Array<HTMLDivElement | null>>(Array(audienceSegments.length).fill(null))
  const isMobile = useIsMobile()

  // Ref for the section to track when it's in view
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Handle scroll to determine active segment
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerTop = container.getBoundingClientRect().top
    const containerHeight = container.offsetHeight
    const viewportHeight = window.innerHeight

    // Calculate scroll progress within the container
    const scrollProgress = Math.max(
      0,
      Math.min(1, (viewportHeight - containerTop) / (containerHeight + viewportHeight)),
    )

    // Map scroll progress to segment index
    const segmentIndex = Math.min(audienceSegments.length - 1, Math.floor(scrollProgress * audienceSegments.length))

    setActiveSegmentIndex(segmentIndex)
  }, [])

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Combine refs safely
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      containerRef.current = element
      sectionRef(element)
    },
    [sectionRef],
  )

  // Safe ref setter for segment elements
  const setSegmentRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      segmentRefs.current[index] = element
    },
    [],
  )

  return (
    <section
      ref={setRefs}
      className="relative bg-[#050818] py-20 md:py-32"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0, 184, 169, 0.03) 0%, rgba(0, 0, 0, 0) 70%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Who <span className="text-[#00E5E0]">It's For</span>
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto text-base md:text-lg">
            Ron AI serves the entire healthcare ecosystem, bringing intelligent automation to every touchpoint.
          </p>
        </motion.div>

        {/* Main content area with network visualization and segment content */}
        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-12 min-h-[800px] md:min-h-[600px]">
          {/* Network visualization - persistent visual element */}
          <div className="w-full lg:w-1/2 h-[300px] md:h-[500px] sticky top-20">
            <NetworkVisualization activeSegmentIndex={activeSegmentIndex} segments={audienceSegments} />
          </div>

          {/* Scrollable segments */}
          <div className="w-full lg:w-1/2 space-y-40 md:space-y-60 pb-20">
            {audienceSegments.map((segment, index) => (
              <div
                key={segment.id}
                ref={setSegmentRef(index)}
                className={`segment-container min-h-[300px] md:min-h-[400px] transition-opacity duration-500 ${
                  index === activeSegmentIndex ? "opacity-100" : "opacity-30"
                }`}
              >
                <SegmentContent segment={segment} isActive={index === activeSegmentIndex} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
        {audienceSegments.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeSegmentIndex ? "bg-[#00E5E0] w-3 h-3" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

interface SegmentContentProps {
  segment: (typeof audienceSegments)[0]
  isActive: boolean
}

function SegmentContent({ segment, isActive }: SegmentContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Play/pause video based on active state
  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      safePlayVideo(videoRef.current)
    } else if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
    }

    // Add cleanup function
    return () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
      transition={{ duration: 0.5 }}
      className="segment-content"
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: segment.color }}>
        {segment.title}
      </h3>

      <p className="text-white text-base md:text-lg mb-6">{segment.description}</p>

      <div className="video-container relative rounded-xl overflow-hidden aspect-video w-full shadow-lg shadow-[#00B8A9]/10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          loop
          poster="/placeholder.svg?height=400&width=600"
          onError={(e) => {
            console.log(`Video error for ${segment.id}:`, e)
            e.currentTarget.style.backgroundColor = "#0a0f2c"
          }}
        >
          <source src={segment.videoSrc} type="video/mp4" />
          <p className="hidden">Your browser doesn't support HTML5 video.</p>
        </video>

        {/* Video overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050818] via-transparent to-transparent opacity-40"></div>
      </div>
    </motion.div>
  )
}

interface NetworkVisualizationProps {
  activeSegmentIndex: number
  segments: typeof audienceSegments
}

function NetworkVisualization({ activeSegmentIndex, segments }: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeSegment = segments[activeSegmentIndex]
  const isMobile = useIsMobile()
  const requestRef = useRef<number>()

  // Animation spring for smooth transitions
  const springConfig = { stiffness: 100, damping: 20 }
  const focusX = useSpring(activeSegment.nodePosition.x, springConfig)
  const focusY = useSpring(activeSegment.nodePosition.y, springConfig)

  // Update spring values when active segment changes
  useEffect(() => {
    focusX.set(activeSegment.nodePosition.x)
    focusY.set(activeSegment.nodePosition.y)
  }, [activeSegmentIndex, activeSegment, focusX, focusY])

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return

    const handleResize = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions with device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Draw network visualization with animation frame
  useEffect(() => {
    if (!canvasRef.current) return

    const drawNetwork = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Clear canvas - use device pixel ratio for proper scaling
      ctx.clearRect(0, 0, width * (window.devicePixelRatio || 1), height * (window.devicePixelRatio || 1))

      // Draw connections between nodes
      ctx.lineWidth = 1
      segments.forEach((segment, i) => {
        segments.forEach((otherSegment, j) => {
          if (i !== j) {
            const startX = (segment.nodePosition.x * width) / 100
            const startY = (segment.nodePosition.y * height) / 100
            const endX = (otherSegment.nodePosition.x * width) / 100
            const endY = (otherSegment.nodePosition.y * height) / 100

            // Calculate distance to active node
            const activeX = (activeSegment.nodePosition.x * width) / 100
            const activeY = (activeSegment.nodePosition.y * height) / 100
            const distToActive = Math.sqrt(
              Math.pow((startX + endX) / 2 - activeX, 2) + Math.pow((startY + endY) / 2 - activeY, 2),
            )

            // Opacity based on distance to active node
            const maxDist = Math.sqrt(width * width + height * height)
            const opacity = Math.max(0.05, 1 - distToActive / (maxDist / 2))

            // Draw connection line
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = `rgba(0, 229, 224, ${opacity * 0.3})`
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      segments.forEach((segment, i) => {
        const x = (segment.nodePosition.x * width) / 100
        const y = (segment.nodePosition.y * height) / 100

        // Node size and opacity based on active state
        const isActive = i === activeSegmentIndex
        const nodeSize = isActive ? 20 : 10
        const glowSize = isActive ? 40 : 20
        const opacity = isActive ? 1 : 0.5

        // Draw glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        gradient.addColorStop(0, `rgba(0, 229, 224, ${opacity * 0.7})`)
        gradient.addColorStop(1, "rgba(0, 229, 224, 0)")

        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw node
        ctx.beginPath()
        ctx.arc(x, y, nodeSize, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? segment.color : `rgba(0, 184, 169, ${opacity * 0.7})`
        ctx.fill()

        // Draw pulse effect for active node
        if (isActive) {
          const time = Date.now() / 1000
          const pulseSize = nodeSize + 10 + Math.sin(time * 2) * 5

          ctx.beginPath()
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0, 229, 224, ${0.3 + Math.sin(time * 2) * 0.2})`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Draw label
        if (isActive || (!isMobile && opacity > 0.6)) {
          ctx.font = isActive ? "bold 14px sans-serif" : "12px sans-serif"
          ctx.fillStyle = isActive ? "#FFFFFF" : `rgba(255, 255, 255, ${opacity})`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // Position label based on node position to avoid edge cutoff
          const labelY = y + nodeSize + 15
          ctx.fillText(segment.title.split(" ")[0], x, labelY)
        }
      })

      // Draw central "Ron AI" node
      const centerX = width / 2
      const centerY = height / 2

      // Central node glow
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50)
      centerGradient.addColorStop(0, "rgba(0, 229, 224, 0.5)")
      centerGradient.addColorStop(1, "rgba(0, 229, 224, 0)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
      ctx.fillStyle = centerGradient
      ctx.fill()

      // Central node
      ctx.beginPath()
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
      ctx.fillStyle = "#00B8A9"
      ctx.fill()

      // Ron AI text
      ctx.font = "bold 16px sans-serif"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("Ron AI", centerX, centerY)

      // Draw connections from central node to all other nodes
      segments.forEach((segment) => {
        const endX = (segment.nodePosition.x * width) / 100
        const endY = (segment.nodePosition.y * height) / 100

        const isActiveConnection = segment === activeSegment

        // Draw connection line
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(endX, endY)

        // Animated dash for active connection
        if (isActiveConnection) {
          const dashOffset = (Date.now() / 100) % 20
          ctx.setLineDash([4, 4])
          ctx.lineDashOffset = -dashOffset
          ctx.strokeStyle = `rgba(0, 229, 224, 0.8)`
          ctx.lineWidth = 2
        } else {
          ctx.setLineDash([])
          ctx.strokeStyle = `rgba(0, 229, 224, 0.3)`
          ctx.lineWidth = 1
        }

        ctx.stroke()
        ctx.setLineDash([])
      })

      requestRef.current = requestAnimationFrame(drawNetwork)
    }

    drawNetwork()

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [activeSegmentIndex, activeSegment, segments, isMobile])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}

