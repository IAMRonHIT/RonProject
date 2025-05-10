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
   * Constructs the URL for connecting to the streaming endpoint
   *
   * @param streamId - The stream ID obtained from initiateStream
   * @returns The complete URL for the EventSource connection
   */
  getStreamingUrl(streamId: string): string {
    return `${this.apiUrl}/stream?streamId=${streamId}`;
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
