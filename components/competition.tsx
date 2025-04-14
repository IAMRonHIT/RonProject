'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

// Define the structure for a competitor
interface Competitor {
  key: string; // Corresponds to keys in FeatureData
  name: string; // Display name for the header
  logo?: string; // Optional logo path
}

// Define the structure for feature data row
interface FeatureData {
  feature: string;
  description?: string; // Optional detailed description for tooltips
  category?: string; // Optional category for grouping
  [key: string]: boolean | string | undefined; // Allows competitor keys (boolean) and feature/description (string)
}

// Define props for the component
interface CompetitionMatrixProps {
  title?: string;
  description?: string;
  className?: string;
}

// --- Data Definition ---

// Define the competitors in the desired column order
// Ron AI is first to match the desired visual order
const competitors: Competitor[] = [
  { key: 'ron_ai', name: 'Ron AI' },
  { key: 'nuance', name: 'Nuance (DAX)' },
  { key: 'cohere', name: 'Cohere' },
  { key: 'mcg', name: 'MCG' },
  { key: 'interqual', name: 'InterQual' },
  { key: 'qventus', name: 'Qventus' },
  { key: 'suki', name: 'Suki' },
  { key: 'abridge', name: 'Abridge' },
  { key: 'salesforce', name: 'Salesforce' },
];

// Define the features and their status for each competitor with descriptions
const features: FeatureData[] = [
  { 
    feature: 'Advanced Hallucination Mitigation', 
    description: 'Sophisticated algorithms that dramatically reduce false or misleading AI-generated content',
    category: 'Core Technology', 
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Proactive Care Planning', 
    description: 'AI-driven suggestions for preventative care and early interventions',
    category: 'Clinical Capabilities',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Proactive Prior Authorization', 
    description: 'Automatic identification and initiation of authorization processes',
    category: 'Administrative Features',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Deep API/QHIN Integration',
    description: 'Seamless connectivity with healthcare information networks and third-party systems',
    category: 'Integration Capabilities', 
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Built-in CMS Rule Compliance Focus', 
    description: 'Automated adherence to Centers for Medicare & Medicaid Services regulations',
    category: 'Regulatory Compliance',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Multi-Agent Architecture', 
    description: 'Coordinated AI agents that specialize in different healthcare domains',
    category: 'Core Technology',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Client-Specific Fine-Tuning', 
    description: 'AI models customized for individual healthcare organization needs',
    category: 'Customization',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'Provides Foundational LLM', 
    description: 'Base large language model capabilities for text generation',
    category: 'Core Technology',
    ron_ai: true, nuance: true, cohere: true, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: true 
  },
  { 
    feature: 'Provides Clinical Guidelines', 
    description: 'Standardized protocols for treatment and care',
    category: 'Clinical Capabilities',
    ron_ai: true, nuance: false, cohere: false, mcg: true, interqual: true, qventus: false, suki: false, abridge: false, salesforce: false 
  },
  { 
    feature: 'CRM / Patient Engagement Focus', 
    description: 'Tools for managing patient relationships and communications',
    category: 'Patient Management',
    ron_ai: true, nuance: false, cohere: false, mcg: false, interqual: false, qventus: false, suki: false, abridge: false, salesforce: true 
  },
  { 
    feature: 'Focus on Reactive Documentation / Scribing', 
    description: 'Traditional approach focused on transcribing and documenting after care',
    category: 'Documentation',
    ron_ai: false, nuance: true, cohere: false, mcg: false, interqual: false, qventus: false, suki: true, abridge: true, salesforce: false 
  },
];

// --- React Component ---

