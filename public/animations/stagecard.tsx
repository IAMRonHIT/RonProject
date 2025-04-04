import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card'; // Assuming Shadcn UI Card
import React from 'react';

interface ProcessStageCardProps {
  title: string;
  description: string;
  isActive: boolean;
  icon: React.ReactNode;
}

// Enhanced 3D shadow function with depth layers
const getShadowStyle = (isActive: boolean, isDark: boolean): React.CSSProperties => {
  if (!isActive) return { 
    boxShadow: 'none',
    transform: 'translateZ(0)'
  };

  // Multi-layered shadows for true depth perception
  const primaryColor = isDark
    ? 'rgba(0, 240, 255, 0.2)' // Slightly increased alpha for more presence
    : 'rgba(0, 54, 73, 0.15)';  // Slightly increased alpha
  
  const secondaryColor = isDark
    ? 'rgba(0, 180, 255, 0.1)'
    : 'rgba(0, 30, 60, 0.08)';
    
  const ambientShadow = isDark
    ? 'rgba(0, 0, 0, 0.45)'
    : 'rgba(0, 0, 0, 0.25)';

  return {
    boxShadow: `
      0 10px 30px -5px ${primaryColor}, 
      0 8px 10px -6px ${secondaryColor},
      0 30px 60px -10px ${ambientShadow}
    `,
    transform: 'translateZ(0)', // Establishes 3D context
  };
};

// Enhanced icon background styles with 3D elevation and lighting effects
const getIconBgStyle = (isActive: boolean, isDark: boolean): string => {
    if (!isActive) return 'bg-muted group-hover:bg-muted/80 shadow-sm transform transition-all duration-300 hover:translate-y-[-2px]'; // Added subtle elevation on hover

    // Active state with enhanced 3D visual interest
    if (isDark) {
        // Multi-layered effects: inner glow + outer glow + rim lighting
        return 'bg-[rgba(0,240,255,0.12)] shadow-[0_0_25px_rgba(0,240,255,0.35),inset_0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-inset ring-white/15 transform translate-y-[-3px]';
    } else {
        // Multi-layered effects: inner glow + outer glow + rim lighting
        return 'bg-[rgba(0,54,73,0.12)] shadow-[0_0_25px_rgba(0,54,73,0.25),inset_0_0_15px_rgba(0,54,73,0.1)] ring-1 ring-inset ring-black/10 transform translate-y-[-3px]';
    }
};

export function ProcessStageCard({ title, description, isActive, icon }: ProcessStageCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Enhanced 3D base classes with refined transitions
  const baseClasses = "p-6 transition-all duration-500 ease-out border overflow-hidden relative transform-gpu"; // Added GPU acceleration
  const activeClasses = "scale-[1.05] border-primary/80 translate-y-[-4px]"; // More pronounced elevation
  const inactiveClasses = "scale-100 border-border hover:translate-y-[-2px]"; // Added subtle hover elevation

  // Enhanced background gradients with more sophisticated layering
  const baseGradient = isActive
    ? isDark
      ? 'linear-gradient(145deg, rgba(0, 240, 255, 0.18), rgba(0, 40, 50, 0.38))' // Enhanced active dark
      : 'linear-gradient(145deg, rgba(0, 54, 73, 0.22), rgba(230, 240, 255, 0.55))' // Enhanced active light
    : isDark
      ? 'linear-gradient(145deg, rgba(0, 240, 255, 0.08), rgba(10, 15, 25, 0.3))' // Subtle inactive dark
      : 'linear-gradient(145deg, rgba(0, 54, 73, 0.06), rgba(250, 250, 255, 0.3))'; // Subtle inactive light

  // Enhanced shine effect with more sophisticated light interaction
  const shineGradient = isActive
    ? `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.12 : 0.2}) 0%, rgba(255,255,255, 0) 60%)`
    : `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.08 : 0.15}) 0%, rgba(255,255,255, 0) 50%)`;
  
  // Additional depth layer for active cards
  const depthGradient = isActive
    ? isDark
      ? 'radial-gradient(circle at 70% 30%, rgba(0, 240, 255, 0.15) 0%, transparent 70%)'
      : 'radial-gradient(circle at 70% 30%, rgba(0, 54, 73, 0.12) 0%, transparent 70%)'
    : '';

  const backgroundStyle: React.CSSProperties = {
    // Layer multiple gradients for sophisticated lighting effect
    background: depthGradient 
      ? `${shineGradient}, ${depthGradient}, ${baseGradient}`
      : `${shineGradient}, ${baseGradient}`,
    // Add subtle texture for more visual richness
    backgroundBlendMode: 'overlay, normal, normal',
  };

  return (
    <Card
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} group hover:scale-[1.03] hover:border-primary/60 perspective-1000`} // Added perspective for 3D context
      style={{
        ...backgroundStyle,
        ...getShadowStyle(isActive, isDark),
      }}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Enhanced shine effect with controlled positioning */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Edge highlight for 3D effect */}
      <div className="absolute inset-0 rounded-lg border-t border-l border-white/10 pointer-events-none"></div>
      <div className="absolute inset-0 rounded-lg border-b border-r border-black/10 pointer-events-none"></div>

      <div className="flex flex-col items-center text-center space-y-4 relative z-10 transform-style-preserve-3d"> {/* Added 3D style preservation */}
        <div 
          className={`p-3 rounded-full transition-all duration-500 ease-out transform group-hover:scale-110 ${getIconBgStyle(isActive, isDark)} [transform-style:preserve-3d]`}
        >
           {/* Enhanced icon with 3D transform */}
           <div 
             className={`transition-transform duration-500 ease-in-out ${isActive ? 'scale-115 [transform:translateZ(8px)]' : 'scale-100 [transform:translateZ(0px)]'} group-hover:rotate-3`}
           >
             {icon}
           </div>
        </div>
        <h3 
          className={`text-lg font-semibold transition-colors duration-300 ${isActive ? 'text-primary [transform:translateZ(5px)]' : 'text-card-foreground [transform:translateZ(0px)]'} [transition:transform_0.5s_ease-out]`}
        >
          {title}
        </h3>
        <p 
          className={`text-sm text-muted-foreground ${isActive ? '[transform:translateZ(3px)]' : '[transform:translateZ(0px)]'} [transition:transform_0.5s_ease-out]`}
        >
          {description}
        </p>
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
