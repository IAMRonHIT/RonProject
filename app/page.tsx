// Update the import to use the new component
import InteractiveIdeSection from "@/components/interactive-ide-section"
import RonAiHero from "@/components/ron-ai-hero"
import AutoFlipCarousel from "@/components/auto-flip-carousel"
import HealthcareSectorsShowcase from "@/components/healthcare-sectors-showcase"
import FrameworkHighlight from "@/components/framework-highlight"
import { ProcessShowcase } from "@/components/process-showcase"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050818]">
      <RonAiHero />
      <AutoFlipCarousel />
      <FrameworkHighlight />
      
      {/* Process Showcase Section */}
      <section className="py-16 bg-gradient-to-b from-[#050818] to-[#070b20]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">The Ron AI Process</h2>
            <p className="text-xl text-blue-100/80">
              Understanding how our AI framework transforms healthcare data into actionable insights
            </p>
          </div>
          <ProcessShowcase />
        </div>
      </section>
      
      <HealthcareSectorsShowcase />
      <InteractiveIdeSection />
    </main>
  )
}
