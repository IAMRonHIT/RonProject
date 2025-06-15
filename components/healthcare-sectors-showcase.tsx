"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { safePlayVideo } from "@/utils/video-helpers"

// Define audience segments with impact statements
const audienceSegments = [
  {
    id: "behavioral-health",
    title: "Behavioral Health Settings",
    videoSrc: "/videos/therapy.mp4",
    posterSrc: "/images/postertherapy.png",
    metric: "40%",
    metricLabel: "Reduction in documentation time",
    impactStatement:
      "Ron AI's versatile agentic framework intelligently automates complex administrative tasks and streamlines communication, freeing behavioral health professionals to dedicate significantly more time to crucial patient care and mental wellness.",
    impactSource: "Impact in Behavioral Health",
  },
  {
    id: "telehealth",
    title: "Telehealth",
    videoSrc: "/videos/telehealth.mp4",
    posterSrc: "/images/posterTelehealth.png",
    metric: "75%",
    metricLabel: "Improved patient engagement",
    impactStatement:
      "Ron AI's adaptive agentic framework transforms telehealth delivery by automating appointment scheduling, streamlining virtual visit workflows, and enhancing remote patient monitoring, resulting in increased access to care and significantly improved patient engagement across diverse populations.",
    impactSource: "Impact in Telehealth",
  },
  {
    id: "hospitals",
    title: "Hospitals",
    videoSrc: "/videos/Hospital.mp4",
    posterSrc: "/images/posterHosptal.png",
    metric: "3.5x",
    metricLabel: "Faster prior authorizations",
    impactStatement:
      "Leveraging its adaptable agentic framework, Ron AI orchestrates seamless data flow and automates critical workflows like prior authorizations across hospital departments, massively boosting operational efficiency and enabling faster, more coordinated patient care.",
    impactSource: "Impact in Hospitals",
  },
  {
    id: "medical-offices",
    title: "Medical Offices",
    videoSrc: "/videos/MedOffice.mp4",
    posterSrc: "/images/posterMedical.png",
    metric: "60%",
    metricLabel: "Increase in staff capacity",
    impactStatement:
      "Ron AI's powerful agentic framework transforms medical office operations by automating routine tasks and enhancing communication, dramatically reducing administrative burden and allowing staff to focus more on direct patient interaction.",
    impactSource: "Impact in Medical Offices",
  },
  {
    id: "homecare",
    title: "Homecare Agencies",
    videoSrc: "/videos/Homecare.mp4",
    posterSrc: "/images/homecareposter.png",
    metric: "85%",
    metricLabel: "Improved care coordination",
    impactStatement:
      "For Homecare Agencies, Ron AI's versatile agents optimize scheduling, streamline documentation, and enhance communication between caregivers, clients, and providers, ensuring efficient operations and enabling a higher standard of coordinated in-home care.",
    impactSource: "Impact in Homecare",
  },
  {
    id: "health-plans",
    title: "Health Plans",
    videoSrc: "/videos/HealthPlan.mp4",
    posterSrc: "/images/posterHealthPlan.png",
    metric: "28%",
    metricLabel: "Reduction in processing time",
    impactStatement:
      "Ron AI provides Health Plans with a massive advantage through its agentic framework, automating complex processes like prior authorization review, ensuring compliance, and facilitating faster communication, leading to significant operational efficiencies.",
    impactSource: "Impact for Health Plans",
  },
  {
    id: "patients",
    title: "Patients",
    videoSrc: "/videos/Patient.mp4",
    posterSrc: "/images/posterPatient.png",
    metric: "90%",
    metricLabel: "Faster care approvals",
    impactStatement:
      "Through its intelligent agentic framework, Ron AI helps streamline communication and approvals between patients, providers, and payers, simplifying complex healthcare journeys and enabling faster access to necessary care.",
    impactSource: "Impact for Patients",
  },
]

// Animation timing constants
const COLUMN_DISPLAY_DURATION = 1500 // Initial display time before first expansion
const VIDEO_TRANSITION_DURATION = 1000 // Duration for column expansion/contraction
const EXPANDED_DURATION = 15000 // How long to stay expanded (adjust based on video length)

