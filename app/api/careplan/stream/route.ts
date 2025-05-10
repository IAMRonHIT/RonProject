import { NextRequest } from 'next/server';

// The URL of the Python backend
const BACKEND_URL = 'http://localhost:5001/api/careplan/stream';

/**
 * Handle GET requests to /api/careplan/stream
 * Forwards streaming events from the Python backend to the client
 */
export async function GET(request: NextRequest) {
  try {
    // Get the streamId from the query parameters
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    
    if (!streamId) {
      return new Response(
        JSON.stringify({ error: 'No stream ID provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    console.log(`Connecting to stream: ${streamId}`);
    
    // Connect to the Python backend's streaming endpoint
    const backendUrl = `${BACKEND_URL}?streamId=${streamId}`;
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Stream connection error: ${backendResponse.status}. Response: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Stream connection error: ${backendResponse.status}. ${errorText}` }),
        {
          status: backendResponse.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Get the response body as a ReadableStream
    const backendStream = backendResponse.body;
    
    if (!backendStream) {
      return new Response(
        JSON.stringify({ error: 'Backend did not provide a readable stream' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Return the stream directly to the client with SSE headers
    return new Response(backendStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error in stream proxy:', error);
    return new Response(
      JSON.stringify({ error: `Stream error: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Explicitly set the runtime to edge for streaming support
export const runtime = 'edge';