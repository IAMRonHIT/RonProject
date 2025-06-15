'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Spotlight } from "@/components/ui/spotlight";
import Image from 'next/image';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 from-blue-400/20 via-blue-500/20 to-cyan-400/20" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-audiowide text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto text-slate-600">
            Let us show you how Ron AI can transform your healthcare operations
          </p>
        </div>
        <div className="absolute inset-0 z-0">
          <Image src="/images/circuit-pattern.png" alt="Circuit Pattern" fill className="object-cover opacity-20" />
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form - Takes up 2/3 on desktop */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            
            {/* Contact Info - Takes up 1/3 on desktop */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10 opacity-30" />
      </section>
    </main>
  );
}

function ContactForm() {
  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
    requestDemo: false
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real implementation, you would send this data to your backend
      // For now, simulate a successful submission after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        message: '',
        requestDemo: false
      });
      
      // Reset success state after a delay
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('There was a problem submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animations
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const inputAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.1 * custom } 
    })
  };
  
  return (
    <motion.div 
      className="bg-[#0a0e24] rounded-2xl p-8 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={formAnimation}
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-100">Send Us a Message</h2>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-cyan-500/30">
          <p className="text-cyan-300">Thank you for your message! We'll get back to you shortly.</p>
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-red-300">{submitError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name */}
          <motion.div custom={1} variants={inputAnimation}>
            <label htmlFor="name" className="block text-blue-200 mb-2 text-sm">
              Name <span className="text-cyan-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#070d1d] border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="Your name"
            />
          </motion.div>
          
          {/* Email */}
          <motion.div custom={2} variants={inputAnimation}>
            <label htmlFor="email" className="block text-blue-200 mb-2 text-sm">
              Email <span className="text-cyan-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#070d1d] border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="your.email@example.com"
            />
          </motion.div>
          
          {/* Company */}
          <motion.div custom={3} variants={inputAnimation}>
            <label htmlFor="company" className="block text-blue-200 mb-2 text-sm">
              Company/Organization
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#070d1d] border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="Your organization"
            />
          </motion.div>
          
          {/* Role */}
          <motion.div custom={4} variants={inputAnimation}>
            <label htmlFor="role" className="block text-blue-200 mb-2 text-sm">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#070d1d] border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#070d1d]">Select your role</option>
              <option value="Clinician" className="bg-[#070d1d]">Clinician</option>
              <option value="Administrator" className="bg-[#070d1d]">Administrator</option>
              <option value="IT Professional" className="bg-[#070d1d]">IT Professional</option>
              <option value="Executive" className="bg-[#070d1d]">Executive</option>
              <option value="Other" className="bg-[#070d1d]">Other</option>
            </select>
          </motion.div>
        </div>
        
        {/* Message */}
        <motion.div className="mb-6" custom={5} variants={inputAnimation}>
          <label htmlFor="message" className="block text-blue-200 mb-2 text-sm">
            Message <span className="text-cyan-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#070d1d] border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
            placeholder="How can we help you?"
          ></textarea>
        </motion.div>
        
        {/* Demo Request Checkbox */}
        <motion.div className="mb-8" custom={6} variants={inputAnimation}>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              name="requestDemo"
              checked={formData.requestDemo}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-blue-500 rounded border-blue-900/50 bg-[#070d1d] focus:ring-blue-500/40 focus:ring-offset-0"
            />
            <span className="text-blue-100/90 group-hover:text-blue-100">I'd like to request a product demo</span>
          </label>
        </motion.div>
        
        {/* Submit Button */}
        <motion.div custom={7} variants={inputAnimation}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Send Message
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}

function ContactInfo() {
  const contactAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, delay: 0.2 }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, delay: 0.3 + (0.1 * custom) } 
    })
  };
  
  return (
    <motion.div 
      className="bg-[#0a0e24] rounded-2xl p-8 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] h-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={contactAnimation}
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-blue-100">Contact Information</h2>
      
      <div className="space-y-8">
        {/* Email */}
        <motion.div className="flex" custom={1} variants={itemAnimation}>
          <div className="mr-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-100 mb-1">Email</h3>
            <p className="text-blue-100/80">contact@ronai.com</p>
          </div>
        </motion.div>
        
        {/* Phone */}
        <motion.div className="flex" custom={2} variants={itemAnimation}>
          <div className="mr-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-100 mb-1">Phone</h3>
            <p className="text-blue-100/80">(555) 123-4567</p>
          </div>
        </motion.div>
        
        {/* Location */}
        <motion.div className="flex" custom={3} variants={itemAnimation}>
          <div className="mr-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-100 mb-1">Location</h3>
            <p className="text-blue-100/80">123 Innovation Way</p>
            <p className="text-blue-100/80">Denver, CO 80202</p>
          </div>
        </motion.div>
        
        {/* Office Hours */}
        <motion.div className="flex" custom={4} variants={itemAnimation}>
          <div className="mr-4 text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-100 mb-1">Office Hours</h3>
            <p className="text-blue-100/80">Monday - Friday: 9AM - 5PM MST</p>
          </div>
        </motion.div>
      </div>
      
      {/* Social Media */}
      <div className="mt-10">
        <h3 className="text-lg font-medium text-blue-100 mb-4">Connect With Us</h3>
        <div className="flex space-x-4">
          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-[#070d1d] border border-blue-900/50 flex items-center justify-center text-blue-100/80 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          
          {/* Twitter */}
          <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-[#070d1d] border border-blue-900/50 flex items-center justify-center text-blue-100/80 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#070d1d] border border-blue-900/50 flex items-center justify-center text-blue-100/80 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
