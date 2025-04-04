"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

// --- Constants ---
const ACCENT_COLOR_1 = "#2dd4bf" // Teal-ish used in original sophisticated card
const GLOW_COLOR_1 = "rgba(45, 212, 191, 0.3)" // teal accent, semi-transparent
const GLOW_COLOR_2 = "rgba(168, 85, 247, 0.2)" // purple accent, semi-transparent
const ACCENT_COLOR_CAROUSEL = "#00E5E0" // Teal used in carousel controls

// --- Card Data (Matching Sophisticated FlipCard Structure) ---
const cardData = [
  {
    id: 1,
    question: "Stuck in prior authorization loops?",
    imagePath: "/images/prior-auth-glow.svg", // Using image paths now
    imageAlt: "Abstract prior authorization approval process",
  },
  {
    id: 2,
    question: "Communication breakdowns slowing care?",
    imagePath: "/images/communication-glow.svg",
    imageAlt: "Seamless communication nodes",
  },
  {
    id: 3,
    question: "Need to automate complex workflows?",
    imagePath: "/images/automation-glow.svg",
    imageAlt: "Automated clinical workflows gears",
  },
  {
    id: 4,
    question: "How can SDOH truly inform patient care?",
    imagePath: "/images/sdoh-glow.svg",
    imageAlt: "Social determinants enhancing patient profile",
  },
  {
    id: 5,
    question: "Is your system truly interoperable?",
    imagePath: "/images/interop-glow.svg",
    imageAlt: "Interconnected systems data flow",
  },
  {
    id: 6,
    question: "Ready for proactive healthcare?",
    imagePath: "/images/proactive-glow.svg",
    imageAlt: "Timeline showing proactive interventions",
  },
]

// --- Enhanced 3D Carousel Transition Variants ---
const carouselTransitionVariants = {
  enter: { 
    x: 120, 
    opacity: 0, 
    scale: 0.8, 
    rotateY: -45, 
    z: -200,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)"
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    z: 0,
    boxShadow: "0px 30px 60px rgba(0,0,0,0.3)",
    transition: { 
      duration: 0.8, 
      ease: [0.2, 0.65, 0.3, 1], // Custom cubic bezier for elegant motion
      boxShadow: { delay: 0.2, duration: 0.4 }
    },
  },
  exit: {
    zIndex: 0,
    x: -120,
    opacity: 0,
    scale: 0.8,
    rotateY: 45,
    z: -200,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)",
    transition: { 
      duration: 0.8, 
      ease: [0.2, 0.65, 0.3, 1] // Custom cubic bezier for elegant motion
    },
  },
}

