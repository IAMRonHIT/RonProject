import React, { useState, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import { ChatMessage } from './ChatInterface';
import { healthcareTools } from '../../lib/grok-tools-example';

// Types
export interface CarePlanData {
  patientData?: {
    patient_full_name?: string;
    patient_age?: string;
    patient_gender?: string;
    patient_mrn?: string;
    patient_dob?: string;
    patient_primary_provider?: string;
    patient_admission_date?: string;
    vitalSigns?: {
      vital_bp?: string;
      vital_pulse?: string;
      vital_resp_rate?: string;
      vital_temp?: string;
      vital_o2sat?: string;
      vital_pain_score?: string;
    };
    allergies?: string[];
  };
  clinicalData?: {
    primary_diagnosis_text?: string;
    secondaryDiagnoses?: string[];
    labs?: Array<{
      lab_n_name?: string;
      lab_n_value?: string;
      lab_n_flag?: string;
      lab_n_trend?: string;
    }>;
    currentMedications?: Array<{
      medication_name?: string;
      medication_dose?: string;
      medication_route?: string;
      medication_frequency?: string;
      medication_indication?: string;
    }>;
  };
  [key: string]: any;
}

interface GrokChatHandlerProps {
  carePlanData: CarePlanData;
  initialResponse?: string;
  initialReasoning?: string;
}

const GrokChatHandler: React.FC<GrokChatHandlerProps> = ({ carePlanData, initialResponse, initialReasoning }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // If we have an initial response from Grok, add it as the first message
    if (initialResponse) {
      return [{
        id: `initial-${Date.now()}`,
        role: 'assistant',
        content: initialResponse,
        reasoning: initialReasoning,
        timestamp: new Date().toISOString(),
        isLoading: false,
        context: {
          sources: []
        }
      }];
    }
    return [];
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSystemPrompt = (carePlanData: CarePlanData): string => {
    let prompt = `You are Ron AI, a clinical assistant specializing in evidence-based care planning. You have access to the following patient care plan data:\n\n`;
    
    // Add patient demographics
    if (carePlanData.patientData) {
      const pd = carePlanData.patientData;
      prompt += `## Patient Information\n`;
      prompt += `- Name: ${pd.patient_full_name || 'Not specified'}\n`;
      prompt += `- Age: ${pd.patient_age || 'Not specified'}\n`;
      prompt += `- Gender: ${pd.patient_gender || 'Not specified'}\n`;
      prompt += `- MRN: ${pd.patient_mrn || 'Not specified'}\n`;
      prompt += `- Primary Provider: ${pd.patient_primary_provider || 'Not specified'}\n`;
      prompt += `- Admission Date: ${pd.patient_admission_date || 'Not specified'}\n\n`;
      
      if (pd.vitalSigns) {
        prompt += `## Current Vital Signs\n`;
        Object.entries(pd.vitalSigns).forEach(([key, value]) => {
          if (value) {
            const label = key.replace(/vital_/g, '').replace(/_/g, ' ').toUpperCase();
            prompt += `- ${label}: ${value}\n`;
          }
        });
        prompt += '\n';
      }
      
      if (pd.allergies && pd.allergies.length > 0) {
        prompt += `## Allergies\n`;
        pd.allergies.forEach(allergy => {
          prompt += `- ${allergy}\n`;
        });
      }
    }

    prompt += `\nWhen responding to questions about this care plan:
1. Be clinically precise and use professional terminology.
2. Reference evidence-based practice when appropriate.
3. Consider the patient's specific situation and diagnoses.
4. Structure your responses clearly with markdown formatting.
5. Search for and cite current medical guidelines when relevant.
6. Use available tools to verify drug interactions and find guidelines.`;

    return prompt;
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Add assistant message with loading state
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      reasoning: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
      context: { sources: [] }
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsGenerating(true);

    const systemPrompt = generateSystemPrompt(carePlanData);
    const messagesForApi = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messageText }
    ];

    try {
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let sources: Array<{ title: string; content: string; url?: string; }> = [];

      // Call the API route
      const response = await fetch('/api/grok-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForApi,
          stream: true,
          temperature: 0.7,
          reasoning_effort: "high",
          tools: healthcareTools,
          tool_choice: "auto"
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              // Handle reasoning tokens
              if (data.choices?.[0]?.delta?.reasoning_content) {
                const reasoningChunk = data.choices[0].delta.reasoning_content;
                accumulatedReasoning += reasoningChunk;
              }
              
              // Handle regular content
              if (data.choices?.[0]?.delta?.content) {
                const contentChunk = data.choices[0].delta.content;
                accumulatedContent += contentChunk;
              }
              
              // Handle citations
              if (data.citations) {
                sources = data.citations.map((url: string, idx: number) => ({
                  title: `Source ${idx + 1}`,
                  content: url,
                  url: url
                }));
              }

              // Update the assistant message with streaming content
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                  ? {
                      ...msg,
                      content: accumulatedContent,
                      reasoning: accumulatedReasoning,
                      isLoading: true,
                      context: {
                        sources: sources
                      }
                    }
                  : msg
              ));
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Final update
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? {
              ...msg,
              content: accumulatedContent,
              reasoning: accumulatedReasoning,
              isLoading: false,
              context: {
                sources: sources
              }
            }
          : msg
      ));

      setIsGenerating(false);

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? {
              ...msg,
              content: `Error: ${error.message}`,
              isLoading: false
            }
          : msg
      ));
      setIsGenerating(false);
    }
  }, [carePlanData]);

  const handleRegenerate = useCallback(() => {
    if (messages.length > 0) {
      const lastAssistantMsgIndex = messages.slice().reverse().findIndex(m => m.role === 'assistant');
      if (lastAssistantMsgIndex !== -1) {
        const actualIndex = messages.length - 1 - lastAssistantMsgIndex;
        if (actualIndex > 0) {
          const previousUserMessage = messages[actualIndex - 1];
          if (previousUserMessage.role === 'user') {
            // Remove the current assistant message and regenerate
            setMessages(prev => prev.slice(0, actualIndex));
            handleSendMessage(previousUserMessage.content);
          }
        }
      }
    }
  }, [messages, handleSendMessage]);

  const handleFeedback = useCallback((messageId: string, isPositive: boolean) => {
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'helpful' : 'not-helpful'}`);
    // In a real implementation, you would send this feedback to your backend
  }, []);

  const handleCopyMessage = useCallback((messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  }, [messages]);

  return (
    <div className="h-full">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
        onCopyMessage={handleCopyMessage}
        isGenerating={isGenerating}
        placeholderText="Ask about the patient's care plan..."
        userName="Provider"
        assistantName="Ron AI (Grok)"
        isCarePlanMode={true}
        predefinedPrompts={[
          "What are the key interventions for this patient?",
          "Summarize the care plan in patient-friendly terms",
          "What complications should we monitor for?",
          "How should we adjust the plan based on today's vitals?",
          "What educational resources can we provide?",
          "Explain the primary diagnosis in simple terms"
        ]}
        showReasoningPanel={true}
      />
    </div>
  );
};

export default GrokChatHandler;