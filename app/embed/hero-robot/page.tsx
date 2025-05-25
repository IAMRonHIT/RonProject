// app/embed/hero-robot/page.tsx
import RonAiHero from '@/components/ron-ai-hero'; // Adjust path if necessary
import '@/app/globals.css'; // Include global styles if RonAiHero depends on them

export default function EmbedHeroRobotPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
      <RonAiHero />
    </div>
  );
}
