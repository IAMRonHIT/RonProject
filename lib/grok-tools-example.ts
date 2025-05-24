// Example implementation of Grok tool calling for healthcare domain
import { grokService, GrokTool, GrokToolCall } from '@/services/grokService';

// Define healthcare-specific tools
export const healthcareTools: GrokTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_medical_literature',
      description: 'Search PubMed and medical databases for relevant research',
      parameters: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'Search query for medical literature' 
          },
          filters: {
            type: 'object',
            properties: {
              yearRange: { 
                type: 'object',
                properties: {
                  start: { type: 'number' },
                  end: { type: 'number' }
                }
              },
              studyTypes: {
                type: 'array',
                items: { 
                  type: 'string',
                  enum: ['clinical-trial', 'meta-analysis', 'review', 'case-study']
                }
              }
            }
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_clinical_guidelines',
      description: 'Retrieve current clinical practice guidelines from major medical organizations',
      parameters: {
        type: 'object',
        properties: {
          condition: { 
            type: 'string', 
            description: 'Medical condition or diagnosis' 
          },
          organization: {
            type: 'string',
            enum: ['AHA', 'ACC', 'ADA', 'WHO', 'CDC', 'NIH'],
            description: 'Medical organization'
          },
          guidelineType: {
            type: 'string',
            enum: ['diagnosis', 'treatment', 'prevention', 'screening'],
            description: 'Type of guideline'
          }
        },
        required: ['condition']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_clinical_score',
      description: 'Calculate various clinical risk scores and assessments',
      parameters: {
        type: 'object',
        properties: {
          scoreType: {
            type: 'string',
            enum: ['CHADS2', 'CHA2DS2-VASc', 'HAS-BLED', 'MELD', 'APACHE-II', 'Glasgow-Coma'],
            description: 'Type of clinical score to calculate'
          },
          parameters: {
            type: 'object',
            description: 'Score-specific parameters',
            additionalProperties: true
          }
        },
        required: ['scoreType', 'parameters']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_drug_interactions',
      description: 'Check for drug-drug interactions and contraindications',
      parameters: {
        type: 'object',
        properties: {
          medications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dose: { type: 'string' },
                frequency: { type: 'string' }
              },
              required: ['name']
            },
            description: 'List of medications to check'
          },
          patientFactors: {
            type: 'object',
            properties: {
              age: { type: 'number' },
              renalFunction: { type: 'string', enum: ['normal', 'mild-impairment', 'moderate-impairment', 'severe-impairment'] },
              hepaticFunction: { type: 'string', enum: ['normal', 'mild-impairment', 'moderate-impairment', 'severe-impairment'] },
              conditions: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['medications']
      }
    }
  }
];

