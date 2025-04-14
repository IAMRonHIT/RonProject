"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Team member data structure
interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imagePath: string;
}

// Sample team data
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Tim Hunter",
    role: "CEO & Co-Founder",
    bio: "Technology leader with expertise in AI and healthcare integration systems.",
    imagePath: "/images/tim.png"
  },
  {
    id: 2,
    name: "Bill Philbrick",
    role: "JD LLM AI Chief Compliance & Governance Officer",
    bio: "Healthcare executive with a focus on innovation and strategic partnerships.",
    imagePath: "/images/bill.png"
  },
  {
    id: 3,
    name: "Nicole Zonin",
    role: "Chief Clinical Officer",
    bio: "Operations expert with background in healthcare technology deployment.",
    imagePath: "/images/nicole.png"
  },
  {
    id: 4,
    name: "Natalie Schwartz",
    role: "Chief Medical Officer",
    bio: "Research specialist focused on applying AI in clinical settings.",
    imagePath: "/images/natalie.png"
  },
  {
    id: 5,
    name: "Abigail Mitchell",
    role: "Head of Research & Development",
    bio: "Product strategist specializing in user-centered healthcare solutions.",
    imagePath: "/images/abi.png"
  },
  {
    id: 6,
    name: "Mike Thorn",
    role: "Strategic Advisor",
    bio: "Chair of Mayo Clinic Innovation and Board Member of SONSIEL with expertise in nursing science, innovation, and healthcare entrepreneurship.",
    imagePath: "/images/mike.png"
  }
];

