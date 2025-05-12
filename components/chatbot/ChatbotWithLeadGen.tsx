"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/hooks/use-chat'; // Using existing Gemini chat hook

interface LeadFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
}

const ChatbotWithLeadGen: React.FC = () => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [shouldShowLeadForm, setShouldShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    message: ''
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Import and use existing Gemini chat implementation
  const { messages, isLoading, submitMessage } = useChat({
    initialMessages: [
      {
        role: 'system',
        content: 'Welcome to Ron AI! How can I help you with your care planning needs today?'
      }
    ]
  });
  
  // Suggested questions based on conversation context
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What is CPaaS?",
    "How does Ron AI improve care planning?",
    "Can I integrate with our EHR system?",
    "Tell me about pricing options"
  ]);
  
  // Effect to scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Function to detect sales intent from message
  const detectSalesIntent = (message: string): boolean => {
    const salesKeywords = [
      'demo', 'pricing', 'price', 'cost', 'quote', 'subscription',
      'contact', 'sales', 'trial', 'purchase', 'buy', 'talk to', 'speak with'
    ];
    
    return salesKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Check for sales intent
    if (detectSalesIntent(input) && !shouldShowLeadForm) {
      // First send the user's message through the normal flow
      await submitMessage(input);
      
      // Then follow up with the lead generation response
      setTimeout(() => {
        setShouldShowLeadForm(true);
      }, 1000);
      
      setInput('');
      return;
    }
    
    try {
      // Use the existing Gemini chat implementation
      const response = await submitMessage(input);
      
      // Update suggested questions based on context
      updateSuggestedQuestions(input, response);
      
      // Clear input after sending
      setInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Update suggested questions based on context
  const updateSuggestedQuestions = (userInput: string, aiResponse: string): void => {
    // If user asked about CPaaS
    if (userInput.toLowerCase().includes('cpaas') ||
        aiResponse.toLowerCase().includes('care plan as a service')) {
      setSuggestedQuestions([
        "What benefits does CPaaS provide?",
        "How much time can CPaaS save?",
        "Can I see a demo of CPaaS?",
        "What's the pricing for CPaaS?"
      ]);
      return;
    }
    
    // If user asked about integration
    if (userInput.toLowerCase().includes('integration') ||
        userInput.toLowerCase().includes('ehr') ||
        aiResponse.toLowerCase().includes('integration')) {
      setSuggestedQuestions([
        "Which EHR systems do you integrate with?",
        "How complex is the integration process?",
        "Do you have an API for custom integrations?",
        "What about FHIR compatibility?"
      ]);
      return;
    }
    
    // Default to general questions if no specific context is detected
    setSuggestedQuestions([
      "Tell me about Ron AI's care planning capabilities",
      "How does the AI generate care plans?",
      "What makes Ron AI different from competitors?",
      "Can I request a product demo?"
    ]);
  };
  
  // Handle lead form input changes
  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit lead information
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit lead to your backend API
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadFormData,
          source: 'Website Chatbot',
          leadType: 'Sales Inquiry'
        }),
      });
      
      if (response.ok) {
        setLeadSubmitted(true);
        setShouldShowLeadForm(false);
        
        // Add a thank you message using the existing chat system
        submitMessage(`Thank you ${leadFormData.name}! Your information has been submitted. A member of our team will contact you shortly. Is there anything else I can help you with in the meantime?`);
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      submitMessage("I'm sorry, there was an issue submitting your information. Please try again or email us directly at contact@ronai.com.");
    }
  };
  
  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors duration-300`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-slate-900 rounded-2xl shadow-xl overflow-hidden z-40 border border-slate-700 flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ron AI Assistant</h3>
                  <p className="text-xs text-slate-300">Care Planning Expert</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}
                  >
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 p-3 rounded-lg border border-slate-700 flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Lead Generation Form */}
              {shouldShowLeadForm && !leadSubmitted && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <h3 className="font-medium text-white mb-2">Contact Information</h3>
                    <div>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={leadFormData.name}
                        onChange={handleLeadFormChange}
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={leadFormData.email}
                        onChange={handleLeadFormChange}
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="company"
                        placeholder="Company"
                        value={leadFormData.company}
                        onChange={handleLeadFormChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="role"
                        placeholder="Your Role"
                        value={leadFormData.role}
                        onChange={handleLeadFormChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="message"
                        placeholder="What are you interested in learning more about?"
                        value={leadFormData.message}
                        onChange={handleLeadFormChange}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit
                    </Button>
                  </form>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested Questions */}
            <div className="p-2 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs text-slate-400">Suggested questions</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors"
                    onClick={() => {
                      setInput(question);
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button
                  type="button"
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWithLeadGen;