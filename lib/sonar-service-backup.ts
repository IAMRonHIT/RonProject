import { PatientData } from '@/components/careplangenerator/PatientDataForm';

// API response type for Perplexity Sonar API
interface SonarResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Streaming response type
interface SonarStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

// Care plan interface that matches our expected JSON schema
export interface CarePlan {
  title: string;
  patientInfo: {
    age: number;
    gender: string;
    ethnicity: string;
  };
  clinicalAssessment: {
    primaryDiagnosis: string;
    secondaryDiagnoses: string[];
    relevantHistory: string;
    vitalSigns?: string;
    labResults?: string;
  };
  socialDeterminants: string[];
  carePlanGoals: {
    shortTerm: string[];
    longTerm: string[];
  };
  interventions: {
    category: string;
    description: string;
    frequency: string;
    responsibleParty: string;
  }[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    specialInstructions: string;
  }[];
  education: string[];
  followUp: {
    timing: string;
    provider: string;
    instructions: string;
  };
  evidenceBase: {
    guidelineSource: string;
    publicationDate: string;
    keyRecommendations: string[];
  }[];
}

// Define a type for the callbacks when streaming
type StreamCallbacks = {
  onReasoningToken: (token: string) => void;
  onJsonToken: (token: string) => void;
  onComplete: (finalResponse: string, extractedJson: CarePlan | null) => void;
  onError: (error: Error) => void;
};

