// Update the import to use the correct component name
// import HowWeDoItSection from "@/components/interactive-ide-section" // Original deleted import
import StreamlitIde from "@/components/streamlit-ide"; // Import the new IDE
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
      {/* <HowWeDoItSection /> */}{/* Use the new Streamlit IDE Component */}
      <StreamlitIde />
    </main>
  )
}
