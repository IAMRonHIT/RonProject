import type { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// RAG configuration
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// This would be pre-loaded in production with Ron AI documentation
const trainingData = `
# Ron AI - Care Plan as a Service (CPaaS)

## Overview
Ron AI's Care Plan as a Service (CPaaS) is a revolutionary AI-powered platform designed to transform healthcare delivery by automating and enhancing the care planning process. Our solution helps healthcare providers create comprehensive, evidence-based care plans in minutes rather than hours, reducing documentation burden and improving patient outcomes.

## Key Features
- AI-powered care plan generation using the ADPIE nursing process
- Evidence-based recommendations aligned with latest clinical guidelines
- Personalized care plans tailored to individual patient needs
- Seamless integration with EHR systems
- Robust collaboration tools for interdisciplinary teams
- Continuous quality improvement through analytics

## Benefits
- Save 60-70% of time spent on documentation
- Improve standardization and quality of care
- Reduce clinician burnout
- Enhance patient outcomes through evidence-based practice
- Ensure regulatory compliance

## Pricing
- Starter: $499/month for up to 10 users
- Professional: $999/month for up to 25 users
- Enterprise: Custom pricing for organizations with more than 25 users

## Use Cases
- Acute care facilities
- Long-term care providers
- Home health agencies
- Mental health services
- Specialty clinics

## Integration Capabilities
- Epic
- Cerner
- Meditech
- Allscripts
- Custom API integrations available

## About Ron AI
Founded in 2023, Ron AI is a healthcare technology company focused on reducing clinician burnout through intelligent automation. Our team combines expertise in healthcare, artificial intelligence, and software development.

## Demo and Support
Customers can schedule a personalized demo at www.ronai.io/demo
Support is available via email at support@ronai.io or by phone at (555) 123-4567

## Frequently Asked Questions

### What is the implementation process like?
Implementation typically takes 2-4 weeks and includes setup, training, and integration with existing systems.

### Is Ron AI HIPAA compliant?
Yes, Ron AI is fully HIPAA compliant and implements robust security measures to protect patient data.

### Can we customize the care plans to our organization's standards?
Yes, the platform can be customized to incorporate your organization's specific protocols and best practices.

### How does the AI stay updated with the latest clinical guidelines?
Our clinical content team regularly updates the system with the latest evidence-based practices and guidelines.
`;

// Create and initialize the vector store (would be done at startup in production)
let vectorStore: MemoryVectorStore;

const initializeRAG = async () => {
  if (!vectorStore) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const docs = await splitter.createDocuments([trainingData]);
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  }
  
  return vectorStore;
};

// Keywords that suggest sales/lead intent
const leadIntentKeywords = [
  'demo', 'pricing', 'cost', 'price', 'trial', 'contact', 'sales',
  'representative', 'schedule', 'meeting', 'call', 'free trial',
  'subscribe', 'purchase', 'buy', 'implementation', 'integrate',
  'talk to someone', 'speak with', 'expert', 'consultation', 'quote'
];

// Check if message contains lead intent
const hasLeadIntent = (message: string): boolean => {
  message = message.toLowerCase();
  return leadIntentKeywords.some(keyword => message.includes(keyword.toLowerCase()));
};

// Tool definitions
const tools = [
  {
    type: "function",
    function: {
      name: "create_hubspot_lead",
      description: "Create a lead in Hubspot when a user expresses intent to purchase, see a demo, or talk to sales",
      parameters: {
        type: "object",
        properties: {
          intent: {
            type: "string",
            enum: ["demo_request", "pricing_info", "sales_call", "general_interest"],
            description: "The type of sales intent expressed by the user"
          },
          urgency: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "How urgent the lead's request appears to be"
          },
          interests: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Specific product features or aspects the lead is interested in"
          }
        },
        required: ["intent"]
      }
    }
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Initialize RAG system if not already done
    const store = await initializeRAG();
    
    // Search for relevant context from our knowledge base
    const results = await store.similaritySearch(message, 3);
    
    // Format context for the model
    const context = results.map(doc => doc.pageContent).join('\n\n');
    
    // Format conversation history
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Prepare system message with context
    const systemMessage = {
      role: "system",
      content: `You are Ron AI's helpful customer assistant. You provide information about Ron AI's Care Plan as a Service (CPaaS) platform for healthcare organizations.
      
Here is information about Ron AI that you can use to answer questions:

${context}

Guidelines:
1. Be friendly, professional, and concise.
2. If you're not sure about specific details, acknowledge that and offer to connect the user with someone who can help.
3. Don't make up information not provided in the context.
4. If the user expresses interest in purchasing, seeing a demo, or speaking with sales, suggest collecting their contact information.
5. For technical questions beyond your knowledge, offer to connect them with the support team.`
    };
    
    // Check if this appears to be a lead-generation opportunity
    const detectLeadIntent = hasLeadIntent(message);
    let toolCalls = null;
    
    // Complete the chat with context-enhanced understanding
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [systemMessage, ...formattedHistory],
      tools: detectLeadIntent ? tools : undefined,
      temperature: 0.7,
    });
    
    // Get the assistant's response
    const responseMessage = completion.choices[0].message;
    
    // If tool calls were made, execute them
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      toolCalls = responseMessage.tool_calls;
      
      // In a real implementation, you would use Zapier to create the lead in Hubspot
      // Here we'll just log it and return a flag to collect lead info
      console.log("Lead intent detected:", toolCalls);
    }
    
    // Generate suggested follow-up questions
    let suggestedFollowups: string[] = [];
    
    // If we have a substantive response, generate follow-up questions
    if (responseMessage.content && responseMessage.content.length > 20) {
      const followupsResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "Generate 3-4 natural follow-up questions that a prospective customer might ask after receiving this information about Ron AI. Make questions concise (under 60 characters), specific, and relevant to the conversation."
          },
          {
            role: "user",
            content: `Previous response: ${responseMessage.content}`
          }
        ],
        temperature: 0.7,
      });
      
      // Extract and format follow-up questions
      const followupsText = followupsResponse.choices[0].message.content || "";
      suggestedFollowups = followupsText
        .split(/\d+\.\s+/)
        .filter(q => q.trim().length > 0 && q.trim().endsWith('?'))
        .map(q => q.trim())
        .slice(0, 4);
    }
    
    return res.status(200).json({
      message: responseMessage.content,
      shouldCollectLead: !!toolCalls || detectLeadIntent,
      suggestedFollowups,
    });
    
  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}