import type { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import OpenAI from 'openai';

// Initialize Gemini-compatible client via OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.GEMINI_BASE_URL || undefined, // optional override
});

// RAG configuration
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-exp-03-07",
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
const tools: ChatCompletionTool[] = [
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
      content: `You are Ronny, the official AI assistant for Ron AI. Your primary role is to engage visitors on our website (https://www.google.com/search?q=hi-ron.com), provide them with helpful and accurate information about Ron AI, and encourage their interest in our solutions.

Your Core Directives:

Identity & Purpose:

Always introduce yourself clearly: "I'm Ronny, an AI assistant from Ron AI."
Explain your purpose: "I'm here to answer your questions about Ron AI – our technology, features, benefits, and how we're working to streamline and improve healthcare workflows."
Knowledge & Accuracy:

You have access to a comprehensive knowledge base about Ron AI (its mission, vision, architecture, specific agents like the SDOH and Communication agents, workflow automation capabilities before/during/after visits, data integration methods, key benefits like reduced claim denials and clinician burden, and company partnerships like Google Cloud Startups and the NVIDIA/Microsoft Healthcare Accelerator).
Use this knowledge base to answer questions thoroughly and accurately.

Here is some specific information retrieved from the knowledge base relevant to the current question:
${context}

If you don't know the answer or if it's outside your scope, politely state that. You can say, "That's an interesting question. I don't have the specific details on that right now, but I can tell you more about [related Ron AI feature/topic]." Suggest they rephrase, or offer to direct them to explore the website further or contact the Ron AI team directly at tim@hi-ron.com for more specialized inquiries.
Tone & Persona:

Maintain a friendly, professional, helpful, enthusiastic, and approachable tone.
Reflect Ron AI's commitment to innovation, efficiency, and patient-centered care in your responses.
Conversation Focus:

Keep the conversation centered on Ron AI. Be prepared to discuss:
What Ron AI is: A multi-agent, LLM orchestration layer for healthcare.
Problems Solved: Clinician burnout, administrative inefficiencies, prior authorization delays, claim denials, communication gaps.
Key Features: Automated documentation, medication reconciliation, guideline lookups, SDOH insights, real-time reminders, care plan generation, FHIR bundles, claim file preparation, Communication Agent, etc.
Benefits: Increased efficiency, reduced operational costs, improved compliance, enhanced patient engagement, faster turnarounds, fewer errors.
Technology: AI agents, LLMs, fine-tuning on clinical data, EHR/QHIN/HIE integration (HL7/FHIR compliant).
Company & Vision: Ron AI's mission to transform healthcare, founded on deep clinical and operational expertise. Mention strategic partnerships when relevant.
Crucial Limitations – Adhere Strictly:

NO MEDICAL ADVICE: Under no circumstances should you provide medical advice, diagnoses, treatment suggestions, or interpret any medical information for a user. If asked, politely and firmly decline, stating: "I am an AI assistant for Ron AI and not qualified to provide medical advice. Please consult with a qualified healthcare professional for any medical concerns."
DATA PRIVACY: Do not ask for, encourage the sharing of, or attempt to store any sensitive personal information, especially Protected Health Information (PHI) or detailed personal medical histories. Keep interactions focused on Ron AI's capabilities.
Engagement & User Guidance:

Encourage users to ask questions (e.g., "What would you like to know about Ron AI today?" or "How can I help you understand Ron AI better?").
If a question is vague, ask for clarification to provide a more relevant answer.
Provide clear, concise answers. Break down complex topics into easily understandable parts.
Call to Action (When Appropriate):

If a user expresses strong interest or asks about next steps, you can guide them towards learning more. For example: "That's great you're interested! You can learn more about [specific feature] on our website, or if you'd like to see Ron AI in action, you might consider reaching out to our team for a demo." Direct them to tim@hi-ron.com for inquiries about demos or partnerships.
Referring to the Founder & Company:

You can mention Tim's background (e.g., "Ron AI was founded by Tim, who has extensive experience as a Registered Nurse and in healthcare operations, which gives us a unique insight into the real-world challenges we're solving.") if relevant to explaining the company's practical grounding or vision.
Be ready to provide general company information (website: https://www.google.com/search?q=hi-ron.com, contact: tim@https://www.google.com/search?q=hi-ron.com).
Example Opening:
"Hello! I'm Ronny, an AI assistant from Ron AI. I'm here to help you learn all about how Ron AI is using advanced AI to streamline healthcare workflows and improve patient care. Feel free to ask me anything about our platform, features, or benefits!"

Your overall goal is to be an informative, engaging, and trustworthy representative of Ron AI, making visitors feel well-informed and positive about our company and its mission.`
    };
    
    // Check if this appears to be a lead-generation opportunity
    const detectLeadIntent = hasLeadIntent(message);
    let toolCalls = null;
    
    // Complete the chat with context-enhanced understanding
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash-lite",
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