// --- Main Carousel Component ---
export default function AutoFlipCarousel() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false) // Controlled by carousel
  const [isChanging, setIsChanging] = useState(false)

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.3,
  })

  // --- Carousel Logic ---
  const changeCard = useCallback(
    (newIndex: number) => {
      if (isChanging) return
      setIsChanging(true)
      setIsFlipped(false) // Reset flip state for the new card
      setCurrentCardIndex(newIndex)
      setTimeout(() => setIsChanging(false), 750) // Match transition duration approx
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
    if (!inView || isChanging) return
    let timer: NodeJS.Timeout
    if (!isFlipped) {
      timer = setTimeout(() => setIsFlipped(true), 3000) // Flip after 3s
    } else {
      timer = setTimeout(() => nextCard(), 3000) // Advance after 3s
    }
    return () => clearTimeout(timer)
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

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#050818] via-[#0a0f2c] to-[#050818] overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('/images/subtle-grid.svg')] bg-repeat"></div>
      <div
        className={`absolute inset-0 z-0 opacity-20 bg-blend-normal blur-[100px] [background-image:radial-gradient(circle_at_20%_30%,${GLOW_COLOR_1}_0%,transparent_50%),radial-gradient(circle_at_80%_70%,${GLOW_COLOR_2}_0%,transparent_50%)]`}
      ></div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white mb-4">
            Transforming Healthcare Challenges
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Ron AI leverages advanced agentic frameworks to solve complex issues in automation, communication, and
            proactive care.
          </p>
        </motion.div>

        {/* Card counter with animation */}
        <div className="flex justify-center mb-10 space-x-2">
          {cardData.map((_, index) => (
            <div
              key={index}
              className={`relative w-2 h-2 rounded-full transition-colors duration-300 ${index === currentCardIndex ? `bg-[${ACCENT_COLOR_CAROUSEL}]` : "bg-gray-600"}`}
            >
              {index === currentCardIndex && (
                <motion.div
                  className={`absolute -inset-1 bg-[${ACCENT_COLOR_CAROUSEL}]/30 rounded-full`}
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
          {" "}
          {/* Adjusted height */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentCardIndex} // Key drives the carousel transition
              variants={carouselTransitionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full max-w-lg h-full" // Adjusted max-width
            >
              {/* Render the sophisticated card, passing the controlled flip state */}
              <CarouselFlipCard
                id={currentCard.id} // Pass necessary props from currentCard
                question={currentCard.question}
                imagePath={currentCard.imagePath}
                imageAlt={currentCard.imageAlt}
                isFlipped={isFlipped} // Pass carousel's flip state
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Manual controls */}
        <div className="flex justify-center mt-12 space-x-4">
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
              className={`text-[${ACCENT_COLOR_CAROUSEL}] group-hover:-translate-x-1 transition-transform`}
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
              className={`text-[${ACCENT_COLOR_CAROUSEL}] group-hover:translate-x-1 transition-transform`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced custom styles for more sophisticated 3D effects */}
      <style jsx>{`
        .perspective-1200 {
          perspective: 1200px;
        }
        .perspective-1500 {
          perspective: 1500px;
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
        .translate-z-5 {
          transform: translateZ(5px);
        }
        .translate-z-10 {
          transform: translateZ(10px);
        }
        .translate-z-20 {
          transform: translateZ(20px);
        }
        .translate-z-30 {
          transform: translateZ(30px);
        }
        
        /* Animation keyframes for glow effects */
        @keyframes pulseGlow {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        
        /* Enhanced hover effects */
        .flip-card-container:hover .flip-card-front,
        .flip-card-container:hover .flip-card-back {
          box-shadow: 0 35px 70px -15px rgba(0,0,0,0.7), 0 20px 40px -10px rgba(0,0,0,0.6);
          transition: box-shadow 0.7s ease-out;
        }
      `}</style>
    </section>
  )
}

// --- Adapted Sophisticated Flip Card Component ---
interface CarouselFlipCardProps {
  id: number // Keep id if needed, though not strictly used for display here
  question: string
  imagePath: string
  imageAlt: string
  isFlipped: boolean // Controlled externally
}

function CarouselFlipCard({ question, imagePath, imageAlt, isFlipped }: CarouselFlipCardProps) {
  // Enhanced 3D styles with more sophisticated dimension
  const cardBaseStyle =
    "absolute w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/10"
  const cardBackgroundStyle = "bg-slate-900/60 backdrop-blur-lg" // Glassmorphism base
  
  // Enhanced shadow styles for more dramatic 3D effect
  const frontShadow = "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_15px_30px_-5px_rgba(0,0,0,0.5)]"
  const backShadow = "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_15px_30px_-5px_rgba(0,0,0,0.5)]"

  return (
    <div className="flip-card-container h-full w-full perspective-1500 group"> {/* Increased perspective for more dramatic 3D */}
      <div
        className={`flip-card relative w-full h-full transition-transform duration-1200 ease-[cubic-bezier(0.2,1,0.3,1)] transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* :: CARD FRONT :: */}
        <div className={`${cardBaseStyle} flip-card-front ${cardBackgroundStyle} ${frontShadow}`}>
          {/* Enhanced Aurora Glow with more sophisticated layering */}
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-700 blur-[30px] [background:radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.45),transparent_60%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.35),transparent_60%),radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent_100%)]"
          ></div>

          {/* Enhanced 3D Layered Background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95"></div>
          <div 
            className="absolute inset-0 bg-[url('/images/circuit-pattern.png')] bg-cover opacity-10 translate-z-2"
          ></div>

          {/* Tech Cross in Background with enhanced depth */}
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-10 translate-z-1"
          >
            <Image
              src="/images/tech-cross.svg"
              alt="Tech cross pattern"
              width={300}
              height={300}
              className="w-3/4 h-3/4 object-contain"
              unoptimized
            />
          </div>

          {/* Enhanced 3D Edge Highlight with more pronounced effect */}
          <div className="absolute inset-0 border-t-2 border-l-2 border-white/8 rounded-2xl"></div>
          <div className="absolute inset-0 border-b-2 border-r-2 border-black/25 rounded-2xl"></div>

          {/* Content Area with enhanced 3D Elevation */}
          <div className="relative z-10 h-full p-6 md:p-8 flex flex-col items-center justify-center text-center transform-style-3d">
            {/* Enhanced Inner Glow Border on Hover */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/25 transition-colors duration-500 pointer-events-none"></div>

            {/* Enhanced Outer Glow Effect on Hover with more sophisticated animation */}
            <div 
              className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-400/70 via-purple-500/70 to-pink-500/70 opacity-0 group-hover:opacity-90 transition-all duration-700 blur-xl pointer-events-none origin-center animate-pulse-glow"
            ></div>

            {/* Enhanced 3D Text with more pronounced Shadow and elevation */}
            <h3 
              className="text-xl md:text-2xl font-medium text-gray-100 leading-snug drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] translate-z-[15px] [text-shadow:0_1px_2px_rgba(0,0,0,0.3),0_2px_10px_rgba(0,0,0,0.15)]"
            >
              {question}
            </h3>

            {/* Enhanced 3D Button Indicator with more sophisticated hover effect */}
            <div 
              className="mt-8 opacity-70 group-hover:opacity-100 transition-all duration-500 translate-z-[25px]"
            >
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/40 to-purple-500/40 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] shadow-[0_8px_16px_-2px_rgba(0,0,0,0.3),0_0_15px_rgba(45,212,191,0.2)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/90"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* :: CARD BACK :: */}
        <div className={`${cardBaseStyle} flip-card-back ${cardBackgroundStyle} ${backShadow} rotate-y-180`}>
          {/* Enhanced Aurora Glow with more sophisticated layering */}
          <div
            className="absolute inset-0 opacity-60 blur-[40px] [background:radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.35),transparent_70%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.25),transparent_60%)]"
          ></div>

          {/* Enhanced 3D Layered Background with depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95"></div>
          <div 
            className="absolute inset-0 bg-[url('/images/circuit-pattern-2.png')] bg-cover opacity-10 translate-z-2"
          ></div>

          {/* Tech Cross in Background with enhanced depth */}
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-5 rotate-45 translate-z-1"
          >
            <Image
              src="/images/tech-cross.svg"
              alt="Tech cross pattern"
              width={300}
              height={300}
              className="w-3/4 h-3/4 object-contain"
              unoptimized
            />
          </div>

          {/* Enhanced 3D Edge Highlight with more pronounced effect */}
          <div className="absolute inset-0 border-t-2 border-l-2 border-white/8 rounded-2xl"></div>
          <div className="absolute inset-0 border-b-2 border-r-2 border-black/25 rounded-2xl"></div>

          {/* Content Area with enhanced 3D Elevation */}
          <div className="relative z-10 h-full p-4 flex items-center justify-center transform-style-3d">
            {/* Image with enhanced 3D effect and more sophisticated hover interaction */}
            <div 
              className="relative transform transition-all duration-700 ease-out translate-z-[30px] rotate-x-5 origin-center"
            >
              {/* Enhanced glow effect with animation */}
              <div 
                className="absolute -inset-6 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse-glow [animation-delay:0.5s]"
              ></div>
              
              {/* Enhanced image with more sophisticated 3D effects */}
              <Image
                src={imagePath || "/placeholder.svg"}
                alt={imageAlt}
                width={240}
                height={240}
                className="w-auto h-auto max-w-[80%] max-h-[80%] object-contain group-hover:scale-105 transition-transform duration-700 translate-z-[10px] [filter:drop-shadow(0_0_20px_rgba(45,212,191,0.4))_drop-shadow(0_0_30px_rgba(168,85,247,0.3))_drop-shadow(0_20px_30px_rgba(0,0,0,0.5))] transition-all ease-out"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
