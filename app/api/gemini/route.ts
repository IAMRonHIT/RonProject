import { NextRequest, NextResponse } from 'next/server'

// Environment variables for API keys should be set in .env.local
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key is not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate request
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Prepare request to Gemini API - using a template approach
    const enhancedPrompt = `${body.prompt}

You are going to generate content to fill in a care plan template. Use the FHIR data and research findings to generate comprehensive content for each section. Be thorough and detailed. 

For each of the following sections, generate appropriate content that would fit in our existing template:

1. ASSESSMENT: A detailed assessment of the patient's condition based on the data provided. This should be comprehensive and clinically accurate.

2. IMPLEMENTATION: Specific implementation steps for the care plan. Include at least 6-8 specific, actionable steps with clear timeframes when appropriate.

3. EVALUATION: Criteria and timeframes for evaluating the effectiveness of the care plan. Include both short-term and long-term evaluation metrics.

The content should be medically accurate, comprehensive, and focused on the patient's specific condition. Provide detailed, in-depth content for each section that medical professionals would find valuable.

Format your response as a structured JSON object with these three sections.`;
    
    const geminiRequest = {
      contents: [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }]
        }
      ],
      generationConfig: {
        temperature: body.temperature ?? 0.2,
        maxOutputTokens: body.maxOutputTokens ?? 16384 // Set to maximum for gemini-2.0-flash-lite
      }
    }

    // Make request to Gemini API with API key as query parameter instead of auth header
    // This is the recommended approach for Google AI API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${GOOGLE_AI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    // Return the response from Gemini
    const data = await response.json()
    
    // Extract the text content from the response
    const content = data.candidates[0]?.content?.parts?.[0]?.text || ''
    
    // Parse the content to extract the care plan sections
    let carePlan = {
      assessment: '',
      implementation: '',
      evaluation: ''
    }
    
    try {
      // Look for JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[0])
        carePlan = {
          assessment: parsedJson.assessment || '',
          implementation: parsedJson.implementation || '',
          evaluation: parsedJson.evaluation || ''
        }
      } else {
        // Fallback to extracting sections by headers
        const assessmentMatch = content.match(/Assessment:([\s\S]*?)(?=Implementation:|$)/i)
        const implementationMatch = content.match(/Implementation:([\s\S]*?)(?=Evaluation:|$)/i)
        const evaluationMatch = content.match(/Evaluation:([\s\S]*?)(?=$)/i)
        
        carePlan = {
          assessment: assessmentMatch ? assessmentMatch[1].trim() : '',
          implementation: implementationMatch ? implementationMatch[1].trim() : '',
          evaluation: evaluationMatch ? evaluationMatch[1].trim() : ''
        }
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error)
      // If parsing fails, return the raw content
      carePlan = {
        assessment: 'Error parsing response. Please check the raw output.',
        implementation: '',
        evaluation: ''
      }
    }
    
    // Generate updated FHIR JSON
    // In a real implementation, this would be more sophisticated
    const fhirJson = `{
      "resourceType": "CarePlan",
      "status": "active",
      "intent": "plan",
      "title": "Generated Care Plan",
      "extension": [
        {
          "url": "http://example.org/fhir/StructureDefinition/adpie-nursing-process",
          "extension": [
            {
              "url": "assessment",
              "valueString": "${carePlan.assessment.replace(/"/g, '\\"')}"
            },
            {
              "url": "implementation",
              "valueString": "${carePlan.implementation.replace(/"/g, '\\"')}"
            },
            {
              "url": "evaluation",
              "valueString": "${carePlan.evaluation.replace(/"/g, '\\"')}"
            }
          ]
        }
      ]
    }`
    
    // Extract the React component code from the response
    const reactComponentCode = content.trim()
    
    // Return the processed response with React component code
    return NextResponse.json({
      carePlan,
      fhirJson,
      reactComponentCode,
      rawResponse: data
    })
  } catch (error) {
    console.error('Error in Gemini API route:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
