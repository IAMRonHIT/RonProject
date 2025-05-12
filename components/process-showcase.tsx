"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ProcessShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  })

  const processSteps = [
    {
      title: "Data Ingestion",
      description: "Our system securely processes and standardizes healthcare data from diverse sources.",
      icon: "🔍",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Context Understanding",
      description: "Specialized models interpret complex medical terminology and clinical contexts.",
      icon: "🧠",
      color: "from-purple-500 to-pink-400"
    },
    {
      title: "Intelligent Analysis",
      description: "Advanced algorithms identify patterns and insights across patient data.",
      icon: "📊",
      color: "from-teal-500 to-green-400"
    },
    {
      title: "Knowledge Integration",
      description: "Continuously updated with the latest medical research and guidelines.",
      icon: "📚",
      color: "from-amber-500 to-orange-400"
    },
    {
      title: "Clinical Decision Support",
      description: "Providing actionable insights to improve patient care and outcomes.",
      icon: "💡",
      color: "from-red-500 to-pink-400"
    },
    {
      title: "Continuous Learning",
      description: "Systems that evolve with feedback and real-world clinical applications.",
      icon: "🔄",
      color: "from-indigo-500 to-blue-400"
    }
  ]

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-[#0a0e24] to-[#050818] overflow-hidden"
    >
      {/* Background effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.3),transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center font-audiowide bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            Our Process
          </h2>
          <p className="text-base md:text-lg text-blue-100/90 max-w-3xl mx-auto">
            How we transform healthcare data into meaningful insights through our multi-stage AI process
          </p>
        </motion.div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
            >
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-xl bg-gradient-to-br ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-gray-300 mb-3">{step.description}</p>
              
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]" asChild>
            <Link href="/framework">
              Explore Our Framework <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}