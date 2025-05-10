import RonAiHero from "@/components/ron-ai-hero"
import AutoFlipCarousel from "@/components/auto-flip-carousel"
import HealthcareSectorsShowcase from "@/components/healthcare-sectors-showcase"
import FrameworkHighlight from "@/components/framework-highlight"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050818]">
      <RonAiHero />
      <AutoFlipCarousel />
      <FrameworkHighlight />
      <HealthcareSectorsShowcase />
    </main>
  )
}
