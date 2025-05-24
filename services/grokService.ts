import { ChatMessage } from '@/components/careplangenerator/ChatInterface';

export interface GrokServiceConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Interface for tool definitions
export interface GrokTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters?: any;
  };
}

// Interface for tool calls in the response
export interface GrokToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Interface for the overall non-streaming API response
interface GrokAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content?: string;
      reasoning_content?: string;
      tool_calls?: GrokToolCall[];
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens?: number; // Separate reasoning tokens
    total_tokens: number;
  };
  citations?: string[]; // Array of URL strings
}

// Interface for individual stream chunks
interface GrokStreamChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string; // Separate reasoning content
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason?: string | null;
    logprobs?: any;
  }>;
  system_fingerprint?: string;
  citations?: string[]; // Citations appear in final chunk
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens?: number;
    total_tokens: number;
  };
}

export class GrokService {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private xHandles: string[] = [
    "NIH", "JohnsHopkins", "ClevelandClinic", "DrTomFrieden", "JAMA_current", 
    "NEJM", "HHSGov", "CDCgov", "WHO", "MayoClinic", "AmerMedicalAssn", 
    "kevinmd", "AHAorg", "TheLancet", "FDAgov", "NIAID", "HarvardMed", 
    "StanfordMed", "DrEricTopol", "BMJ_latest", "HL7"
  ];

  constructor(config: GrokServiceConfig) {
    this.apiKey = config.apiKey; 
    this.endpoint = '/api/grok-chat'; 
    this.model = config.model || 'grok-3-mini';
    this.maxTokens = config.maxTokens || 8000;
    this.temperature = config.temperature || 0.7;
  }

  // Parse citations from URL strings
  private parseCitations(citations: string[] | undefined): Array<{ title: string; content: string; url?: string; }> {
    if (!citations || citations.length === 0) {
      return [];
    }
    return citations.map((url: string, index: number) => {
      // Extract domain name for title
      let title = `Source ${index + 1}`;
      try {
        const urlObj = new URL(url);
        title = urlObj.hostname.replace('www.', '');
      } catch (e) {
        // Keep default title if URL parsing fails
      }
      
      return {
        title,
        content: url,
        url,
      };
    });
  }

  public async fetchFullGrokResponse(
    messages: Array<{ role: string; content: string }>,
    tools?: GrokTool[]
  ): Promise<{ 
    fullContent: string; 
    fullReasoning?: string; 
    sourcesData: Array<{ title: string; content: string; url?: string; }>; 
    toolCalls?: GrokToolCall[];
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      reasoning_tokens?: number;
      total_tokens: number;
    };
  }> {
    const payload: any = {
      model: this.model,
      messages,
      temperature: this.temperature,
      reasoning_effort: "high",
      search_parameters: {
        mode: "on",
        return_citations: true,
        sources: [
          { type: "web", safe_search: true },
          { type: "news", safe_search: true },
          { type: "x", x_handles: this.xHandles }
        ]
      },
      stream: false,
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = "auto"; // Let Grok decide when to use tools
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json() as GrokAPIResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No choices in API response');
      }

      const choice = data.choices[0];
      const fullContent = choice.message.content || '';
      const fullReasoning = choice.message.reasoning_content || '';
      const toolCalls = choice.message.tool_calls;
      
      // Parse citations
      const sourcesData = this.parseCitations(data.citations);

      return { 
        fullContent, 
        fullReasoning, 
        sourcesData,
        toolCalls,
        usage: data.usage
      };

    } catch (error) {
      console.error('Error in fetchFullGrokResponse:', error);
      throw error;
    }
  }

  public async streamGrokResponse(
    messages: Array<{ role: string; content: string }>,
    onChunk: (content?: string, reasoning?: string) => void,
    onComplete: (
      content: string, 
      reasoning: string, 
      sources: Array<{ title: string; content: string; url?: string; }>,
      toolCalls?: GrokToolCall[],
      usage?: any
    ) => void,
    onError: (error: Error) => void,
    tools?: GrokTool[]
  ): Promise<void> {
    const payload: any = {
      model: this.model,
      messages,
      temperature: this.temperature,
      reasoning_effort: "high",
      search_parameters: {
        mode: "on",
        return_citations: true, 
        sources: [
          { type: "web", safe_search: true },
          { type: "news", safe_search: true },
          { type: "x", x_handles: this.xHandles }
        ]
      },
      stream: true,
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = "auto";
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream', 
        },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error from /api/grok-chat: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let finalCitations: Array<{ title: string; content: string; url?: string; }> = [];
      let jsonBuffer = '';
      let streamEndedByDoneSignal = false;
      let usage: any = null;
      let toolCalls: any[] = [];
      let currentToolCall: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        jsonBuffer += chunk;
        
        const lines = jsonBuffer.split('\n');
        jsonBuffer = lines.pop() || ''; // Keep the last incomplete line

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') {
              streamEndedByDoneSignal = true;
              break; 
            }
            
            try {
              const parsedJson = JSON.parse(dataStr) as GrokStreamChunk;

              if (parsedJson.choices && parsedJson.choices.length > 0) {
                const choice = parsedJson.choices[0];
                
                if (choice.delta) {
                  // Handle reasoning content separately
                  if (choice.delta.reasoning_content) {
                    accumulatedReasoning += choice.delta.reasoning_content;
                    onChunk(undefined, choice.delta.reasoning_content); 
                  }
                  
                  // Handle main content
                  if (choice.delta.content) {
                    accumulatedContent += choice.delta.content;
                    onChunk(choice.delta.content, undefined);
                  }

                  // Handle tool calls
                  if (choice.delta.tool_calls) {
                    for (const toolCallDelta of choice.delta.tool_calls) {
                      if (toolCallDelta.index !== undefined) {
                        if (!toolCalls[toolCallDelta.index]) {
                          toolCalls[toolCallDelta.index] = {
                            id: toolCallDelta.id || '',
                            type: toolCallDelta.type || 'function',
                            function: {
                              name: toolCallDelta.function?.name || '',
                              arguments: toolCallDelta.function?.arguments || ''
                            }
                          };
                        } else {
                          // Accumulate arguments
                          if (toolCallDelta.function?.arguments) {
                            toolCalls[toolCallDelta.index].function.arguments += toolCallDelta.function.arguments;
                          }
                        }
                      }
                    }
                  }
                }
              }
              
              // Handle citations - they appear in the final chunk
              if (parsedJson.citations && Array.isArray(parsedJson.citations)) {
                finalCitations = this.parseCitations(parsedJson.citations);
              }

              // Handle usage stats - also in final chunk
              if (parsedJson.usage) {
                usage = parsedJson.usage;
              }
              
            } catch (e) {
              console.warn('Error parsing stream JSON chunk:', e, 'Chunk:', dataStr);
            }
          }
        } 
        
        if (streamEndedByDoneSignal) break; 
      }
      
      onComplete(
        accumulatedContent, 
        accumulatedReasoning, 
        finalCitations,
        toolCalls.filter(tc => tc !== null),
        usage
      );

    } catch (error) {
      console.error('Error in GrokService streamMessage:', error);
      onError(error as Error);
    }
  }
}

export const grokService = new GrokService({
  apiKey: process.env.XAI_API_KEY || process.env.NEXT_PUBLIC_XAI_API_KEY || "", 
});

export type { ChatMessage, GrokAPIResponse, GrokStreamChunk };
