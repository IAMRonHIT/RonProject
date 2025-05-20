"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Bot, Brain } from 'lucide-react';
import ChatInterface, { ChatMessage } from './ChatInterface';

interface CarePlanChatProps {
  carePlanData: any; // The care plan data to reference
  onSendToChatbot?: (message: string) => Promise<string>;
  defaultOpen?: boolean;
}

const CarePlanChat: React.FC<CarePlanChatProps> = ({
  carePlanData,
  onSendToChatbot,
  defaultOpen = true
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(defaultOpen);
  
  // Add a welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: "Hello! I'm RON AI, your clinical assistant. I can help answer questions about this patient's care plan, provide explanations on clinical decisions, or suggest next steps in care. How can I assist you today?",
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Function to send a message to the chatbot
  const handleSendMessage = async (message: string) => {
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add placeholder for assistant's response
    const assistantMsgId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const placeholderMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, placeholderMessage]);
    setIsGenerating(true);
    
    try {
      // Either use the provided callback or simulate a response
      let responseContent = '';
      
      if (onSendToChatbot) {
        responseContent = await onSendToChatbot(message);
      } else {
        // Simulate a delay for the response
        await new Promise(resolve => setTimeout(resolve, 1500));
        responseContent = generateSimulatedResponse(message, carePlanData);
      }
      
      // Update the assistant message with the response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId 
            ? {
                ...msg,
                content: responseContent,
                isLoading: false,
                context: {
                  sources: [
                    {
                      title: "Patient Nursing Diagnoses",
                      content: "Referenced nursing diagnoses and interventions from the care plan."
                    },
                    {
                      title: "Clinical Guidelines",
                      content: "Best practices for heart failure management with fluid overload."
                    }
                  ]
                }
              } 
            : msg
        )
      );
    } catch (error) {
      // Handle error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId 
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error while generating a response. Please try again.",
                isLoading: false
              } 
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to regenerate the last assistant response
  const handleRegenerate = () => {
    // Find the last assistant message
    const lastAssistantIndex = [...messages].reverse().findIndex(msg => msg.role === 'assistant');
    
    if (lastAssistantIndex !== -1) {
      // Remove the last assistant message
      const newMessages = [...messages];
      newMessages.splice(messages.length - 1 - lastAssistantIndex, 1);
      setMessages(newMessages);
      
      // Find the last user message
      const lastUserMessage = [...newMessages].reverse().find(msg => msg.role === 'user');
      
      if (lastUserMessage) {
        // Re-send the last user message
        handleSendMessage(lastUserMessage.content);
      }
    }
  };
  
  // Function to handle message feedback
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    // In a real app, you would send this feedback to your backend
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
    
    // For now, just show a visual indication
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              feedback: isPositive ? 'positive' : 'negative'
            } 
          : msg
      )
    );
  };
  
  // Function to copy message content
  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    
    if (message) {
      navigator.clipboard.writeText(message.content)
        .then(() => {
          // Could show a toast notification here
          console.log('Message copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy message: ', err);
        });
    }
  };
  
  return (
    <div className="relative">
      {/* Toggle button for collapsed state */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-full p-3 shadow-lg"
          aria-label="Open AI Assistant"
        >
          <Bot size={24} />
        </button>
      )}
      
      {/* Main panel */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          isPanelOpen 
            ? 'opacity-100 transform translate-x-0' 
            : 'opacity-0 transform translate-x-full absolute right-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-700 rounded-xl shadow-lg border border-slate-600 overflow-hidden">
          {/* Header for collapse */}
          <div className="bg-slate-600 p-2 flex justify-between items-center">
            <div className="flex items-center text-slate-200 font-medium">
              <Brain size={16} className="mr-2 text-blue-400" />
              <span>AI Care Assistant</span>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-500 transition-colors"
              aria-label="Collapse chat panel"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Chat interface */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            onFeedback={handleFeedback}
            onCopyMessage={handleCopyMessage}
            isGenerating={isGenerating}
            placeholderText="Ask about this patient's care plan..."
            userName="Provider"
            assistantName="RON AI"
            isCarePlanMode={true}
            predefinedPrompts={[
              "What interventions are most critical for this patient?",
              "Summarize the care plan in simple language for the patient",
              "What potential complications should I watch for?",
              "How should I adjust the plan based on today's vitals?",
              "What educational resources should I share with the patient?",
              "Generate a patient-friendly explanation of their diagnosis"
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Generate a simulated response based on the message and care plan data
const generateSimulatedResponse = (message: string, carePlanData: any): string => {
  const messageLower = message.toLowerCase();
  
  // Responses for different types of questions
  if (messageLower.includes('critical') || messageLower.includes('important intervention')) {
    return "Based on this patient's care plan, the most critical interventions are:\n\n1. **Daily weight monitoring** - This is essential for tracking fluid status in the context of CHF exacerbation\n\n2. **Strict fluid restriction** (1.5L/day) - To prevent further fluid overload\n\n3. **Diuretic administration** - The Furosemide IV as ordered is critical for managing the pulmonary congestion\n\n4. **Oxygen saturation monitoring** - To ensure adequate oxygenation and detect early signs of respiratory distress\n\nThese interventions directly address the primary nursing diagnosis of Fluid Volume Excess related to compromised regulatory mechanisms.";
  }
  
  if (messageLower.includes('explain') || messageLower.includes('simple language') || messageLower.includes('patient friendly')) {
    return "Here's how I would explain the care plan to the patient in simple terms:\n\n\"Sarah, your heart is having trouble pumping efficiently right now, which has caused extra fluid to build up in your lungs and legs. That's why you've been feeling short of breath and noticed the swelling.\n\nOur plan is to:\n\n- Give you medications called diuretics (water pills) to help your body get rid of the extra fluid\n- Monitor your weight daily to track how well we're removing the fluid\n- Help you rest in positions that make breathing easier\n- Gradually increase your activity as you feel stronger\n- Teach you about managing your heart condition, including diet changes and medication schedules\n\nWithin a few days, you should notice easier breathing and less swelling. We'll be checking your progress regularly and adjusting the plan as needed.\"";
  }
  
  if (messageLower.includes('complication') || messageLower.includes('watch for')) {
    return "For this patient with CHF exacerbation, you should watch for these potential complications:\n\n1. **Worsening respiratory distress** - Monitor for increased respiratory rate, decreased O2 saturation, accessory muscle use, or worsening crackles\n\n2. **Electrolyte imbalances** - Especially hypokalemia secondary to diuretic therapy\n\n3. **Renal function deterioration** - Track daily BUN/Creatinine as aggressive diuresis can impact kidney function\n\n4. **Orthostatic hypotension** - Risk increases with diuresis and ACEi therapy\n\n5. **Signs of digoxin toxicity** - If patient is on digoxin, watch for nausea, visual changes, or new arrhythmias\n\n6. **Thromboembolic events** - Reduced mobility increases DVT/PE risk\n\nI recommend implementing a twice-daily assessment specifically focused on these complications and documenting findings in the flow sheet.";
  }
  
  if (messageLower.includes('vitals') || messageLower.includes('adjust')) {
    return "Based on today's vitals (BP 122/78, P 72, RR 22, O2 94% RA), here's how I would adjust the care plan:\n\n1. **Respiratory status** - The RR of 22 and O2 sat of 94% indicate mild respiratory compromise. I would:\n   - Continue supplemental O2 to maintain sats >95%\n   - Position patient with HOB elevated 30-45 degrees\n   - Schedule breathing exercises with respiratory therapy\n\n2. **Hemodynamics** - BP and HR are stable, which supports:\n   - Continuing current diuretic dosing without adjustment\n   - Proceeding with scheduled ACEi therapy\n   - Safe to begin cardiac rehabilitation activities\n\n3. **Additional recommendations**:\n   - Increase frequency of breath sound assessment to q4h\n   - Document fluid balance with strict I&O\n   - Review pulmonary edema status with chest auscultation\n\nThe vital signs suggest the patient is responding to treatment but still requires close monitoring of respiratory status.";
  }
  
  // Default response for other questions
  return "Based on my analysis of this patient's care plan, I can see they have CHF exacerbation with fluid volume excess as a primary nursing diagnosis. The patient is currently receiving IV Furosemide for diuresis and has bibasilar crackles on assessment.\n\nThe current interventions focus on fluid management, symptom control, and preventing complications. The goals include improved breathing patterns, reduced edema, and patient education on self-management.\n\nIs there a specific aspect of the care plan you'd like me to elaborate on? I can provide more details about the nursing diagnoses, interventions, or expected outcomes.";
};

export default CarePlanChat;