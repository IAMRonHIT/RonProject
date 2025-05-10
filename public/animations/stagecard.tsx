import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card'; 
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProcessStageCardProps {
  title: string;
  description: string;
  isActive: boolean;
  icon: React.ReactNode;
  color?: string; // Optional color prop for customizing card colors
}

// Enhanced 3D shadow function with dynamic color support and improved glow effects
const getShadowStyle = (isActive: boolean, isDark: boolean, customColor?: string): React.CSSProperties => {
  if (!isActive) return { 
    boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.1)',
    transform: 'translateZ(0)'
  };

  // Use custom color or default
  const baseColor = customColor || (isDark ? '0, 240, 255' : '0, 54, 73');
  
  // Multi-layered shadows for true depth perception with enhanced glow
  const primaryColor = `rgba(${baseColor}, ${isDark ? 0.45 : 0.35})`;
  const secondaryColor = `rgba(${baseColor}, ${isDark ? 0.25 : 0.2})`;
  const ambientShadow = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.35)';
  const accentGlow = `rgba(${baseColor}, ${isDark ? 0.4 : 0.3})`;

  return {
    boxShadow: `
      0 10px 30px -5px ${primaryColor}, 
      0 8px 10px -6px ${secondaryColor},
      0 30px 60px -10px ${ambientShadow},
      0 0 25px 3px ${accentGlow}
    `,
    transform: 'translateZ(0)', // Establishes 3D context
  };
};

// Enhanced icon background styles with custom color support
const getIconBgStyle = (isActive: boolean, isDark: boolean, customColor?: string): string => {
  // Extract RGB components from customColor or use defaults
  const baseColor = customColor || (isDark ? '0, 240, 255' : '0, 54, 73');
  
  if (!isActive) {
    return `bg-muted/80 shadow-sm transform transition-all duration-300 
    hover:translate-y-[-2px] group-hover:shadow-[0_0_20px_rgba(${baseColor},0.3)]`; 
  }

  // Active state with enhanced 3D visual interest using the custom color
  if (isDark) {
    return `bg-[rgba(${baseColor},0.2)] shadow-[0_0_35px_rgba(${baseColor},0.5),inset_0_0_25px_rgba(${baseColor},0.25)] 
    ring-1 ring-inset ring-white/25 transform translate-y-[-4px]`;
  } else {
    return `bg-[rgba(${baseColor},0.2)] shadow-[0_0_35px_rgba(${baseColor},0.4),inset_0_0_25px_rgba(${baseColor},0.2)] 
    ring-1 ring-inset ring-black/10 transform translate-y-[-4px]`;
  }
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return as RGB string
  return `${r}, ${g}, ${b}`;
};

