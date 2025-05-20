/**
 * Service to interact with Sonar Reasoning Pro API
 */

interface SonarMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SonarServiceOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

interface StreamCallback {
  (content: string, reasoning: string | null, isComplete: boolean): void;
}

class SonarService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options: SonarServiceOptions) {
    this.apiKey = options.apiKey || '';
    this.baseUrl = options.baseUrl || 'https://api.sonar.software';
    this.model = options.model || 'reasoning-pro';
  }

  /**
   * Send a request to the Sonar API and receive the full response
   * @param messages The conversation history
   * @returns The complete response from Sonar
   */
  async sendRequest(messages: SonarMessage[]): Promise<{
    response: string;
    reasoning: string | null;
  }> {
    if (!this.apiKey) {
      throw new Error('Sonar API key is not configured.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Sonar API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Extract reasoning from <think> tags if present
      const { mainContent, reasoning } = this.extractReasoning(content);

      return {
        response: mainContent,
        reasoning,
      };
    } catch (error) {
      console.error('Error calling Sonar API:', error);
      throw error;
    }
  }

  /**
   * Stream a response from Sonar API
   * @param messages The conversation history
   * @param callback Function called for each chunk with content and reasoning
   */
  async streamResponse(
    messages: SonarMessage[],
    callback: StreamCallback
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Sonar API key is not configured.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Sonar API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader could not be created');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';
      let isThinking = false;
      let reasoning = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Final extraction and cleanup
          const { mainContent, reasoning: finalReasoning } = this.extractReasoning(accumulatedContent);
          callback(mainContent, finalReasoning || reasoning, true);
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process each line in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          
          // Extract data part
          const match = line.match(/^data: (.+)$/);
          if (!match) continue;

          try {
            const data = JSON.parse(match[1]);
            const content = data.choices[0]?.delta?.content || '';
            
            // Add to accumulated content
            accumulatedContent += content;
            
            // Check for thinking tags
            if (content.includes('<think>')) {
              isThinking = true;
            }
            
            if (isThinking && content.includes('</think>')) {
              isThinking = false;
            }
            
            // Extract reasoning and content
            const { mainContent, reasoning: extractedReasoning } = this.extractReasoning(accumulatedContent);
            
            if (extractedReasoning) {
              reasoning = extractedReasoning;
            }
            
            // Send update via callback
            callback(mainContent, reasoning, false);
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from Sonar API:', error);
      throw error;
    }
  }

  /**
   * Extract reasoning from <think> tags and return clean content
   * @param content The raw content from Sonar
   * @returns Object with main content and reasoning
   */
  extractReasoning(content: string): {
    mainContent: string;
    reasoning: string | null;
  } {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/;
    const match = content.match(thinkRegex);

    if (match) {
      const reasoning = match[1].trim();
      const mainContent = content.replace(thinkRegex, '').trim();
      return { mainContent, reasoning };
    }

    return { mainContent: content, reasoning: null };
  }
}

/**
 * Create a singleton SonarService instance
 * @param apiKey The Sonar API key
 * @param options Additional options
 * @returns A configured SonarService instance
 */
export function createSonarService(apiKey?: string, options: Partial<SonarServiceOptions> = {}): SonarService {
  return new SonarService({
    apiKey: apiKey || '',
    ...options,
  });
}

export default SonarService;
