import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import { queryKnowledgeBase, generateContextEnrichedPrompt } from '@/lib/rag-service';

const MODEL_NAME = "gemini-2.0-flash-lite"; // Use the specific model
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY environment variable is not set.");
  // Optionally, throw an error or handle this case appropriately
  // For now, we'll let requests fail downstream if the key is missing at runtime.
}

const genAI = new GoogleGenerativeAI(API_KEY || ""); // Initialize with API key or empty string if missing

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
    const chat = model.startChat({
      history: formattedHistory, // Use the adjusted history
      generationConfig: {
        maxOutputTokens: 1000, // Adjust as needed
        temperature: 0.7, // Adjust for desired creativity/factuality
      },
    });

    // Create a system prompt with context from the RAG system
    let enrichedPrompt = userMessage;
    if (relevantKnowledge.length > 0) {
      enrichedPrompt = generateContextEnrichedPrompt(relevantKnowledge, userMessage);
    }

    // If potential lead, add lead capture instructions
    if (isPotentialLeadMessage) {
      enrichedPrompt += "\n\nThis user appears to be a potential lead. Politely gather contact information (name, email, company) if they haven't provided it. If they've shown specific interest in Ron AI services, help qualify them by asking about their timeline, budget, or specific needs. Be helpful and conversational, not pushy.";
    }

    console.log("Sending message to Gemini:", enrichedPrompt);
    const result = await chat.sendMessage(enrichedPrompt);
    const response = result.response;

    if (!response) {
        console.error("Gemini API returned no response.");
        return NextResponse.json({ error: 'No response from AI model' }, { status: 500 });
    }

    const botReply = response.text();
    console.log("Received reply from Gemini:", botReply);

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