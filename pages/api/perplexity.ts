import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * Proxy API endpoint for Perplexity's Sonar Reasoning Pro API
 * This prevents exposing the API key in the frontend
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, model = 'sonar-reasoning-pro', systemPrompt } = req.body;

    // Validate required parameters
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Prepare the request to Perplexity API
    const perplexityUrl = 'https://api.perplexity.ai/query';
    const apiKey = process.env.SONAR_API_KEY;

    if (!apiKey) {
      console.error('SONAR_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API key configuration error' });
    }

    // Prepare the payload
    const payload = {
      model,
      query,
      search_recency_filter: 'month',
      search_context_size: 'high',
      emit_sources: true
    };

    // Add system prompt if provided
    if (systemPrompt) {
      payload['system_prompt'] = systemPrompt;
    }

    // Make the request to Perplexity API
    const response = await axios.post(perplexityUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Return the response
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error calling Perplexity API:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Unknown API error';
      
      if (status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      return res.status(status).json({ error: errorMessage });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({ error: 'No response received from API' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ error: error.message || 'Unknown error occurred' });
    }
  }
}
