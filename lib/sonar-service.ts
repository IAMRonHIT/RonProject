import { FormState } from '@/components/careplangenerator/PatientDataForm';

export interface ReasoningStep {
  header: string;
  content: string;
}

export interface Citation {
  id: string;
  title: string;
  type: string;
  url: string;
  snippet: string;
  retrieval_date: string;
  agent_source: string;
}

export interface SonarResponse {
  reasoning: string;
  json_data: any;
  reasoning_steps: ReasoningStep[];
  citations?: Citation[];
}

export class SonarService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = '/api/careplan';
  }
  
  // Removed generateCarePlan method as non-streaming is deprecated
  
  /**
   * Initiates a streaming session by sending patient data to the backend
   * and retrieving a stream ID for subsequent streaming connection
   *
   * @param patientData - The patient data to process
   * @returns A Promise resolving to the stream ID for this session
   */
  async initiateStream(patientData: FormState): Promise<string> {
    try {
      console.log('Initiating streaming care plan generation');
      
      const response = await fetch(`${this.apiUrl}/initiate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Stream initiation error: ${response.status}. Response: ${errorText}`);
        throw new Error(`Stream initiation error: ${response.status}. ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.stream_id) {
        throw new Error('No stream ID returned from backend');
      }
      
      console.log(`Stream initiated with ID: ${data.stream_id}`);
      return data.stream_id;
    } catch (error) {
      console.error('Error initiating streaming session:', error);
      throw new Error(`Failed to initiate streaming session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiates a sequential, multi-stage streaming session.
   *
   * @param patientFormData - The patient form data
   * @param careEnvironment - The selected care environment
   * @param focusAreas - The selected focus areas
   * @returns A Promise resolving to the stream ID for this session
   */
  async initiateSequentialStream(
    patientFormData: FormState,
    careEnvironment: string,
    focusAreas: string[]
  ): Promise<string> {
    try {
      console.log('Initiating sequential streaming care plan generation');
      const payload = {
        patient_form_data: patientFormData,
        care_environment: careEnvironment,
        focus_areas: focusAreas,
      };
      
      const response = await fetch(`${this.apiUrl}/initiate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Sequential stream initiation error: ${response.status}. Response: ${errorText}`);
        throw new Error(`Sequential stream initiation error: ${response.status}. ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.stream_id) {
        throw new Error('No stream ID returned from backend for sequential stream');
      }
      
      console.log(`Sequential stream initiated with ID: ${data.stream_id}`);
      return data.stream_id;
    } catch (error) {
      console.error('Error initiating sequential streaming session:', error);
      throw new Error(`Failed to initiate sequential streaming session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Constructs the URL for connecting to the streaming endpoint
   *
   * @param streamId - The stream ID obtained from initiateStream
   * @returns The complete URL for the EventSource connection
   */
  getStreamingUrl(streamId: string): string {
    return `${this.apiUrl}/stream?streamId=${streamId}`;
  }

  /**
   * Extracts reasoning from <think> tags and the subsequent JSON object from content.
   * @param content - The string content containing reasoning and JSON.
   * @returns An object with 'reasoning' and 'jsonData'.
   */
  static extractReasoningAndJson(content: string): { reasoning: string; jsonData: any } {
    // Extract reasoning between <think> and </think> tags
    const thinkStartTag = '<think>';
    const thinkEndTag = '</think>';
    
    const thinkStartIndex = content.indexOf(thinkStartTag);
    const thinkEndIndex = content.indexOf(thinkEndTag);
    
    let reasoning = "";
    let jsonString = "";
    let jsonData = null;

    if (thinkStartIndex !== -1 && thinkEndIndex !== -1 && thinkEndIndex > thinkStartIndex) {
      reasoning = content.substring(thinkStartIndex + thinkStartTag.length, thinkEndIndex).trim();
      // Find JSON after the </think> tag
      const jsonStartIndex = content.indexOf('{', thinkEndIndex);
      if (jsonStartIndex !== -1) {
        jsonString = content.substring(jsonStartIndex);
      } else {
        // If no JSON after think tags, maybe the entire content after think is JSON or something else
        // For now, we assume JSON follows, if not, jsonString remains empty.
        console.warn('No JSON object found after </think> tag. Attempting to parse remaining content if any.');
        jsonString = content.substring(thinkEndIndex + thinkEndTag.length).trim();
        if (!jsonString.startsWith('{')) {
            jsonString = ""; // Not a JSON object
        }
      }
    } else {
      // Fallback: No <think> tags found, or they are malformed. Try to find JSON anywhere.
      const jsonStartIndex = content.indexOf('{');
      if (jsonStartIndex !== -1) {
        reasoning = content.substring(0, jsonStartIndex).trim(); // Content before JSON is considered reasoning
        jsonString = content.substring(jsonStartIndex);
      } else {
        // No JSON and no think tags, assume all content is reasoning (or an error message)
        reasoning = content.trim();
        jsonString = ""; // No JSON part
      }
    }
    
    if (jsonString) {
      try {
        jsonData = JSON.parse(jsonString);
      } catch (e) {
        console.error(`Failed to parse JSON from response: ${e}. JSON string was:`, jsonString);
        // Keep jsonData as null, reasoning might still be useful
        jsonData = null; 
        // Optionally, append JSON parsing error to reasoning or handle as an error state
        reasoning += `\n[Error parsing JSON: ${e instanceof Error ? e.message : String(e)}]`;
      }
    }
    
    return { reasoning, jsonData };
  }
  
  async testBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/careplan/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      await response.json();
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}
