import { NextRequest } from 'next/server';

// Function to handle SSE events from Python backend and ensure reasoning tokens, citations, and JSON are properly processed
export async function GET(request: NextRequest) {
  try {
    // Get the streamId from query parameters
    const streamId = request.nextUrl.searchParams.get('streamId');
    
    if (!streamId) {
      return new Response('Missing streamId parameter', { status: 400 });
    }
    
    // Connect to the Python backend's streaming endpoint
    const url = `http://localhost:5001/api/careplan/stream?streamId=${streamId}`;
    console.log(`Connecting to Python backend at: ${url}`);
    
    // Create a readable stream that processes and enhances SSE from the Python backend
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Connect to the Python backend
          const response = await fetch(url, {
            headers: {
              'Accept': 'text/event-stream',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error: ${response.status} ${errorText}`);
            controller.error(`Backend error: ${response.status} ${errorText}`);
            return;
          }
          
          if (!response.body) {
            console.error('No response body from backend');
            controller.error('No response body from backend');
            return;
          }

          const reader = response.body.getReader();
          let buffer = '';
          
          // Process and forward chunks from the backend
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Process the chunk to ensure all data types are properly handled
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Split by SSE event format
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const eventData = line.slice(5).trim();
                if (eventData === '[DONE]') {
                  // Forward the done signal
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  continue;
                }
                
                try {
                  // Parse the event to see if we need to handle special cases
                  const parsedEvent = JSON.parse(eventData);
                  
                  // Handle reasoning chunks specially to ensure they're properly formatted
                  if (parsedEvent.type === 'section_reasoning_chunk' && !parsedEvent.content.trim()) {
                    // Skip empty reasoning chunks
                    continue;
                  }
                  
                  // Make sure reasoning chunks are properly formatted
                  if (parsedEvent.type === 'section_reasoning_complete' && !parsedEvent.full_reasoning_markdown) {
                    console.warn('Missing full_reasoning_markdown in section_reasoning_complete event, injecting placeholder');
                    parsedEvent.full_reasoning_markdown = '**AI Reasoning**\n\nGenerating clinical reasoning for this section...';
                  }
                  
                  // Handle sources/citations data
                  if (parsedEvent.type === 'sources_data' && (!parsedEvent.data || !Array.isArray(parsedEvent.data))) {
                    console.warn('Missing or invalid sources_data, injecting placeholder');
                    parsedEvent.data = [{
                      title: 'No citations available',
                      url: '#',
                      snippet: 'Citations data could not be retrieved from the AI.'
                    }];
                  }
                  
                  // Forward the processed event with its original type
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsedEvent)}\n\n`));
                } catch (parseError) {
                  console.error('Error parsing event data:', parseError, eventData);
                  // If we can't parse the event, forward it as an error
                  const errorEvent = {
                    type: 'section_error',
                    section_id: 'streaming',
                    display_name: 'Streaming Process',
                    content: `Failed to parse event: ${parseError instanceof Error ? parseError.message : String(parseError)}`
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                }
              } else if (line.trim()) {
                // Forward any non-empty, non-data line as is
                controller.enqueue(encoder.encode(`${line}\n\n`));
              }
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          // Send an error event that can be handled by the frontend
          const errorEvent = {
            type: 'section_error',
            section_id: 'streaming',
            display_name: 'Streaming Process',
            content: error instanceof Error ? error.message : String(error)
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      }
    });

    // Return the enhanced streaming response
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
