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

  // Start with empty messages to show shortcut prompts
  useEffect(() => {
    setMessages([]);
  }, []);

  // Listen for chat-update events from SonarChatHandler
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      const { messageId, content, reasoning, isComplete, sources } = event.detail;
      
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === messageId) {
            const updatedMsg: ChatMessage = {
              ...msg,
              content: content || msg.content,
              reasoning: reasoning || msg.reasoning,
              isLoading: !isComplete
            };
            
            // Add sources/citations to context if they exist
            if (sources && sources.length > 0) {
              updatedMsg.context = {
                ...msg.context,
                sources: sources
              };
            }
            
            return updatedMsg;
          }
          return msg;
        })
      );
    };

    document.addEventListener('chat-update', handleChatUpdate as EventListener);
    
    return () => {
      document.removeEventListener('chat-update', handleChatUpdate as EventListener);
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

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
      let responseContent = '';
      if (onSendToChatbot) {
        responseContent = await onSendToChatbot(message);
      } else {
        responseContent = "No chatbot integration is configured. Please provide an `onSendToChatbot` callback.";
      }
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

  const handleRegenerate = () => {
    const lastAssistantIndex = [...messages].reverse().findIndex(msg => msg.role === 'assistant');
    if (lastAssistantIndex !== -1) {
      const newMessages = [...messages];
      newMessages.splice(messages.length - 1 - lastAssistantIndex, 1);
      setMessages(newMessages);
      const lastUserMessage = [...newMessages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback for message ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
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

  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content)
        .then(() => {
          console.log('Message copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy message: ', err);
        });
    }
  };

  return (
    <div className="h-full">
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
  );
};

export default CarePlanChat;
