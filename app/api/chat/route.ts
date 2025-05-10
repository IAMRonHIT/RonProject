import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import { queryKnowledgeBase, generateContextEnrichedPrompt } from '@/lib/rag-service';

// Use a valid model name - Gemini 2.0 Flash Lite is the latest version for text generation
const MODEL_NAME = "gemini-2.0-flash-lite"; // Fallback to a stable model version
const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY; // Try both possible key names

// Log API key status for debugging (without leaking key values)
console.log(`API key status: ${API_KEY ? 'CONFIGURED' : 'MISSING'}`);

if (!API_KEY) {
  console.error("Neither GOOGLE_API_KEY nor GOOGLE_AI_API_KEY environment variables are set.");
}

// Initialize the API client with robust error handling
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Safety settings - adjust as needed
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Function to format chat history for the Gemini API
function formatHistoryForGemini(history: { sender: 'user' | 'bot'; text: string }[]): Content[] {
  return history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model', // Map 'bot' to 'model'
    parts: [{ text: msg.text }]
  }));
}

// Function to detect if a message is a potential lead
function isPotentialLead(message: string): boolean {
  const leadIndicators = [
    /contact.*sales/i, 
    /pricing/i, 
    /demo/i, 
    /quote/i, 
    /interested in/i,
    /how (much|many)/i,
    /email/i,
    /phone/i,
    /call/i,
    /contact/i
  ];
  
  return leadIndicators.some(pattern => pattern.test(message));
}

export async function POST(request: Request) {
  if (!API_KEY) {
     return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const userMessage = body.message;
    const incomingHistory = body.history || []; // Full history from client, *including* the current userMessage
    const userContext = body.userContext || {}; // Get user context if available

    if (!userMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if this is a potential lead
    const isPotentialLeadMessage = isPotentialLead(userMessage);
    
    // Get relevant knowledge from RAG system
    const relevantKnowledge = await queryKnowledgeBase(userMessage, 3);
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, safetySettings });

    // History for the API should be everything *before* the current user message
    const historyForApi = incomingHistory.slice(0, -1);
    let formattedHistory = formatHistoryForGemini(historyForApi);

    // Ensure history starts with 'user' if it's not empty
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory = formattedHistory.slice(1);
    }

    // Start chat with the potentially adjusted history
    // Create a simpler chat configuration with sensible defaults
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7
      }
    });

    // Create a system prompt with context from the RAG system
    let enrichedPrompt = userMessage;
    if (relevantKnowledge.length > 0) {
      enrichedPrompt = generateContextEnrichedPrompt(relevantKnowledge, userMessage);
    }

    // If potential lead, add lead capture instructions
    if (isPotentialLeadMessage) {
      enrichedPrompt += "\n\nPOTENTIAL LEAD DETECTED:\nThis user appears to be a potential lead. Follow these guidelines in your response:\n- Politely gather contact information (name, email, company) if not already provided\n- If they've shown interest in specific Ron AI services, help qualify their needs\n- Ask relevant questions about their timeline, budget, or specific requirements\n- Maintain a helpful, conversational tone - never be pushy\n- Mention that a team member from Ron AI can follow up with more detailed information";
    }

    console.log("Sending message to Gemini with system prompt:", enrichedPrompt.substring(0, 100) + "...");
    
    let botReply = 'I couldn\'t retrieve a response right now. Please try again later.';
    
    try {
      // Basic validation of API key before making the request
      if (!API_KEY) {
        console.error("No API key available");
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
      }

      // Send message to Gemini model with timeout handling
      const result: any = await Promise.race([
        chat.sendMessage(enrichedPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
      ]);

      // Extract response text
      const response = result?.response;
      if (response) {
        botReply = response.text();
        console.log("Received reply from Gemini. Length:", botReply.length);
        console.log("Reply preview:", botReply.substring(0, 100) + "...");
      }
    } catch (error: any) {
      // Log the full error details for debugging
      console.error("Error from Gemini API:", error?.message || 'Unknown error');
      
      // Return a user-friendly error but with a 200 status so the UI can handle it gracefully
      return NextResponse.json({ 
        reply: "Sorry, I'm having trouble connecting right now. Please try again later.",
        error: error?.message || 'Unknown error',
        isPotentialLead: false
      });
    }

    // Prepare response object
    const responseData = { 
      reply: botReply,
      isPotentialLead: isPotentialLeadMessage
    };

    // If this is a potential lead, we could also trigger HubSpot integration here
    // This would be handled by a separate function or API endpoint

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in chat API:', error);
    // Check for specific API errors if needed
    if (error instanceof Error && error.message.includes('API key not valid')) {
         return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error processing chat' }, { status: 500 });
  }
}