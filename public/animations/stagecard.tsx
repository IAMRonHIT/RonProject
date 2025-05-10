import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card'; 
import React from 'react';

interface ProcessStageCardProps {
  title: string;
  description: string;
  isActive: boolean;
  icon: React.ReactNode;
}

// Enhanced 3D shadow function with depth layers and glow effects
const getShadowStyle = (isActive: boolean, isDark: boolean): React.CSSProperties => {
  if (!isActive) return { 
    boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.1)',
    transform: 'translateZ(0)'
  };

  // Multi-layered shadows for true depth perception with enhanced glow
  const primaryColor = isDark
    ? 'rgba(0, 240, 255, 0.35)' // Increased glow intensity
    : 'rgba(0, 54, 73, 0.25)';  // Increased glow intensity
  
  const secondaryColor = isDark
    ? 'rgba(0, 180, 255, 0.2)'
    : 'rgba(0, 30, 60, 0.15)';
    
  const ambientShadow = isDark
    ? 'rgba(0, 0, 0, 0.5)'
    : 'rgba(0, 0, 0, 0.3)';
  
  const accentGlow = isDark
    ? 'rgba(56, 189, 248, 0.3)' // Added cyan accent glow
    : 'rgba(14, 165, 233, 0.2)'; // Added blue accent glow

  return {
    boxShadow: `
      0 10px 30px -5px ${primaryColor}, 
      0 8px 10px -6px ${secondaryColor},
      0 30px 60px -10px ${ambientShadow},
      0 0 20px 2px ${accentGlow}
    `,
    transform: 'translateZ(0)', // Establishes 3D context
  };
};

// Enhanced icon background styles with 3D elevation and lighting effects
const getIconBgStyle = (isActive: boolean, isDark: boolean): string => {
    if (!isActive) return 'bg-muted group-hover:bg-muted/80 shadow-sm transform transition-all duration-300 hover:translate-y-[-2px] group-hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]'; 

    // Active state with enhanced 3D visual interest
    if (isDark) {
        // Multi-layered effects: inner glow + outer glow + rim lighting
        return 'bg-[rgba(0,240,255,0.15)] shadow-[0_0_30px_rgba(0,240,255,0.4),inset_0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-inset ring-white/20 transform translate-y-[-4px]';
    } else {
        // Multi-layered effects: inner glow + outer glow + rim lighting
        return 'bg-[rgba(0,54,73,0.15)] shadow-[0_0_30px_rgba(0,54,73,0.3),inset_0_0_20px_rgba(0,54,73,0.15)] ring-1 ring-inset ring-black/10 transform translate-y-[-4px]';
    }
};

export function ProcessStageCard({ title, description, isActive, icon }: ProcessStageCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Enhanced 3D base classes with refined transitions
  const baseClasses = "p-6 transition-all duration-700 ease-out border overflow-hidden relative transform-gpu !h-[180px] w-full flex flex-col"; 
  const activeClasses = "scale-[1.08] border-primary/90 translate-y-[-6px]"; 
  const inactiveClasses = "scale-100 border-border hover:translate-y-[-3px]";

  // Enhanced background gradients with more sophisticated layering
  const baseGradient = isActive
    ? isDark
      ? 'linear-gradient(145deg, rgba(0, 240, 255, 0.22), rgba(0, 40, 50, 0.42))' // Enhanced active dark
      : 'linear-gradient(145deg, rgba(0, 54, 73, 0.25), rgba(230, 240, 255, 0.6))' // Enhanced active light
    : isDark
      ? 'linear-gradient(145deg, rgba(0, 240, 255, 0.1), rgba(10, 15, 25, 0.35))' // Subtle inactive dark
      : 'linear-gradient(145deg, rgba(0, 54, 73, 0.08), rgba(250, 250, 255, 0.35))'; // Subtle inactive light

  // Enhanced shine effect with more sophisticated light interaction
  const shineGradient = isActive
    ? `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.18 : 0.25}) 0%, rgba(255,255,255, 0) 60%)`
    : `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.1 : 0.18}) 0%, rgba(255,255,255, 0) 50%)`;
  
  // Additional depth layer for active cards
  const depthGradient = isActive
    ? isDark
      ? 'radial-gradient(circle at 70% 30%, rgba(0, 240, 255, 0.2) 0%, transparent 70%)'
      : 'radial-gradient(circle at 70% 30%, rgba(0, 54, 73, 0.15) 0%, transparent 70%)'
    : '';

  const backgroundStyle: React.CSSProperties = {
    // Layer multiple gradients for sophisticated lighting effect
    background: depthGradient 
      ? `${shineGradient}, ${depthGradient}, ${baseGradient}`
      : `${shineGradient}, ${baseGradient}`,
    // Add subtle texture for more visual richness
    backgroundBlendMode: 'overlay, normal, normal',
    height: '180px', // Enforce exact height with inline style too
  };

  return (
    <Card
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} group hover:scale-[1.04] hover:border-primary/70 perspective-1000 backdrop-blur-sm`}
      style={{
        ...backgroundStyle,
        ...getShadowStyle(isActive, isDark),
      }}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Enhanced shine effect with controlled positioning */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"></div>
      
      {/* Edge highlight for 3D effect */}
      <div className="absolute inset-0 rounded-lg border-t border-l border-white/15 pointer-events-none"></div>
      <div className="absolute inset-0 rounded-lg border-b border-r border-black/15 pointer-events-none"></div>

      <div className="flex flex-col items-center text-center justify-between h-full relative z-10 transform-style-preserve-3d">
        <div 
          className={`p-3 rounded-full transition-all duration-700 ease-out transform group-hover:scale-110 ${getIconBgStyle(isActive, isDark)} [transform-style:preserve-3d]`}
        >
           {/* Enhanced icon with 3D transform */}
           <div 
             className={`transition-transform duration-700 ease-in-out ${isActive ? 'scale-115 [transform:translateZ(10px)]' : 'scale-100 [transform:translateZ(0px)]'} group-hover:rotate-3`}
           >
             {icon}
           </div>
        </div>
        <div className="flex flex-col items-center">
          <h3 
            className={`text-lg font-semibold transition-colors duration-500 ${isActive ? 'text-primary [transform:translateZ(6px)]' : 'text-card-foreground [transform:translateZ(0px)]'} [transition:transform_0.6s_ease-out] truncate w-full`}
          >
            {title}
          </h3>
          <p 
            className={`text-sm text-muted-foreground mt-1 ${isActive ? '[transform:translateZ(4px)]' : '[transform:translateZ(0px)]'} [transition:transform_0.6s_ease-out] line-clamp-2 w-full h-[40px]`}
          >
            {description}
          </p>
        </div>
        <div className="h-2"></div> {/* Bottom spacer */}
      </div>
      
      {/* Add custom styles for 3D transforms */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </Card>
  );
}