export class SonarService {
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai';
  private model: string = 'sonar-reasoning-pro';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Convert patient data to FHIR format (simplified)
  private convertToFHIR(patientData: PatientData) {
    return {
      resourceType: "Patient",
      gender: patientData.gender.toLowerCase(),
      age: patientData.age,
      ethnicGroup: {
        coding: [
          {
            display: patientData.ethnicity
          }
        ]
      },
      extension: [
        {
          url: "http://hl7.org/fhir/StructureDefinition/patient-socialDeterminants",
          valueCodeableConcept: {
            coding: patientData.socialDeterminants.map(sdoh => ({
              display: sdoh
            }))
          }
        },
        {
          url: "http://hl7.org/fhir/StructureDefinition/patient-insurance",
          valueCodeableConcept: {
            coding: [
              {
                display: patientData.primaryInsurance
              },
              ...(patientData.secondaryInsurance ? [{
                display: patientData.secondaryInsurance
              }] : []),
              ...(patientData.tertiaryInsurance ? [{
                display: patientData.tertiaryInsurance
              }] : [])
            ]
          }
        }
      ],
      condition: [
        {
          resourceType: "Condition",
          code: {
            text: patientData.primaryDiagnosis
          },
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/condition-category",
                  code: "problem-list-item",
                  display: "Problem List Item"
                }
              ]
            }
          ],
          subject: {
            reference: "Patient"
          }
        },
        ...patientData.coMorbidities.map(comorbidity => ({
          resourceType: "Condition",
          code: {
            text: comorbidity
          },
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/condition-category",
                  code: "problem-list-item",
                  display: "Problem List Item"
                }
              ]
            }
          ],
          subject: {
            reference: "Patient"
          }
        }))
      ],
      hospitalization: patientData.hospitalized ? {
        extension: [
          {
            url: "http://hl7.org/fhir/StructureDefinition/patient-levelOfCare",
            valueString: patientData.levelOfCare
          }
        ]
      } : undefined
    };
  }

  // Generate the care plan using the Perplexity API - non-streaming version
  public async generateCarePlan(patientData: PatientData): Promise<{reasoning: string, carePlan: CarePlan}> {
    const patientFHIR = this.convertToFHIR(patientData);
    
    const systemPrompt = `You are an expert healthcare provider creating evidence-based care plans. 
    Using the patient information in FHIR format, develop a comprehensive care plan following best medical practices. 
    First provide your reasoning analyzing the patient's condition and applicable clinical guidelines in simple text format.
    Then on a new line, output a valid JSON object matching the expected schema.`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Patient information in FHIR format: ${JSON.stringify(patientFHIR)}`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { 
            schema: this.getCarePlanSchema()
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate care plan: ${error}`);
    }

    const data = await response.json() as SonarResponse;
    const content = data.choices[0]?.message?.content;
    
    // Extract reasoning and JSON parts
    const { reasoning, jsonData } = this.extractReasoningAndJson(content);
    
    return {
      reasoning,
      carePlan: jsonData
    };
  }

  // Generate the care plan with streaming - returns immediately and uses callbacks
  public async generateCarePlanStream(
    patientData: PatientData, 
    callbacks: StreamCallbacks
  ): Promise<void> {
    const patientFHIR = this.convertToFHIR(patientData);
    
    const systemPrompt = `You are an expert healthcare provider creating evidence-based care plans. 
    Using the patient information in FHIR format, develop a comprehensive care plan following best medical practices. 
    First provide your reasoning analyzing the patient's condition and applicable clinical guidelines in simple text format.
    Then on a new line, output a valid JSON object matching the expected schema.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Patient information in FHIR format: ${JSON.stringify(patientFHIR)}`
            }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { 
              schema: this.getCarePlanSchema()
            }
          },
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.text();
        callbacks.onError(new Error(`Failed to generate care plan: ${error}`));
        return;
      }

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError(new Error('Failed to get stream reader'));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';
      let jsonStarted = false;
      let jsonContent = '';
      let reasoningContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          fullResponse += decoder.decode(value, { stream: true });
          
          // Process complete lines
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, lineEndIndex);
            buffer = buffer.slice(lineEndIndex + 1);
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data) as SonarStreamChunk;
                const content = parsed.choices[0]?.delta?.content || '';
                
                // Simple logic - once we see a {, we've entered JSON territory
                if (!jsonStarted && content.includes('{')) {
                  // Split at the first '{'
                  const parts = content.split('{', 2);
                  jsonStarted = true;
                  
                  // Add any text before the { to reasoning
                  if (parts[0]) {
                    reasoningContent += parts[0];
                    callbacks.onReasoningToken(parts[0]);
                  }
                  
                  // Add the JSON part with the opening brace
                  const jsonPart = '{' + (parts[1] || '');
                  jsonContent += jsonPart;
                  callbacks.onJsonToken(jsonPart);
                } else if (jsonStarted) {
                  // Already in JSON section
                  jsonContent += content;
                  callbacks.onJsonToken(content);
                } else {
                  // Still in reasoning section
                  reasoningContent += content;
                  callbacks.onReasoningToken(content);
                }
              } catch (e) {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      } catch (e) {
        callbacks.onError(e as Error);
      } finally {
        reader.releaseLock();
      }

      // Final processing at the end of the stream
      try {
        // Get JSON from full response if not already extracted
        if (!jsonContent) {
          const result = this.extractReasoningAndJson(fullResponse);
          reasoningContent = result.reasoning;
          jsonContent = JSON.stringify(result.jsonData);
        }
        const extractedJson = jsonContent ? JSON.parse(jsonContent) as CarePlan : null;
        callbacks.onComplete(fullResponse, extractedJson);
      } catch (e) {
        callbacks.onError(new Error(`Failed to parse final JSON response: ${e}`));
      }
    } catch (e) {
      callbacks.onError(e as Error);
    }
  }

  // Extract reasoning and JSON from a complete response - simplest possible implementation
  private extractReasoningAndJson(content: string): { reasoning: string; jsonData: any } {
    // Find the first occurrence of '{' which should be the start of the JSON
    const jsonStartIndex = content.indexOf('{');
    
    if (jsonStartIndex === -1) {
      throw new Error('No JSON found in the response');
    }
    
    // Everything before the JSON is reasoning
    const reasoning = content.substring(0, jsonStartIndex).trim();
    
    // Everything from the first { is the JSON part
    let jsonString = content.substring(jsonStartIndex);
    
    try {
      const jsonData = JSON.parse(jsonString);
      return { reasoning, jsonData };
    } catch (e) {
      throw new Error(`Failed to parse JSON from response: ${e}`);
    }
  }

  // Get the care plan schema for the API request
  private getCarePlanSchema() {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the care plan"
        },
        patientInfo: {
          type: "object",
          properties: {
            age: { type: "integer" },
            gender: { type: "string" },
            ethnicity: { type: "string" }
          },
          required: ["age", "gender", "ethnicity"]
        },
        clinicalAssessment: {
          type: "object",
          properties: {
            primaryDiagnosis: { type: "string" },
            secondaryDiagnoses: { 
              type: "array",
              items: { type: "string" }
            },
            relevantHistory: { type: "string" },
            vitalSigns: { type: "string" },
            labResults: { type: "string" }
          },
          required: ["primaryDiagnosis", "secondaryDiagnoses", "relevantHistory"]
        },
        socialDeterminants: {
          type: "array",
          items: { type: "string" }
        },
        carePlanGoals: {
          type: "object",
          properties: {
            shortTerm: {
              type: "array",
              items: { type: "string" }
            },
            longTerm: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["shortTerm", "longTerm"]
        },
        interventions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              description: { type: "string" },
              frequency: { type: "string" },
              responsibleParty: { type: "string" }
            },
            required: ["category", "description", "frequency", "responsibleParty"]
          }
        },
        medications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              dosage: { type: "string" },
              frequency: { type: "string" },
              specialInstructions: { type: "string" }
            },
            required: ["name", "dosage", "frequency", "specialInstructions"]
          }
        },
        education: {
          type: "array",
          items: { type: "string" }
        },
        followUp: {
          type: "object",
          properties: {
            timing: { type: "string" },
            provider: { type: "string" },
            instructions: { type: "string" }
          },
          required: ["timing", "provider", "instructions"]
        },
        evidenceBase: {
          type: "array",
          items: {
            type: "object",
            properties: {
              guidelineSource: { type: "string" },
              publicationDate: { type: "string" },
              keyRecommendations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["guidelineSource", "publicationDate", "keyRecommendations"]
          }
        }
      },
      required: [
        "title", 
        "patientInfo", 
        "clinicalAssessment",
        "socialDeterminants",
        "carePlanGoals",
        "interventions",
        "education",
        "followUp",
        "evidenceBase"
      ]
    };
  }
}
