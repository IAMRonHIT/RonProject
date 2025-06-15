"use client"

import { useState, useRef, useEffect } from "react"
import { Pause, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { safePlayVideo } from "@/utils/video-helpers"

// Define audience segments with impact statements
const audienceSegments = [
  {
    id: "behavioral-health",
    title: "Behavioral Health Settings",
    videoSrc: "/therapy.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "40%",
    metricLabel: "Reduction in documentation time",
    impactStatement:
      "Ron AI's versatile agentic framework intelligently automates complex administrative tasks and streamlines communication, freeing behavioral health professionals to dedicate significantly more time to crucial patient care and mental wellness.",
    impactSource: "Impact in Behavioral Health",
  },
  {
    id: "hospitals",
    title: "Hospitals",
    videoSrc: "/Hospital.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "3.5x",
    metricLabel: "Faster prior authorizations",
    impactStatement:
      "Leveraging its adaptable agentic framework, Ron AI orchestrates seamless data flow and automates critical workflows like prior authorizations across hospital departments, massively boosting operational efficiency and enabling faster, more coordinated patient care.",
    impactSource: "Impact in Hospitals",
  },
  {
    id: "medical-offices",
    title: "Medical Offices",
    videoSrc: "/MedOffice.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "60%",
    metricLabel: "Increase in staff capacity",
    impactStatement:
      "Ron AI's powerful agentic framework transforms medical office operations by automating routine tasks and enhancing communication, dramatically reducing administrative burden and allowing staff to focus more on direct patient interaction.",
    impactSource: "Impact in Medical Offices",
  },
  {
    id: "homecare",
    title: "Homecare Agencies",
    videoSrc: "/Homecare.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "85%",
    metricLabel: "Improved care coordination",
    impactStatement:
      "For Homecare Agencies, Ron AI's versatile agents optimize scheduling, streamline documentation, and enhance communication between caregivers, clients, and providers, ensuring efficient operations and enabling a higher standard of coordinated in-home care.",
    impactSource: "Impact in Homecare",
  },
  {
    id: "health-plans",
    title: "Health Plans",
    videoSrc: "/HealthPlan.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "28%",
    metricLabel: "Reduction in processing time",
    impactStatement:
      "Ron AI provides Health Plans with a massive advantage through its agentic framework, automating complex processes like prior authorization review, ensuring compliance, and facilitating faster communication, leading to significant operational efficiencies.",
    impactSource: "Impact for Health Plans",
  },
  {
    id: "patients",
    title: "Patients",
    videoSrc: "/Patient.mp4",
    posterSrc: "/placeholder.svg?height=600&width=1200",
    metric: "90%",
    metricLabel: "Faster care approvals",
    impactStatement:
      "Through its intelligent agentic framework, Ron AI helps streamline communication and approvals between patients, providers, and payers, simplifying complex healthcare journeys and enabling faster access to necessary care.",
    impactSource: "Impact for Patients",
  },
]

export default function TestimonialStyleSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(audienceSegments.length).fill(null))
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to play the current video
  const playCurrentVideo = () => {
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo) {
      safePlayVideo(currentVideo)
    }
  }

  // Function to pause the current video
  const pauseCurrentVideo = () => {
    const currentVideo = videoRefs.current[currentIndex]
    if (currentVideo && !currentVideo.paused) {
      currentVideo.pause()
    }
  }

  // Function to advance to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % audienceSegments.length)
  }

  // Handle video playback and auto-advance logic
  useEffect(() => {
    // Clear any existing interval when currentIndex or isPlaying changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const currentVideo = videoRefs.current[currentIndex]

    if (currentVideo) {
      const handleVideoEnd = () => {
        // Only advance if playing and the video that ended is the current one
        if (isPlaying) {
          console.log("Video ended, advancing slide.")
          nextSlide()
        }
      }

      // Ensure previous listeners are removed before adding new ones
      currentVideo.removeEventListener("ended", handleVideoEnd)
      currentVideo.addEventListener("ended", handleVideoEnd)

      if (isPlaying) {
        playCurrentVideo()
        // Fallback timer in case 'ended' event doesn't fire reliably or video is short
        const videoDuration = currentVideo.duration
        const timeoutDuration = isNaN(videoDuration) || videoDuration < 1 ? 8000 : Math.max(videoDuration * 1000, 8000)
        console.log(`Setting interval for ${timeoutDuration}ms`)
        intervalRef.current = setInterval(() => {
          console.log("Interval triggered, advancing slide.")
          nextSlide()
        }, timeoutDuration)
      } else {
        pauseCurrentVideo()
      }

      // Cleanup function
      return () => {
        console.log("Cleanup effect")
        currentVideo.removeEventListener("ended", handleVideoEnd)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          console.log("Interval cleared in cleanup")
        }
      }
    }
  }, [currentIndex, isPlaying])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    pauseCurrentVideo()
    setCurrentIndex(index)
  }

  const handlePrevSlide = () => {
    goToSlide((currentIndex - 1 + audienceSegments.length) % audienceSegments.length)
  }

  const handleNextSlide = () => {
    goToSlide((currentIndex + 1) % audienceSegments.length)
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying)
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50 py-16 md:py-24" ref={containerRef}>
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

      <div className="relative w-full overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          {audienceSegments.map((segment, index) => (
            <div
              key={segment.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className="absolute inset-0 bg-slate-100">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop={!isPlaying}
                  preload="metadata"
                  poster={segment.posterSrc || "/placeholder.svg?height=600&width=1200"}
                  onError={(e) => {
                    console.log(`Video error for ${segment.id}:`, e)
                    e.currentTarget.style.backgroundColor = "#0a0f2c"
                  }}
                >
                  <source src={segment.videoSrc} type="video/mp4" />
                  <p className="hidden">Your browser doesn't support HTML5 video.</p>
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/50 to-transparent"></div>
              </div>

              <div
                className={`absolute inset-0 flex items-center justify-center p-4 md:p-8 transition-all duration-500 ease-in-out ${index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              >
                <div className="w-full max-w-6xl mx-auto">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 md:p-10 shadow-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                      <div className="flex-shrink-0 text-center md:text-left">
                        <div className="text-5xl md:text-7xl font-bold text-[#00E5E0]">{segment.metric}</div>
                        <div className="text-sm md:text-base text-gray-200 mt-1">{segment.metricLabel}</div>
                      </div>

                      <div className="flex-grow border-t-2 md:border-t-0 md:border-l-2 border-white/20 pt-4 md:pt-0 md:pl-8">
                        <p className="text-base md:text-lg lg:text-xl text-white mb-3 font-light italic">
                          "{segment.impactStatement}"
                        </p>
                        <p className="text-sm md:text-base text-[#00E5E0] font-semibold">{segment.impactSource}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-sm rounded-full p-1">
          <div className="hidden md:flex items-center gap-2 mr-2">
            {audienceSegments.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={togglePlayPause}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={handlePrevSlide}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextSlide}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}

