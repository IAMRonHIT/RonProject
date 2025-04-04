"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

// Constants
const AUTO_SLIDE_INTERVAL = 8000 // 8 seconds per slide
const ACCENT_COLOR = "#00E5E0"

// Data for the slider
const audienceSegments = [
  {
    id: "behavioral-health",
    title: "Behavioral Health Settings",
    description:
      "Ron AI streamlines documentation, automates prior authorizations, and ensures compliance for behavioral health providers, allowing more time for patient care.",
    videoSrc: "/therapy.mp4",
    posterSrc: "/posters/behavioral-health-poster.jpg",
  },
  {
    id: "hospitals",
    title: "Hospitals",
    description:
      "Reduce administrative burden, optimize workflows, and improve care coordination across departments with Ron AI's intelligent automation platform.",
    videoSrc: "/Hospital.mp4",
    posterSrc: "/posters/hospitals-poster.jpg",
  },
  {
    id: "medical-offices",
    title: "Medical Offices",
    description:
      "Streamline scheduling, documentation, and billing while enhancing patient communication through Ron AI's intuitive automation tools.",
    videoSrc: "/MedOffice.mp4",
    posterSrc: "/posters/medical-offices-poster.jpg",
  },
  {
    id: "homecare",
    title: "Homecare Agencies",
    description:
      "Coordinate care teams, manage remote workflows, and ensure compliance while providing personalized care with Ron AI's mobile-friendly platform.",
    videoSrc: "/Homecare.mp4",
    posterSrc: "/posters/homecare-poster.jpg",
  },
  {
    id: "providers",
    title: "All Healthcare Providers",
    description:
      "Whatever your specialty, Ron AI adapts to your unique workflows, reducing administrative tasks and helping you focus on delivering exceptional care.",
    videoSrc: "/OfficeVisit.mp4",
    posterSrc: "/posters/providers-poster.jpg",
  },
  {
    id: "health-plans",
    title: "Health Plans",
    description:
      "Improve member satisfaction, streamline prior authorizations, and enhance provider collaboration through Ron AI's intelligent automation platform.",
    videoSrc: "/HealthPlan.mp4",
    posterSrc: "/posters/health-plans-poster.jpg",
  },
  {
    id: "patients",
    title: "Patients",
    description:
      "Experience smoother healthcare journeys with less paperwork, faster approvals, and better coordination between all your care providers.",
    videoSrc: "/Patient.mp4",
    posterSrc: "/posters/patients-poster.jpg",
  },
]

export default function WhoItsForSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(audienceSegments.length).fill(null))
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  })

  // Motion values for 3D carousel effect
  const x = useMotionValue(0)
  const rotateY = useTransform(x, [-300, 300], [15, -15])
  const scale = useTransform(x, [-300, 0, 300], [0.9, 1, 0.9])

  // Handle autoplay
  useEffect(() => {
    if (!inView) return

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        handleNext()
      }, AUTO_SLIDE_INTERVAL)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, inView])

  // Handle video playback based on active state
  useEffect(() => {
    if (!inView) return

    // Pause all videos first
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause()
      }
    })

    // Play the current video after a short delay
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      const playTimer = setTimeout(() => {
        currentVideo.currentTime = 0
        const playPromise = currentVideo.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Video play error:", error)
            // If autoplay fails, we still show the content with the poster image
          })
        }
      }, 300)

      return () => clearTimeout(playTimer)
    }
  }, [currentIndex, inView])

  // Navigation functions
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? audienceSegments.length - 1 : prevIndex - 1))
    setIsPlaying(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % audienceSegments.length)

    if (!isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <section ref={ref} className="relative bg-[#050818] py-16 md:py-24 overflow-hidden">
      {/* Header */}
      <motion.div
        className="container mx-auto px-4 md:px-6 mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          How Ron AI Helps <span style={{ color: ACCENT_COLOR }}>Your Sector</span>
        </h2>
        <p className="text-gray-200 max-w-3xl mx-auto text-base md:text-lg">
          Ron AI's intelligent automation adapts to the unique needs of every healthcare setting, streamlining workflows
          and reducing administrative burden.
        </p>
      </motion.div>

      {/* 3D Carousel */}
      <div ref={containerRef} className="relative h-[70vh] perspective-[1200px] overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          style={{
            rotateY,
            scale,
            transformStyle: "preserve-3d",
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) {
              handlePrev()
            } else if (info.offset.x < -100) {
              handleNext()
            }
            setIsPlaying(false)
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                {/* Video */}
                <video
                  ref={(el) => (videoRefs.current[currentIndex] = el)}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  poster={audienceSegments[currentIndex].posterSrc || "/placeholder.svg?height=600&width=1200"}
                  onEnded={() => {
                    if (isPlaying) {
                      handleNext()
                    }
                  }}
                  onError={(e) => {
                    console.log(`Video error for ${audienceSegments[currentIndex].id}:`, e)
                    // Set a fallback background color if video fails
                    e.currentTarget.style.backgroundColor = "#0a0f2c"
                  }}
                >
                  <source src={audienceSegments[currentIndex].videoSrc} type="video/mp4" />
                  {/* Fallback text */}
                  <p className="hidden">Your browser doesn't support HTML5 video.</p>
                </video>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Content */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                      {audienceSegments[currentIndex].title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-100">{audienceSegments[currentIndex].description}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-10">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Controls and indicators */}
      <div className="container mx-auto px-4 md:px-6 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Play/Pause button */}
          <button
            onClick={togglePlayPause}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors mb-4 md:mb-0"
          >
            {isPlaying ? (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Navigation dots */}
          <div className="flex justify-center space-x-2">
            {audienceSegments.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? `bg-[${ACCENT_COLOR}]` : "bg-gray-500 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Current slide indicator */}
          <div className="text-gray-400 text-sm hidden md:block">
            {currentIndex + 1} / {audienceSegments.length}
          </div>
        </div>
      </div>

      {/* Custom styles for 3D effect */}
      <style jsx global>{`
        .perspective-\\[1200px\\] {
          perspective: 1200px;
        }
      `}</style>
    </section>
  )
}

