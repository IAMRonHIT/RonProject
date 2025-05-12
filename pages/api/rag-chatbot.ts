import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for vector storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || '');

type ChatRequest = {
  messages: { role: string; content: string }[];
  systemPrompt?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set proper headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { messages, systemPrompt = '' } = req.body as ChatRequest;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'Invalid messages format' })}\n\n`);
      return res.end();
    }
    
    const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Perform RAG - retrieve relevant content based on user query
    const { data: relevantDocs, error: retrievalError } = await supabase.rpc('match_documents', {
      query_embedding: await generateEmbedding(latestUserMessage),
      match_threshold: 0.75,
      match_count: 5
    });
    
    if (retrievalError) {
      console.error('Error retrieving documents:', retrievalError);
    }
    
    // Construct context from relevant documents
    const context = relevantDocs ?
      "I'll provide some relevant information from our knowledge base:\n\n" +
      relevantDocs.map((doc: any) => doc.content).join('\n\n') :
      '';
    
    // Enhance system prompt with retrieved context
    const enhancedSystemPrompt = `
      You are Ron AI's customer support agent. You help people understand Ron AI's Care Plan as a Service (CPaaS) offering.
      
      ${context}
      
      ${systemPrompt}
      
      Answer the user's questions based on the provided context when possible. If you don't know the answer, say so honestly.
      Respond in Markdown format for better readability. Keep responses concise but informative.
      
      If the user asks about demos, pricing, or wants to contact sales, offer to collect their contact information.
    `;
    
    // Use your existing Gemini 2.0 Flash Lite model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    // Create chat session
    const chat = model.startChat({
      history: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
    
    // Stream the response
    const result = await chat.sendMessageStream(enhancedSystemPrompt + "\n\nUser: " + latestUserMessage);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
    
  } catch (error: any) {
    console.error('Error in chat API:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Unknown error' })}\n\n`);
    return res.end();
  }
}

// Helper function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  // Use Google's embedding model
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || '');
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding.values;
  
  return embedding;
}