const CompetitionMatrix: React.FC<CompetitionMatrixProps> = ({
  title = "The Ron AI Advantage",
  description,
  className = ""
}) => {
  // State for tracking visible rows (for animation)
  const [visibleRows, setVisibleRows] = useState(0);
  
  // Animation timing effect
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleRows(prev => {
        if (prev < features.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 150); // Reveal a new row every 150ms
    
    return () => clearInterval(timer);
  }, []);

  // Calculate the number of "yes" features for Ron AI
  const ronAiAdvantageCount = features.filter(f => f.ron_ai === true).length;
  
  return (
    <div className={`relative py-8 ${className}`}>
      {/* Background with circuit pattern and gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div 
          className="w-full h-full bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/circuit-pattern.png')" }} 
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#050818] to-[#050818] opacity-70" />
      
      {/* Content container */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-transparent bg-clip-text mb-4">
            {title}
          </h2>
          
          {description && (
            <p className="text-[#94a3b8] max-w-3xl mx-auto text-lg">
              {description}
            </p>
          )}
          
          <motion.div 
            className="mt-6 inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-[#06b6d4]/20 to-[#3b82f6]/20 border border-[#06b6d4]/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-[#06b6d4] mr-2 font-bold">{ronAiAdvantageCount}</span>
            <span className="text-white">unique advantages over competitors</span>
          </motion.div>
        </motion.div>
        
        {/* Table Container with glass effect */}
        <motion.div 
          className="backdrop-blur-sm bg-[#050818]/80 border border-[#1e293b] shadow-2xl shadow-[#06b6d4]/10 rounded-2xl overflow-hidden mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Responsive Wrapper */}
          <div className="overflow-x-auto custom-scrollbar">
            {/* Table */}
            <table className="w-full min-w-[1000px]">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[#1e293b]">
                  {/* Feature Column Header */}
                  <th className="bg-[#0f172a] text-white p-4 text-sm font-semibold text-left sticky left-0 z-10">
                    <span className="text-[#94a3b8]">Feature / Capability</span>
                  </th>
                  
                  {/* Competitor Column Headers */}
                  {competitors.map((competitor, index) => (
                    <th
                      key={competitor.key}
                      className={`bg-[#0f172a] text-white p-4 text-center whitespace-nowrap ${
                        index === 0 ? 'border-b-2 border-[#06b6d4]' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        {index === 0 && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]"></div>
                        )}
                        <span className={`font-bold text-sm ${index === 0 ? 'text-[#06b6d4]' : 'text-white'}`}>
                          {competitor.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {features.map((featureRow, rowIndex) => (
                  <motion.tr
                    key={featureRow.feature}
                    className={`
                      ${rowIndex % 2 === 0 ? 'bg-[#0f172a]/70' : 'bg-[#1e293b]/40'} 
                      hover:bg-[#1e293b]/80 transition-colors duration-150
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: rowIndex < visibleRows ? 1 : 0, 
                      x: rowIndex < visibleRows ? 0 : -20 
                    }}
                    transition={{ duration: 0.4, delay: rowIndex * 0.1 }}
                  >
                    {/* Feature Name Cell with Tooltip */}
                    <td className="p-4 font-medium text-gray-100 sticky left-0 z-10 backdrop-blur-sm bg-opacity-90"
                        style={{ backgroundColor: rowIndex % 2 === 0 ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.95)' }}
                    >
                      <div className="flex items-center gap-2">
                        {featureRow.description ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center cursor-help">
                                  <span>{featureRow.feature}</span>
                                  <span className="ml-1 text-xs text-[#94a3b8]">ⓘ</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{featureRow.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          featureRow.feature
                        )}
                      </div>
                      
                      {featureRow.category && (
                        <span className="text-xs text-[#94a3b8] block mt-1">
                          {featureRow.category}
                        </span>
                      )}
                    </td>
                    
                    {/* Competitor Icon Cells */}
                    {competitors.map((competitor, competitorIndex) => (
                      <td
                        key={`${featureRow.feature}-${competitor.key}`}
                        className={`p-4 text-center relative ${
                          competitorIndex === 0 && featureRow[competitor.key] ? 'bg-[#06b6d4]/10' : ''
                        }`}
                      >
                        {/* Highlight for Ron AI advantages */}
                        {competitorIndex === 0 && featureRow[competitor.key] === true && (
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/5 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: rowIndex * 0.1 + 0.3, duration: 0.8 }}
                          />
                        )}
                        
                        {/* Conditionally render check or thumbs down icon */}
                        <motion.div 
                          className="relative z-10"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: rowIndex < visibleRows ? 1 : 0,
                            opacity: rowIndex < visibleRows ? 1 : 0 
                          }}
                          transition={{ delay: rowIndex * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                        >
                          {featureRow[competitor.key] ? (
                            <div className="relative flex items-center justify-center">
                              <div className="absolute -inset-3 bg-[#06b6d4]/20 rounded-full blur-md opacity-70" />
                              <Image
                                src="/images/Ice_Check.png"
                                alt="Feature present"
                                width={28}
                                height={28}
                                className="relative mx-auto drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                              />
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <div className="absolute -inset-3 bg-[#f43f5e]/10 rounded-full blur-md opacity-50" />
                              <Image
                                src="/images/Icy_Thumb.png"
                                alt="Feature absent"
                                width={24}
                                height={24}
                                className="mx-auto opacity-70 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]"
                              />
                            </div>
                          )}
                        </motion.div>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Legend with animated entrance */}
        <motion.div 
          className="text-center text-[#94a3b8] text-sm mt-6 max-w-4xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center">
              <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
                <div className="absolute -inset-1 bg-[#06b6d4]/20 rounded-full blur-sm opacity-70" />
                <Image
                  src="/images/Ice_Check.png"
                  alt="Yes Icon"
                  width={20}
                  height={20}
                  className="relative drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
              </div>
              <span>Feature Present/Focus Area</span>
            </div>
            <div className="flex items-center">
              <div className="relative w-6 h-6 mr-2 flex items-center justify-center">
                <div className="absolute -inset-1 bg-[#f43f5e]/10 rounded-full blur-sm opacity-50" />
                <Image
                  src="/images/Icy_Thumb.png"
                  alt="No Icon"
                  width={18}
                  height={18}
                  className="relative opacity-70 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]"
                />
              </div>
              <span>Feature Absent/Not Primary Focus</span>
            </div>
          </div>
          <p className="mt-3 text-xs opacity-70">
            Based on market research and publicly available information. Competitor evaluation reflects general market positioning and focus areas.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionMatrix;
