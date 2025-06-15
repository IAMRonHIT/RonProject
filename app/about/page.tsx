'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CompetitionMatrix from '@/components/competition';
import TeamProjector from '@/components/team-projector';
import Image from 'next/image';
// StreamlitIde removed - only needed on home page
// Removing the import for monaco-ide-section as it doesn't exist as a module

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with animated gradient background */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        {/* Background with circuit pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div 
            className="w-full h-full bg-cover bg-center bg-circuit-pattern" 
          />
        </div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-90" />
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-[#06b6d4] opacity-10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[#3b82f6] opacity-10 blur-3xl rounded-full animate-pulse animation-delay-1s" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-transparent bg-clip-text">
                About Ron AI
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Revolutionizing healthcare with proactive intelligence that works alongside clinicians to enhance patient outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-transparent bg-clip-text">Our Mission</h2>
              <p className="text-[#94a3b8] mb-6">
                At Ron AI, we're transforming healthcare by creating intelligent systems that understand the complete patient story. We blend advanced AI with deep clinical expertise to develop tools that anticipate needs rather than simply react to them.
              </p>
              <p className="text-[#94a3b8]">
                Our multi-agent architecture creates a framework that's focused on proactive care planning, streamlined administrative workflows, and meaningful integration with healthcare systems across the ecosystem.
              </p>
            </motion.div>
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#06b6d4]/20 to-[#3b82f6]/20 rounded-3xl blur-md" />
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#1e293b] bg-[#0f172a]/70 backdrop-blur-sm">
                <Image
                  src="/images/tech-diagram.png"
                  alt="Ron AI Technology Framework"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Ron AI Section with competitive advantage */}
      <section className="py-16">
        {/* Competition Matrix Component */}
        <div className="container mx-auto px-4 md:px-6">
          <CompetitionMatrix 
            title="The Ron AI Difference"
            description="While others focus on reactive documentation, Ron AI leads with proactive intelligence that transforms healthcare workflows. Our advanced hallucination mitigation, deep integration capabilities, and multi-agent architecture create a system that doesn't just record healthcare - it enhances it."
            className="mt-2 mb-20" 
          />
        </div>
      </section>

      {/* Our Values Section with icons */}
      <section className="py-16 bg-[#0f172a]">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-transparent bg-clip-text">
              Our Core Values
            </h2>
            <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">
              The principles that drive every feature we build and every solution we deliver.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <motion.div 
              className="bg-[#050818]/70 backdrop-blur-sm p-8 rounded-2xl border border-[#1e293b] relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06b6d4] to-transparent" />
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
                  <Image 
                    src="/images/proactive-glow.svg" 
                    alt="Proactive icon" 
                    width={40} 
                    height={40} 
                    className="text-[#06b6d4] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse-slow" 
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Proactive</h3>
              <p className="text-[#94a3b8]">
                We anticipate needs rather than simply reacting to them, ensuring clinicians can stay ahead of critical care decisions.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div 
              className="bg-[#050818]/70 backdrop-blur-sm p-8 rounded-2xl border border-[#1e293b] relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06b6d4] to-transparent" />
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
                  <Image 
                    src="/images/interop-glow.svg" 
                    alt="Integration icon" 
                    width={40} 
                    height={40} 
                    className="text-[#06b6d4] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse-slow" 
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Integrative</h3>
              <p className="text-[#94a3b8]">
                Our systems seamlessly connect with existing healthcare infrastructure, enhancing workflows without disrupting them.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div 
              className="bg-[#050818]/70 backdrop-blur-sm p-8 rounded-2xl border border-[#1e293b] relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06b6d4] to-transparent" />
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-[#06b6d4]/10 flex items-center justify-center">
                  <Image 
                    src="/images/communication-glow.svg" 
                    alt="Collaborative icon" 
                    width={40} 
                    height={40} 
                    className="text-[#06b6d4] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse-slow" 
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Collaborative</h3>
              <p className="text-[#94a3b8]">
                We build AI that works alongside healthcare professionals, augmenting their capabilities rather than replacing their expertise.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section with Projector Effect */}
      <TeamProjector />
    </main>
  );
}
