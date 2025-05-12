"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const FeatureComparison: React.FC = () => {
  const features = [
    {
      name: "Care Plan Creation Time",
      cpaas: "2-5 minutes",
      traditional: "30-60 minutes",
      highlight: true
    },
    {
      name: "Evidence-Based Content",
      cpaas: true,
      traditional: "Varies by clinician"
    },
    {
      name: "Automatic Documentation",
      cpaas: true,
      traditional: false
    },
    {
      name: "Real-time Updates",
      cpaas: true,
      traditional: false
    },
    {
      name: "Standardized Approach",
      cpaas: true,
      traditional: "Inconsistent"
    },
    {
      name: "Continuous Quality Improvement",
      cpaas: true,
      traditional: false
    },
    {
      name: "Patient-specific Customization",
      cpaas: true,
      traditional: true
    },
    {
      name: "Integration with EHR Systems",
      cpaas: true,
      traditional: "Limited"
    }
  ];

  return (
    <div className="w-full bg-slate-900 py-16 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">
          CPaaS vs. Traditional Care Planning
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-6 py-4 bg-slate-800 rounded-tl-lg text-slate-300 font-medium">Feature</th>
                <th className="px-6 py-4 bg-purple-900/50 text-purple-100 font-semibold">Ron AI CPaaS</th>
                <th className="px-6 py-4 bg-slate-800 rounded-tr-lg text-slate-300 font-medium">Traditional Approach</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/10"}>
                  <td className="text-left px-6 py-4 text-slate-300 border-t border-slate-700">
                    {feature.name}
                  </td>
                  <td className={`px-6 py-4 border-t border-purple-800/30 ${feature.highlight ? "bg-purple-900/20" : ""}`}>
                    {typeof feature.cpaas === 'boolean' ? (
                      feature.cpaas ?
                        <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" /> :
                        <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                    ) : (
                      <span className={`text-center block ${feature.highlight ? "text-purple-300 font-semibold" : "text-slate-300"}`}>
                        {feature.cpaas}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center border-t border-slate-700">
                    {typeof feature.traditional === 'boolean' ? (
                      feature.traditional ?
                        <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" /> :
                        <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                    ) : (
                      <span className="text-slate-400">{feature.traditional}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            With Ron AI's CPaaS, healthcare organizations can dramatically reduce documentation
            time while improving care quality and standardization.
          </p>
          <a
            href="/demo"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all inline-block"
          >
            See the difference in action
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureComparison;