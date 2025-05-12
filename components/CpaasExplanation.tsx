"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Zap, Lightbulb, CheckCircle } from 'lucide-react'; // Example icons

interface CpaasExplanationProps {
  // Props can be added here if needed in the future
}

const CpaasExplanation: React.FC<CpaasExplanationProps> = () => {
  // Placeholder content - please replace with your actual definition and benefits of CPaaS.
  const cpaasTitle = "Understanding CPaaS: Care Platform as a Service";
  const cpaasIntroduction = "CPaaS (Care Platform as a Service) by Ron AI represents a paradigm shift in how healthcare solutions are developed and deployed. It provides a robust, scalable, and intelligent foundation for building next-generation care applications.";
  
  const cpaasKeyFeatures = [
    {
      icon: <Layers size={24} className="text-sky-400" />,
      title: "Modular Architecture",
      description: "Build with flexible modules that adapt to your specific healthcare workflows and needs."
    },
    {
      icon: <Zap size={24} className="text-amber-400" />,
      title: "AI-Powered Insights",
      description: "Leverage cutting-edge AI, like Perplexity Sonar, for advanced reasoning, decision support, and care plan generation."
    },
    {
      icon: <Lightbulb size={24} className="text-lime-400" />,
      title: "Rapid Development & Deployment",
      description: "Accelerate your time-to-market with pre-built components and a streamlined development process."
    },
    {
      icon: <CheckCircle size={24} className="text-emerald-400" />,
      title: "Scalable & Secure",
      description: "Ensure your applications are built on a reliable, secure, and scalable infrastructure."
    }
  ];

  return (
    <Card className="shadow-xl border border-slate-700 bg-slate-800 text-slate-100 w-full max-w-3xl mx-auto my-8">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Layers size={32} className="text-sky-500" />
          <CardTitle className="text-2xl font-semibold text-slate-50">{cpaasTitle}</CardTitle>
        </div>
        <p className="text-sm text-slate-400 pt-2">
          {/* Optional: Add a subtitle or a brief tagline here */}
          Empowering the future of intelligent healthcare.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-6 text-slate-300 leading-relaxed">
          {cpaasIntroduction}
        </p>
        
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Key Pillars of Our CPaaS:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cpaasKeyFeatures.map((feature, index) => (
            <div key={index} className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">{feature.title}</h4>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-slate-400 italic">
            {/* Placeholder for a call to action or further information */}
            Discover how Ron AI's CPaaS can transform your healthcare solutions.
          </p>
          {/* You might want to add a button here later, e.g., <Button>Learn More</Button> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default CpaasExplanation;