export default function TeamProjector() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFlickering, setIsFlickering] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const timersRef = useRef<number[]>([]);
  
  // Clear all timers to prevent memory leaks
  const clearTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };
  
  // Clean up timers on component unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);
  
  // Handle mouse enter - start projector sequence
  const handleMouseEnter = (id: number) => {
    // Clear any existing timers
    clearTimers();
    
    setActiveId(id);
    setIsFlickering(true);
    setIsStable(false);
    
    // After flicker animation completes, set to stable state
    const timer = window.setTimeout(() => {
      setIsFlickering(false);
      setIsStable(true);
    }, 600); // Flicker duration
    
    timersRef.current.push(timer);
  };
  
  // Handle mouse leave - reset states
  const handleMouseLeave = () => {
    setIsStable(false);
    
    const timer = window.setTimeout(() => {
      setActiveId(null);
      setIsFlickering(false);
    }, 300); // Exit animation duration
    
    timersRef.current.push(timer);
  };
  
  // Get active team member
  const activeMember = activeId !== null 
    ? teamMembers.find(member => member.id === activeId) 
    : null;

  return (
    <div className="relative w-full py-16 md:py-24 bg-gradient-to-b from-[#050818] via-[#0a0f2c] to-[#050818] overflow-hidden">
      {/* Background effects - using a CSS pattern instead of an image */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
        backgroundSize: `20px 20px`
      }}></div>
      <div className="absolute inset-0 z-0 opacity-20 bg-blend-normal blur-[100px] [background-image:radial-gradient(circle_at_20%_30%,rgba(45,212,191,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.2)_0%,transparent_50%)]"></div>
      
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white mb-4">
            Our Team
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Meet the experts behind Ron AI's innovative healthcare solutions.
          </p>
        </motion.div>
        
        {/* Team member grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-16">
          {teamMembers.map(member => (
            <motion.div
              key={member.id}
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: member.id * 0.1 }}
              onMouseEnter={() => handleMouseEnter(member.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Photo container */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <Image 
                  src={member.imagePath}
                  alt={`${member.name} - ${member.role}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Photo overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <p className="text-sm font-medium text-white">{member.name}</p>
                </div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-400/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-400/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
              </div>
              
              {/* Projector source point (for beam origin) */}
              {activeId === member.id && (
                <div className="absolute bottom-0 left-1/2 w-1 h-1 transform -translate-x-1/2 bg-cyan-400 rounded-full z-30" />
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Projector and projection area */}
        <div className="relative h-[300px] md:h-[400px] w-full">
          <AnimatePresence>
            {activeId !== null && activeMember && (
              <>
                {/* Enhanced projector beam */}
                <motion.div
                  key={`beam-${activeMember.id}`}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ 
                    opacity: isFlickering ? [0.7, 0.3, 0.9, 0.5, 1] : isStable ? 0.9 : 0, 
                    scaleY: 1 
                  }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{
                    opacity: isFlickering ? { 
                      duration: 0.6, 
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1] 
                    } : { duration: 0.3 },
                    scaleY: { duration: 0.5 }
                  }}
                  style={{
                    transformOrigin: 'top',
                    left: `calc(${(activeMember.id - 0.5) * (100 / teamMembers.length)}% - 10%)`,
                    width: '20%',
                  }}
                  className="absolute top-[-30px] h-[200px] z-10 beam-gradient"
                >
                  {/* Enhanced beam internals with dust particles effect */}
                  <div className="absolute inset-0 beam-lines opacity-30"></div>
                  
                  {/* Dust particles in the beam */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="beam-particles"></div>
                  </div>
                  
                  {/* Lens flare effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-400/80 blur-md"></div>
                </motion.div>
                
                {/* Projected content */}
                <motion.div
                  key={`content-${activeMember.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isStable ? 1 : 0, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: isFlickering ? 0.6 : 0 }}
                  className="relative z-20 mx-auto max-w-2xl bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
                >
                  {/* Projector screen effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-800/10 rounded-xl screen-texture"></div>
                  <div className="absolute inset-0 rounded-xl border-t-2 border-l-2 border-white/5"></div>
                  <div className="absolute inset-0 rounded-xl border-b-2 border-r-2 border-black/20"></div>
                  
                  {/* Flickering effect */}
                  {isFlickering && (
                    <div className="absolute inset-0 opacity-70 animate-projector-flicker rounded-xl bg-white/5"></div>
                  )}
                  
                  {/* Content */}
                  <div className="p-8 md:p-10 relative z-10">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{activeMember.name}</h3>
                        <p className="text-cyan-400 font-medium filter drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">{activeMember.role}</p>
                      </div>
                      <div className="w-16 h-16 md:w-20 md:h-20 relative rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                        <Image 
                          src={activeMember.imagePath}
                          alt={activeMember.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{activeMember.bio}</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Custom styles for projector effects */}
      <style jsx>{`
        /* Projector beam gradient */
        .beam-gradient {
          background: linear-gradient(to bottom, 
            rgba(45, 212, 191, 0.98) 0%, 
            rgba(45, 212, 191, 0.9) 5%,
            rgba(45, 212, 191, 0.8) 15%,
            rgba(45, 212, 191, 0.6) 30%, 
            rgba(45, 212, 191, 0.4) 60%,
            rgba(45, 212, 191, 0.15) 100%);
          clip-path: polygon(0% 0%, 100% 0%, 200% 100%, -100% 100%);
          box-shadow: 0 0 35px rgba(45, 212, 191, 0.8);
        }
        
        /* Beam lines effect */
        .beam-lines {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 12px
          );
        }
        
        /* Dust particles animation in the beam */
        .beam-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0, rgba(255, 255, 255, 0) 2px),
            radial-gradient(circle at 40% 70%, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0) 1px),
            radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.3) 0, rgba(255, 255, 255, 0) 2px),
            radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0) 1px),
            radial-gradient(circle at 15% 60%, rgba(255, 255, 255, 0.3) 0, rgba(255, 255, 255, 0) 2px),
            radial-gradient(circle at 90% 85%, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0) 1px);
          background-size: 150px 150px;
          animation: particleMovement 8s linear infinite;
        }
        
        @keyframes particleMovement {
          0% {
            background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 0 150px, 0 150px, 0 150px, 0 150px, 0 150px, 0 150px;
          }
        }
        
        /* Screen texture effect */
        .screen-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
        }
        
        /* Flicker animation */
        @keyframes flicker {
          0%, 100% { opacity: 0.7; }
          10% { opacity: 0.3; }
          30% { opacity: 0.9; }
          50% { opacity: 0.5; }
          70% { opacity: 0.9; }
          90% { opacity: 0.4; }
        }
        
        .flicker-animation {
          animation: flicker 0.6s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