export default function HealthcareSectorsShowcase() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(audienceSegments.length).fill(null))
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialDisplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  // Function to activate a column
  const activateColumn = useCallback(
    (index: number) => {
      if (isTransitioning || index === activeIndex) return

      setIsTransitioning(true)

      // If there's an active column, pause its video
      if (activeIndex !== null) {
        const currentVideo = videoRefs.current[activeIndex]
        if (currentVideo) {
          currentVideo.pause()
        }
      }

      setActiveIndex(index)

      // After transition completes, play the video
      setTimeout(() => {
        const video = videoRefs.current[index]
        if (video) {
          safePlayVideo(video, () => {
            // If autoplay fails, still show the content
            setIsTransitioning(false)
          })
        }
        setIsTransitioning(false)
      }, VIDEO_TRANSITION_DURATION)
    },
    [activeIndex, isTransitioning],
  )

  // Function to deactivate the current column
  const deactivateColumn = useCallback(() => {
    if (activeIndex === null || isTransitioning) return

    setIsTransitioning(true)

    // Pause the current video
    const currentVideo = videoRefs.current[activeIndex]
    if (currentVideo) {
      currentVideo.pause()
    }

    setActiveIndex(null)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, VIDEO_TRANSITION_DURATION)
  }, [activeIndex, isTransitioning])

  // Function to go to the next column
  const goToNextColumn = useCallback(() => {
    if (activeIndex === null) {
      activateColumn(0)
    } else {
      const nextIndex = (activeIndex + 1) % audienceSegments.length
      activateColumn(nextIndex)
    }
  }, [activeIndex, activateColumn])

  // Function to go to the previous column
  const goToPrevColumn = useCallback(() => {
    if (activeIndex === null) {
      activateColumn(audienceSegments.length - 1)
    } else {
      const prevIndex = (activeIndex - 1 + audienceSegments.length) % audienceSegments.length
      activateColumn(prevIndex)
    }
  }, [activeIndex, activateColumn])

  // Initial setup when component comes into view
  useEffect(() => {
    if (!inView) return

    // Clear any existing timers
    if (initialDisplayTimerRef.current) {
      clearTimeout(initialDisplayTimerRef.current)
    }

    // Start with all columns visible, then activate the first one after a delay
    if (activeIndex === null && isPlaying) {
      initialDisplayTimerRef.current = setTimeout(() => {
        activateColumn(0)
      }, COLUMN_DISPLAY_DURATION)
    }

    return () => {
      if (initialDisplayTimerRef.current) {
        clearTimeout(initialDisplayTimerRef.current)
      }
    }
  }, [inView, activeIndex, isPlaying, activateColumn])

  // Handle video completion and auto-advance
  useEffect(() => {
    if (!inView || activeIndex === null || !isPlaying) return

    // Clear any existing timers
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }

    const currentVideo = videoRefs.current[activeIndex]
    if (!currentVideo) return

    // We're now using the onEnded event directly on the video element
    // so we don't need the event handler here, but we'll keep a fallback timer
    // in case the video doesn't trigger the onEnded event for some reason
    autoplayTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        const nextIndex = (activeIndex + 1) % audienceSegments.length
        activateColumn(nextIndex)
      }
    }, EXPANDED_DURATION)

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }
    }
  }, [activeIndex, isPlaying, inView, activateColumn])

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)

    if (isPlaying) {
      // Pausing - clear any timers
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }

      // Pause the active video if there is one
      if (activeIndex !== null) {
        const currentVideo = videoRefs.current[activeIndex]
        if (currentVideo) {
          currentVideo.pause()
        }
      }
    } else {
      // Resuming - if there's an active column, play its video
      if (activeIndex !== null) {
        const currentVideo = videoRefs.current[activeIndex]
        if (currentVideo) {
          safePlayVideo(currentVideo)
        }
      } else if (inView) {
        // If no active column, activate the first one
        activateColumn(0)
      }
    }
  }

  // Calculate column widths based on active state
  const getColumnWidth = (index: number) => {
    const totalColumns = audienceSegments.length

    if (activeIndex === null) {
      // All columns equal width when none is active
      return `calc(${100 / totalColumns}% - 8px)`
    } else if (index === activeIndex) {
      // Active column takes most of the space
      return "70%"
    } else {
      // Inactive columns share the remaining space
      return `calc(${30 / (totalColumns - 1)}% - 8px)`
    }
  }

  return (
    <section ref={ref} className="relative bg-gradient-to-b from-white to-slate-50 py-16 md:py-24 overflow-hidden">
      {/* Section heading */}
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Transforming <span className="text-[#00E5E0]">Healthcare Sectors</span>
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-base md:text-lg">
            Ron AI's versatile agentic framework delivers intelligent automation and streamlined workflows across the
            entire healthcare ecosystem.
          </p>
        </div>
      </div>

      {/* Columns container */}
      <div className="relative w-full max-w-7xl mx-auto h-[600px] px-4">
        <div className="flex h-full gap-2 justify-center">
          {audienceSegments.map((segment, index) => {
            const isActive = index === activeIndex

            return (
              <motion.div
                key={segment.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ${
                  isActive ? "shadow-xl shadow-[#00E5E0]/20 z-20" : "shadow-md hover:shadow-lg z-10"
                }`}
                animate={{
                  width: getColumnWidth(index),
                  filter: isActive ? "blur(0px)" : "blur(3px)",
                  scale: isActive ? 1 : 0.98,
                  transition: {
                    duration: VIDEO_TRANSITION_DURATION / 1000,
                    ease: "easeInOut",
                  },
                }}
                whileHover={{
                  filter: isActive ? "blur(0px)" : "blur(1px)",
                  scale: isActive ? 1 : 0.99,
                  transition: { duration: 0.3 },
                }}
                onClick={() => !isTransitioning && activateColumn(index)}
              >
                {/* Video/Image Background */}
                <div className="absolute inset-0 w-full h-full">
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el
                    }}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    poster={segment.posterSrc || "/placeholder.svg?height=600&width=1200"}
                    onEnded={() => {
                      if (isPlaying) {
                        const nextIndex = (index + 1) % audienceSegments.length
                        activateColumn(nextIndex)
                      }
                    }}
                    onError={(e) => {
                      console.log(`Video error for ${segment.id}:`, e)
                      // Set a fallback background color if video fails
                      e.currentTarget.style.backgroundColor = "#0a0f2c"
                    }}
                  >
                    <source src={segment.videoSrc} type="video/mp4" />
                    {/* Fallback text */}
                    <p className="hidden">Your browser doesn't support HTML5 video.</p>
                  </video>

                  {/* Gradient overlay - darker for inactive columns */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isActive
                        ? "bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-slate-900/30"
                        : "bg-gradient-to-t from-slate-900/90 via-slate-900/80 to-slate-900/60"
                    }`}
                  ></div>
                </div>

                {/* Column title - always visible */}
                <div
                  className={`absolute inset-x-0 transition-all duration-500 ease-in-out ${
                    isActive ? "top-6" : "bottom-0 py-6 bg-gradient-to-t from-black/90 to-transparent"
                  }`}
                >
                  <h3
                    className={`font-bold transition-all duration-500 px-4 ${
                      isActive ? "text-[#00E5E0] text-2xl md:text-3xl mb-2" : "text-white text-base md:text-lg"
                    }`}
                  >
                    {segment.title}
                  </h3>
                </div>

                {/* Content - only visible when active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute inset-x-0 bottom-0 p-6 md:p-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1], // Custom easing for smoother animation
                      }}
                    >
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                          {/* Metric */}
                          <div className="flex-shrink-0 text-center md:text-left">
                            <div className="text-4xl md:text-6xl font-bold text-[#00E5E0]">{segment.metric}</div>
                            <div className="text-sm md:text-base text-gray-200 mt-1">{segment.metricLabel}</div>
                          </div>

                          {/* Impact Statement */}
                          <div className="flex-grow border-t-2 md:border-t-0 md:border-l-2 border-white/20 pt-4 md:pt-0 md:pl-8">
                            <p className="text-sm md:text-base lg:text-lg text-white mb-3 font-light italic">
                              "{segment.impactStatement}"
                            </p>
                            <p className="text-xs md:text-sm text-[#00E5E0] font-semibold">{segment.impactSource}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {/* Previous button */}
        <button
          onClick={goToPrevColumn}
          disabled={isTransitioning}
          className="w-10 h-10 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors disabled:opacity-50"
          aria-label="Previous sector"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Next button */}
        <button
          onClick={goToNextColumn}
          disabled={isTransitioning}
          className="w-10 h-10 flex items-center justify-center text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors disabled:opacity-50"
          aria-label="Next sector"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center mt-6 gap-2">
        {audienceSegments.map((_, index) => (
          <button
            key={index}
            onClick={() => activateColumn(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-[#00E5E0] w-4" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to sector ${index + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </section>
  )
}
