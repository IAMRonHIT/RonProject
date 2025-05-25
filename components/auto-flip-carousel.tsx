"use client"

import { useState, useEffect, useCallback } from "react"
import '../styles/carousel.css';
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { CheckCircle, Network, Cog, MapPin, PuzzleIcon as PuzzlePiece, LineChart } from "lucide-react"
import Image from "next/image"

// Card data remains the same
const cardData = [
  {
    id: 1,
    question: "Stuck in prior authorization loops?",
    icon: CheckCircle,
    description: "Ron AI automates prior authorization requests by intelligently gathering necessary documentation and directly interfacing with payer systems, reducing delays.",
  },
  {
    id: 2,
    question: "Communication breakdowns slowing care?",
    icon: Network,
    description: "Ron AI provides a unified communication platform that connects providers, payers, and patients, ensuring coordinated and timely information exchange.",
  },
  {
    id: 3,
    question: "Need to automate complex clinical workflows?",
    icon: Cog,
    description: "Ron AI employs intelligent agents to automate and streamline clinical workflows, such as patient intake, scheduling, and results management, adapting to your specific processes.",
  },
  {
    id: 4,
    question: "Struggling with personalized care planning?",
    icon: MapPin,
    description: "Ron AI's Care Plan Generator uses AI to create evidence-based, personalized care plans, considering individual patient data and the latest clinical guidelines.",
  },
  {
    id: 5,
    question: "Is your system truly interoperable?",
    icon: PuzzlePiece,
    description: "Ron AI acts as an interoperability hub, securely connecting with diverse healthcare IT systems (EHRs, LIS) using standards like FHIR for seamless data exchange.",
  },
  {
    id: 6,
    question: "Ready for proactive, not just reactive, healthcare?",
    icon: LineChart,
    description: "Ron AI utilizes predictive analytics on patient data to identify at-risk individuals and potential adverse events, enabling proactive interventions.",
  },
]

