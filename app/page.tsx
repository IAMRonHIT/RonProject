import RonAiHero from "@/components/ron-ai-hero"
import AutoFlipCarousel from "@/components/auto-flip-carousel"
import HealthcareSectorsShowcase from "@/components/healthcare-sectors-showcase"

import ProcessShowcase from '@/components/process-showcase'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050818]">
      <RonAiHero />
      <AutoFlipCarousel />

      <HealthcareSectorsShowcase />
    </main>
  )
}