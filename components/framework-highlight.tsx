"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function FrameworkHighlight() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  })

  return (
    <section
      ref={ref}
      className="relative py-20 bg-gradient-to-b from-[#050818] to-[#0a0e24] overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('/images/subtle-grid.svg')] bg-repeat"></div>
      
      {/* Background glow */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(45, 212, 191, 0.3) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`,
          filter: "blur(100px)",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-[#00E5E0]">Framework</span>
          </h2>
          <p className="text-gray-200 max-w-3xl mx-auto text-base md:text-lg">
            Explore our innovative approach to healthcare AI through interactive animations
            that explain our framework step by step.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Framework Feature 1 */}
          <div className="bg-[#0a1230]/50 border border-blue-500/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00E5E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Data Processing</h3>
            <p className="text-gray-300">
              Our framework starts with advanced data processing techniques that transform raw healthcare data into structured formats.
            </p>
          </div>

          {/* Framework Feature 2 */}
          <div className="bg-[#0a1230]/50 border border-blue-500/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00E5E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Model Training</h3>
            <p className="text-gray-300">
              We use specialized tokenization and fine-tuning techniques to create AI models that understand healthcare context.
            </p>
          </div>

          {/* Framework Feature 3 */}
          <div className="bg-[#0a1230]/50 border border-blue-500/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00E5E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Continuous Learning</h3>
            <p className="text-gray-300">
              Our models continuously improve through feedback loops and real-world healthcare data integration.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-[#000511] font-medium px-8 py-6" asChild>
            <Link href="/framework">
              Explore Interactive Animations <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