export function ProcessStageCard({ title, description, isActive, icon, color }: ProcessStageCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [rgbColor, setRgbColor] = useState<string | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);
  
  // Convert hex color to RGB format if provided
  useEffect(() => {
    if (color && color.startsWith('#')) {
      setRgbColor(hexToRgb(color));
    } else if (color && color.startsWith('rgb')) {
      // Extract RGB values from rgb() format
      const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        setRgbColor(`${match[1]}, ${match[2]}, ${match[3]}`);
      }
    } else if (color) {
      // For named colors or other formats, we'll use the original color
      setRgbColor(color);
    }
  }, [color]);

  // Enhanced 3D base classes with dynamic transitions
  const baseClasses = "p-6 transition-all duration-700 ease-out border overflow-hidden relative transform-gpu !h-[180px] w-full flex flex-col"; 
  const activeClasses = "scale-[1.08] border-primary/90 translate-y-[-6px]"; 
  const inactiveClasses = "scale-100 border-border hover:translate-y-[-3px]";

  // Dynamic gradient based on the provided color or default
  const getGradients = () => {
    const colorBase = rgbColor || (isDark ? '0, 240, 255' : '0, 54, 73');
    
    // Enhanced background gradients with custom color
    const baseGradient = isActive
      ? isDark
        ? `linear-gradient(145deg, rgba(${colorBase}, 0.25), rgba(0, 40, 50, 0.45))`
        : `linear-gradient(145deg, rgba(${colorBase}, 0.3), rgba(230, 240, 255, 0.65))`
      : isDark
        ? `linear-gradient(145deg, rgba(${colorBase}, 0.12), rgba(10, 15, 25, 0.4))`
        : `linear-gradient(145deg, rgba(${colorBase}, 0.1), rgba(250, 250, 255, 0.4))`;

    // Enhanced shine effect with custom color
    const shineGradient = isActive
      ? `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.22 : 0.28}) 0%, rgba(255,255,255, 0) 60%)`
      : `linear-gradient(110deg, rgba(255,255,255, ${isDark ? 0.12 : 0.2}) 0%, rgba(255,255,255, 0) 50%)`;
    
    // Additional depth layer with custom color
    const depthGradient = isActive
      ? isDark
        ? `radial-gradient(circle at 70% 30%, rgba(${colorBase}, 0.25) 0%, transparent 70%)`
        : `radial-gradient(circle at 70% 30%, rgba(${colorBase}, 0.2) 0%, transparent 70%)`
      : '';
      
    return { baseGradient, shineGradient, depthGradient };
  };
  
  const { baseGradient, shineGradient, depthGradient } = getGradients();

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
    <motion.div
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated glow effect behind card - only shows on hover or active */}
      {(isActive || isHovered) && (
        <motion.div 
          className="absolute -inset-2 rounded-xl opacity-0 z-0 blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 0.7 : isHovered ? 0.5 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            background: rgbColor 
              ? `radial-gradient(circle, rgba(${rgbColor}, ${isDark ? 0.4 : 0.3}) 0%, rgba(${rgbColor}, 0) 70%)`
              : `radial-gradient(circle, rgba(56, 189, 248, ${isDark ? 0.4 : 0.3}) 0%, rgba(56, 189, 248, 0) 70%)`
          }}
        />
      )}
      
      <Card
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} group hover:scale-[1.04] hover:border-primary/70 perspective-1000 backdrop-blur-sm`}
        style={{
          ...backgroundStyle,
          ...getShadowStyle(isActive, isDark, rgbColor),
          borderColor: isActive && rgbColor ? `rgba(${rgbColor}, 0.5)` : undefined
        }}
        aria-current={isActive ? 'step' : undefined}
      >
        {/* Enhanced shine effect with controlled positioning */}
        <motion.div 
          className="absolute inset-0 rounded-lg bg-gradient-to-tl from-transparent via-white/15 to-transparent opacity-0 pointer-events-none"
          animate={{ 
            opacity: isHovered ? 0.9 : isActive ? 0.7 : 0 
          }}
          transition={{ duration: 0.7 }}
        />
        
        {/* Edge highlight for 3D effect */}
        <div className="absolute inset-0 rounded-lg border-t border-l border-white/15 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-lg border-b border-r border-black/15 pointer-events-none"></div>

        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {isActive && (
            <motion.div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: rgbColor 
                  ? `radial-gradient(circle at 30% 70%, rgba(${rgbColor}, 0.6) 0%, transparent 60%)`
                  : 'radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.6) 0%, transparent 60%)',
                backgroundSize: '120% 120%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          )}
        </div>

        <div className="flex flex-col items-center text-center justify-between h-full relative z-10 transform-style-preserve-3d">
          <motion.div 
            className={`p-3 rounded-full transition-all duration-700 ease-out transform group-hover:scale-110 ${getIconBgStyle(isActive, isDark, rgbColor)} [transform-style:preserve-3d]`}
            animate={{ 
              y: isActive ? [0, -4, 0] : 0,
              rotateY: isActive ? [0, 10, 0, -10, 0] : 0
            }}
            transition={{ 
              y: { duration: 3, repeat: Infinity, repeatType: "reverse" },
              rotateY: { duration: 6, repeat: Infinity, repeatType: "reverse" }
            }}
          >
             <motion.div 
               className={`transition-transform duration-700 ease-in-out ${isActive ? 'scale-115 [transform:translateZ(10px)]' : 'scale-100 [transform:translateZ(0px)]'} group-hover:rotate-3`}
               animate={{ 
                 rotate: isActive ? [0, 5, 0, -5, 0] : 0 
               }}
               transition={{ 
                 rotate: { 
                   duration: 6, 
                   repeat: Infinity,
                   repeatType: "reverse",
                   ease: "easeInOut" 
                 }
               }}
             >
               {icon}
             </motion.div>
          </motion.div>
          
          <div className="flex flex-col items-center">
            <motion.h3 
              className={`text-lg font-semibold transition-colors duration-500 ${isActive ? '[transform:translateZ(6px)]' : '[transform:translateZ(0px)]'} [transition:transform_0.6s_ease-out] truncate w-full`}
              style={{ 
                color: isActive && rgbColor ? `rgb(${rgbColor})` : isActive ? 'rgb(56, 189, 248)' : undefined
              }}
              animate={{ 
                textShadow: isActive 
                  ? ["0 0 0px rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.3)", "0 0 0px rgba(255,255,255,0)"] 
                  : "none"
              }}
              transition={{ 
                textShadow: { duration: 3, repeat: Infinity }
              }}
            >
              {title}
            </motion.h3>
            
            <motion.p 
              className={`text-sm text-muted-foreground mt-1 ${isActive ? '[transform:translateZ(4px)]' : '[transform:translateZ(0px)]'} [transition:transform_0.6s_ease-out] line-clamp-2 w-full h-[40px]`}
              animate={{ 
                opacity: isActive ? [0.9, 1, 0.9] : 0.9
              }}
              transition={{ 
                opacity: { duration: 4, repeat: Infinity, repeatType: "reverse" }
              }}
            >
              {description}
            </motion.p>
          </div>
          
          <div className="h-2"></div> {/* Bottom spacer */}
          
          {/* Extra highlight effect that appears on active/hover */}
          {isActive && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0"
              style={{
                background: rgbColor 
                  ? `linear-gradient(to right, transparent, rgba(${rgbColor}, 0.8), transparent)`
                  : 'linear-gradient(to right, transparent, rgba(56, 189, 248, 0.8), transparent)'
              }}
              initial={{ opacity: 0, width: "0%" }}
              animate={{ 
                opacity: 1,
                width: ["0%", "100%", "0%"]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
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
    </motion.div>
  );
}