"use client"

import { FrameworkAnimationSequence } from '@/components/framework-animation-sequence'
import { AnimationWrapper } from '@/components/animation-wrapper'

export default function FrameworkPage() {
  return (
    <AnimationWrapper>
      <div className="container mx-auto py-12 pt-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center font-audiowide bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Our Framework</h1>
        <p className="text-lg mb-12 text-center max-w-3xl mx-auto text-blue-100/90">
          A visual explanation of how our framework processes healthcare data and creates efficient AI models.
        </p>

        <FrameworkAnimationSequence />
      </div>
    </AnimationWrapper>
  )
}
