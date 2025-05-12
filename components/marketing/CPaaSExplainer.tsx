"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, LineChart, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CPaaSExplainer: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (stepsRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      }, { threshold: 0.2 });
      
      const steps = stepsRef.current.querySelectorAll('.step-item');
      steps.forEach(step => {
        observerRef.current?.observe(step);
      });
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            Care Plan as a Service
          </span>
        </motion.h1>
        
        <motion.p
          className="text-xl text-slate-300 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Ron AI's CPaaS revolutionizes healthcare delivery with AI-powered care plans that are comprehensive, evidence-based, and instantly generated.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 rounded-lg text-lg font-semibold"
          >
            Request a Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How CPaaS Works
        </h2>
        
        <div ref={stepsRef} className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Input Patient Data",
              description: "Simply provide basic patient information and assessment data through our intuitive interface.",
              icon: <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6"><LineChart className="h-8 w-8 text-blue-400" /></div>,
              delay: 0
            },
            {
              title: "AI-Powered Analysis",
              description: "Our advanced AI analyzes the data using clinical knowledge bases and evidence-based practices.",
              icon: <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6"><Zap className="h-8 w-8 text-indigo-400" /></div>,
              delay: 0.2
            },
            {
              title: "Complete Care Plan Generated",
              description: "Receive a comprehensive care plan with nursing diagnoses, goals, interventions and evaluations.",
              icon: <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6"><Check className="h-8 w-8 text-purple-400" /></div>,
              delay: 0.4
            }
          ].map((step, index) => (
            <div
              key={index}
              className="step-item bg-slate-800 p-8 rounded-xl border border-slate-700 opacity-0 transition-all duration-700 transform translate-y-10"
              style={{transitionDelay: `${step.delay}s`}}
            >
              <div className="flex flex-col items-center text-center">
                {step.icon}
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            The CPaaS Advantage
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Save 90% of Documentation Time",
                description: "Generate comprehensive care plans in seconds instead of hours.",
                icon: <Clock className="h-6 w-6 text-green-400 mr-3" />
              },
              {
                title: "Evidence-Based Care",
                description: "All plans follow latest clinical guidelines and best practices.",
                icon: <Shield className="h-6 w-6 text-green-400 mr-3" />
              },
              {
                title: "Improved Patient Outcomes",
                description: "More thorough plans lead to better coordinated care.",
                icon: <Check className="h-6 w-6 text-green-400 mr-3" />
              },
              {
                title: "Reduced Errors & Omissions",
                description: "AI ensures comprehensive coverage of all care aspects.",
                icon: <Check className="h-6 w-6 text-green-400 mr-3" />
              },
              {
                title: "Seamless EHR Integration",
                description: "Works with your existing systems and workflows.",
                icon: <Check className="h-6 w-6 text-green-400 mr-3" />
              },
              {
                title: "Regulatory Compliance",
                description: "Meets documentation requirements for accreditation.",
                icon: <Check className="h-6 w-6 text-green-400 mr-3" />
              }
            ].map((benefit, index) => (
              <div key={index} className="flex items-start p-6 bg-slate-800 rounded-lg border border-slate-700">
                {benefit.icon}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-slate-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-10 rounded-2xl border border-blue-700/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Care Planning?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join healthcare organizations that have reduced documentation time by 90% while improving care quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8"
            >
              Request a Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-500 text-slate-200 hover:bg-slate-800"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CPaaSExplainer;