// Mock tool execution functions (in real implementation, these would call actual APIs)
export async function executeTool(toolCall: GrokToolCall): Promise<any> {
  const { name, arguments: args } = toolCall.function;
  const parsedArgs = JSON.parse(args);

  switch (name) {
    case 'search_medical_literature':
      return {
        results: [
          {
            title: "Recent Advances in Type 2 Diabetes Management",
            authors: ["Smith J", "Johnson K"],
            journal: "New England Journal of Medicine",
            year: 2024,
            abstract: "A comprehensive review of current treatment strategies...",
            pmid: "38456789"
          }
        ],
        totalResults: 1,
        searchQuery: parsedArgs.query
      };

    case 'get_clinical_guidelines':
      return {
        guideline: {
          title: `${parsedArgs.organization || 'ADA'} Guidelines for ${parsedArgs.condition}`,
          lastUpdated: "2024-01",
          recommendations: [
            "HbA1c target <7% for most adults",
            "Individualize targets based on patient factors",
            "Metformin as first-line therapy"
          ],
          evidenceLevel: "A",
          url: "https://professional.diabetes.org/guidelines"
        }
      };

    case 'calculate_clinical_score':
      // Example for CHADS2 score
      if (parsedArgs.scoreType === 'CHADS2') {
        const params = parsedArgs.parameters;
        let score = 0;
        if (params.chf) score += 1;
        if (params.hypertension) score += 1;
        if (params.age >= 75) score += 1;
        if (params.diabetes) score += 1;
        if (params.priorStroke) score += 2;
        
        return {
          score,
          interpretation: score >= 2 ? "High risk - anticoagulation recommended" : "Low-moderate risk",
          annualStrokeRisk: `${[0.6, 2.2, 3.2, 4.8, 7.2, 9.7][Math.min(score, 5)]}%`
        };
      }
      break;

    case 'check_drug_interactions':
      return {
        interactions: [
          {
            severity: "moderate",
            drugs: [parsedArgs.medications[0]?.name, parsedArgs.medications[1]?.name],
            description: "May increase risk of hypoglycemia",
            recommendation: "Monitor blood glucose closely"
          }
        ],
        contraindications: [],
        renalAdjustments: parsedArgs.patientFactors?.renalFunction !== 'normal' ? 
          ["Consider dose adjustment for metformin"] : []
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Example usage with tool calling
export async function performClinicalAnalysis(patientCase: string) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a clinical decision support AI. Use available tools to provide evidence-based recommendations.'
      },
      {
        role: 'user',
        content: patientCase
      }
    ];

    // First call - Grok will analyze and potentially request tool calls
    const response = await grokService.fetchFullGrokResponse(messages, healthcareTools);
    
    // If tool calls were requested, execute them
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults = await Promise.all(
        response.toolCalls.map(async (toolCall) => ({
          toolCallId: toolCall.id,
          result: await executeTool(toolCall)
        }))
      );

      // Send tool results back to Grok for final analysis
      const messagesWithTools = [
        ...messages,
        {
          role: 'assistant',
          content: response.fullContent,
          tool_calls: response.toolCalls
        },
        ...toolResults.map(result => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: result.toolCallId
        }))
      ];

      // Get final response incorporating tool results
      const finalResponse = await grokService.fetchFullGrokResponse(messagesWithTools);
      
      return {
        analysis: finalResponse.fullContent,
        reasoning: finalResponse.fullReasoning,
        sources: finalResponse.sourcesData,
        toolsUsed: response.toolCalls.map(tc => tc.function.name),
        usage: {
          initial: response.usage,
          final: finalResponse.usage,
          totalReasoningTokens: (response.usage?.reasoning_tokens || 0) + 
                                (finalResponse.usage?.reasoning_tokens || 0)
        }
      };
    }

    // No tools needed, return direct response
    return {
      analysis: response.fullContent,
      reasoning: response.fullReasoning,
      sources: response.sourcesData,
      toolsUsed: [],
      usage: {
        initial: response.usage,
        totalReasoningTokens: response.usage?.reasoning_tokens || 0
      }
    };

  } catch (error) {
    console.error('Error in clinical analysis:', error);
    throw error;
  }
}

// Example: Specific X handles for medical Twitter accounts
export const medicalXHandles = [
  "NEJM",           // New England Journal of Medicine
  "TheLancet",      // The Lancet
  "JAMA_current",   // JAMA
  "nature",         // Nature
  "CDCgov",         // CDC
  "WHO",            // World Health Organization
  "NIH",            // National Institutes of Health
  "FDAapproved",    // FDA
  "HopkinsMedicine", // Johns Hopkins
  "MayoClinic",     // Mayo Clinic
  "ClevelandClinic", // Cleveland Clinic
  "StanfordMed",    // Stanford Medicine
  "HarvardMed",     // Harvard Medical School
  "AmerMedicalAssn", // American Medical Association
  "ACPinternists",  // American College of Physicians
  "AHAorg",         // American Heart Association
  "AmericanCancer", // American Cancer Society
  "DiabetesOrg",    // American Diabetes Association
  "alzheimerorg",   // Alzheimer's Association
  "WebMD"           // WebMD
];
