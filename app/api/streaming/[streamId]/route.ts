import { NextRequest } from 'next/server';

// This function handles streaming requests by proxying them to the Python backend
export async function GET(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  const streamId = params.streamId;
  
  // Stream response directly from the Python backend
  const url = `http://localhost:5001/api/careplan/stream?streamId=${streamId}`;
  
  // Use the ReadableStream API to stream the response
  const encoder = new TextEncoder();
  
  try {
    // Create a readable stream that forwards data from the Python backend
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Fetch from Python backend with no-transform to preserve chunking
          const response = await fetch(url, {
            headers: {
              'Accept': 'text/event-stream',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            controller.error(`Backend error: ${response.status} ${errorText}`);
            return;
          }
          
          if (!response.body) {
            controller.error('No response body from backend');
            return;
          }

          const reader = response.body.getReader();
          
          // Read and forward chunks from the backend
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in streaming route:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
    });
  }
}