// --- Sophisticated Transition Variants ---
const carouselTransitionVariants = {
  enter: {
    x: 100, // Start further off-screen
    opacity: 0,
    scale: 0.85,
    rotateY: -30, // Add rotation
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      // Option 1: Spring physics
      // type: "spring",
      // stiffness: 100,
      // damping: 20,

      // Option 2: Smooth Cubic Bezier (adjust duration as needed)
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1], // Example smooth easing
    },
  },
  exit: {
    zIndex: 0,
    x: -100, // Exit further off-screen
    opacity: 0,
    scale: 0.85,
    rotateY: 30, // Rotate opposite direction
    transition: {
      // Option 1: Spring physics (match stiffness/damping)
      // type: "spring",
      // stiffness: 100,
      // damping: 20,

      // Option 2: Smooth Cubic Bezier (match duration/easing)
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function AutoFlipCarousel() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isChanging, setIsChanging] = useState(false) // Prevents overlapping timeouts

  const { ref, inView } = useInView({
    triggerOnce: false, // Keep observing
    threshold: 0.3, // More visible before triggering
  })

  // --- Carousel Logic ---
  const changeCard = useCallback(
    (newIndex: number) => {
      if (isChanging) return // Prevent rapid changes

      setIsChanging(true)
      setIsFlipped(false) // Ensure next card starts on the front
      setCurrentCardIndex(newIndex)

      // Set timeout to match the *carousel transition duration* approx.
      // This is harder with springs, easier with duration. Adjust as needed.
      setTimeout(() => {
        setIsChanging(false)
      }, 750) // Slightly longer than the 0.7s transition duration
    },
    [isChanging],
  )

  const nextCard = useCallback(() => {
    changeCard((currentCardIndex + 1) % cardData.length)
  }, [changeCard, currentCardIndex])

  const prevCard = useCallback(() => {
    changeCard((currentCardIndex - 1 + cardData.length) % cardData.length)
  }, [changeCard, currentCardIndex])

  // --- Automatic Flipping and Advancing ---
  useEffect(() => {
    if (!inView || isChanging) return // Pause if not visible or during transition

    let timer: NodeJS.Timeout

    if (!isFlipped) {
      // Show front for 3 seconds, then flip
      timer = setTimeout(() => {
        setIsFlipped(true)
      }, 3000)
    } else {
      // Show back for 3 seconds, then move to next card
      timer = setTimeout(() => {
        nextCard() // This now handles setting isChanging and the timeout
      }, 3000)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [currentCardIndex, isFlipped, isChanging, nextCard, inView])

  // Reset when coming into view
  useEffect(() => {
    if (inView) {
      setCurrentCardIndex(0)
      setIsFlipped(false)
      setIsChanging(false)
    }
  }, [inView])

  const currentCard = cardData[currentCardIndex]
  const IconComponent = currentCard.icon

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#050818] via-[#0a0f2c] to-[#050818] overflow-hidden" // Enhanced background
    >
      {/* Background Effects (Optional, like previous example) */}
      {/* <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('/images/subtle-grid.svg')] bg-repeat"></div> */} {/* Removed missing SVG */}
      <div
        className="absolute inset-0 z-0 opacity-20 carousel-background"
      ></div>

      {/* Change the container structure to create a two-column layout */}
      {/* Replace the existing container div with this two-column layout */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left column - Card display area */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            {/* Card counter with animation */}
            <div className="flex justify-center mb-10 space-x-2">
              {cardData.map((_, index) => (
                <div
                  key={index}
                  className={`relative w-2 h-2 rounded-full transition-colors duration-300 ${index === currentCardIndex ? "bg-[#00E5E0]" : "bg-gray-600"}`}
                >
                  {index === currentCardIndex && (
                    <motion.div
                      className="absolute -inset-1 bg-[#00E5E0]/30 rounded-full"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Card display area */}
            <div className="flex justify-center items-center h-80 md:h-96 relative">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentCardIndex}
                  variants={carouselTransitionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute w-full max-w-lg h-full"
                >
                  {/* The Flippable Card itself */}
                  <motion.div 
                    className="flip-card-container w-full h-full perspective-1200 group"
                    whileHover={{ rotateX: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }} // For the hover effect
                  >
                    <div
                      className={`flip-card relative w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front side */}
                      <div className="flip-card-front absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] to-[#0d1a1a] p-6 flex items-center justify-center">
                          {/* 3D Layered Background */}
                          <div className="absolute inset-0 bg-[url('/images/circuit-pattern.png')] bg-cover opacity-5"></div>

                          {/* Tech Cross in Background */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Image
                              src="/images/tech-cross.svg"
                              alt="Tech cross pattern"
                              width={300}
                              height={300}
                              className="w-3/4 h-3/4 object-contain"
                              unoptimized
                            />
                          </div>

                          {/* 3D Edge Highlight */}
                          <div className="absolute inset-0 border-t border-l border-white/5 rounded-xl"></div>
                          <div className="absolute inset-0 border-b border-r border-black/20 rounded-xl"></div>

                          <div className="absolute inset-0 rounded-xl border border-[#00B8A9]/20"></div>
                          <div className="absolute top-0 left-0 w-16 h-16 bg-[#00B8A9]/10 blur-xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                          <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#00E5E0]/10 blur-xl rounded-full translate-x-1/2 translate-y-1/2"></div>

                          {/* 3D Text with Shadow */}
                          <h3 className="text-2xl md:text-3xl font-semibold text-white text-center leading-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] transform translate-z-5">
                            {currentCard.question}
                          </h3>
                        </div>
                      </div>

                      {/* Back side */}
                      <div className="flip-card-back absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-[#0a0a1a] p-6 flex flex-col items-center justify-center">
                          {/* 3D Layered Background */}
                          <div className="absolute inset-0 bg-[url('/images/circuit-pattern-2.png')] bg-cover opacity-5"></div>

                          {/* Tech Cross in Background */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-5 rotate-45">
                            <Image
                              src="/images/tech-cross.svg"
                              alt="Tech cross pattern"
                              width={300}
                              height={300}
                              className="w-3/4 h-3/4 object-contain"
                              unoptimized
                            />
                          </div>

                          {/* 3D Edge Highlight */}
                          <div className="absolute inset-0 border-t border-l border-white/5 rounded-xl"></div>
                          <div className="absolute inset-0 border-b border-r border-black/20 rounded-xl"></div>

                          <div className="absolute inset-0 rounded-xl border border-[#00B8A9]/30"></div>
                          <div className="relative mb-6 p-4 transform translate-z-10">
                            <div className="absolute inset-0 bg-[#00B8A9]/10 rounded-full blur-xl"></div>
                            <IconComponent
                              size={80}
                              className="text-[#00E5E0] filter drop-shadow-[0_0_8px_rgba(0,229,224,0.7)]"
                            />
                          </div>
                          <p className="text-white text-center text-lg font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transform translate-z-5">
                            {currentCard.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Manual controls */}
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={prevCard}
                disabled={isChanging}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group backdrop-blur-sm border border-white/10"
                aria-label="Previous card"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#00E5E0] group-hover:-translate-x-1 transition-transform"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={nextCard}
                disabled={isChanging}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group backdrop-blur-sm border border-white/10"
                aria-label="Next card"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#00E5E0] group-hover:translate-x-1 transition-transform"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right column - Section heading */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <motion.div
              className="text-left mb-12 md:mb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white mb-6">
                Transforming Healthcare Challenges
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed">
                Ron AI leverages advanced agentic frameworks to solve complex issues in automation, communication, and
                proactive care.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom styles needed for 3D flip */}
      <style jsx>{`
        .perspective-1200 { /* Increased from 1000 */
          perspective: 1200px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden; /* Safari */
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-5 {
          transform: translateZ(5px);
        }
        .translate-z-10 {
          transform: translateZ(10px);
        }
      `}</style>
    </section>
  )
}
