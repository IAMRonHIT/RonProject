import React from 'react';
import { useTheme } from 'next-themes';

export function ContinuousLearningAnimation() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`w-full h-[600px] rounded-lg flex items-center justify-center ${isDark ? 'bg-[#050810]' : 'bg-[#f8faff]'}`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Continuous Learning Animation
        </h2>
        <p className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>
          This is a placeholder for the continuous learning animation.
        </p>
      </div>
    </div>
  );
}
