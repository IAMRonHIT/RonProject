/**
 * Perplexity Service
 * -----------------
 * Handles interactions with the Perplexity API through the backend proxy
 * and processes responses with reasoning and structured content.
 */

import axios from 'axios';

/**
 * Interface for Perplexity API response
 */
interface PerplexityResponse {
  rawResponse: string;
  reasoningMarkdown?: string;
  jsonData?: any;
  error?: string;
}

/**
 * Get a response from the Perplexity API
 * 
 * @param query The query to send to the API
 * @param model The model to use (default: sonar-reasoning-pro)
 * @param systemPrompt Optional system prompt to guide the model
 * @returns The processed API response
 */
export const getPerplexityResponse = async (
  query: string,
  model: string = 'sonar-reasoning-pro',
  systemPrompt?: string
): Promise<PerplexityResponse> => {
  try {
    const response = await axios.post('/api/perplexity', {
      query,
      model,
      systemPrompt
    });

    const data = response.data;
    
    if (data.error) {
      return { 
        rawResponse: '', 
        error: data.error 
      };
    }

    // Process the response to extract reasoning and structured content
    const processedResponse = processResponse(data.text || '');
    
    return {
      rawResponse: data.text || '',
      ...processedResponse
    };
  } catch (error: any) {
    console.error('Error calling Perplexity API:', error);
    return {
      rawResponse: '',
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Process a response from the Perplexity API to extract reasoning and structured content
 * 
 * @param text The raw response text
 * @returns Object containing reasoning and structured content
 */
const processResponse = (text: string): { reasoningMarkdown?: string; jsonData?: any } => {
  // Extract reasoning from <think> tags
  const reasoningMarkdown = extractReasoning(text);
  
  // Try to extract JSON data from the response
  const jsonData = extractJsonData(text);
  
  return {
    reasoningMarkdown,
    jsonData
  };
};

/**
 * Extract reasoning from <think> tags in the response
 * 
 * @param text The raw response text
 * @returns The extracted reasoning as markdown
 */
export const extractReasoning = (text: string): string => {
  const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
  return thinkMatch ? thinkMatch[1].trim() : '';
};

/**
 * Process reasoning markdown to enhance formatting
 * 
 * @param markdown The raw markdown from reasoning
 * @returns Enhanced markdown with better formatting
 */
export const processReasoningMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  // Add headers to lists for better organization
  let processed = markdown;
  
  // Convert numbered lists with clear headers
  processed = processed.replace(/(\d+\.\s*[A-Z][^:]+):/g, '**$1:**');
  
  // Add spacing between paragraphs for better readability
  processed = processed.replace(/\n\n/g, '\n\n');
  
  // Highlight key clinical terms
  processed = processed.replace(/\b(diagnosis|assessment|evaluation|treatment|intervention|prognosis|symptom|sign)\b/gi, 
    (match) => `**${match}**`);
  
  return processed;
};

/**
 * Extract JSON data from the response
 * 
 * @param text The raw response text
 * @returns The extracted JSON data or undefined if none found
 */
export const extractJsonData = (text: string): any | undefined => {
  try {
    // Remove the <think>...</think> section if present
    const contentWithoutThinking = text.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    
    // Try to find JSON content (between { and } or [ and ])
    const jsonMatch = contentWithoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                     contentWithoutThinking.match(/({[\s\S]*})/) || 
                     contentWithoutThinking.match(/(\[[\s\S]*\])/);
    
    if (jsonMatch && jsonMatch[1]) {
      const jsonString = jsonMatch[1].trim();
      return JSON.parse(jsonString);
    }
    
    return undefined;
  } catch (error) {
    console.error('Error extracting JSON data:', error);
    return undefined;
  }
};

/**
 * Create a system prompt for care plan chat
 * 
 * @param carePlanData The care plan data
 * @returns A formatted system prompt
 */
export const createCarePlanSystemPrompt = (carePlanData: any): string => {
  let prompt = `You are RON AI, a clinical assistant helping with care plans. 
    
Here's the current patient information:
`;

  if (carePlanData.patientData) {
    const { name, age, gender, primaryDiagnosis, secondaryDiagnoses } = carePlanData.patientData;
    prompt += `- Name: ${name || 'Unknown'}\n`;
    prompt += `- Age: ${age || 'Unknown'}\n`;
    prompt += `- Gender: ${gender || 'Unknown'}\n`;
    prompt += `- Primary Diagnosis: ${primaryDiagnosis || 'Unknown'}\n`;
    
    if (secondaryDiagnoses && secondaryDiagnoses.length > 0) {
      prompt += `- Secondary Diagnoses: ${secondaryDiagnoses.join(', ')}\n`;
    }
  }

  if (carePlanData.nursingDiagnoses && carePlanData.nursingDiagnoses.length > 0) {
    prompt += `\nCurrent nursing diagnoses:\n`;
    carePlanData.nursingDiagnoses.forEach((diagnosis: any, index: number) => {
      prompt += `${index + 1}. ${diagnosis.title}\n`;
      if (diagnosis.interventions && diagnosis.interventions.length > 0) {
        prompt += `   Interventions: ${diagnosis.interventions.map((i: any) => i.title).join(', ')}\n`;
      }
    });
  }

  prompt += `\nWhen responding to questions about this care plan:
1. Be clinically precise and use professional terminology
2. Reference evidence-based practice when appropriate
3. Consider the patient's specific situation and diagnoses
4. Structure your responses clearly with markdown formatting
5. Use your reasoning process to analyze clinical information before responding

You MUST use <think> tags to show your reasoning process before providing your final answer.`;

  return prompt;
};
