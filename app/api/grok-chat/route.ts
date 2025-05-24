import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

// Helper to convert Node.js Readable stream to Web ReadableStream
function nodeReadableToWebReadableStream(nodeReadable: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeReadable.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      nodeReadable.on('end', () => {
        controller.close();
      });
      nodeReadable.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeReadable.destroy();
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages, 
      temperature, 
      reasoning_effort, 
      search_parameters, 
      stream,
      tools,
      tool_choice 
    } = body;

    const grokApiKey = process.env.XAI_API_KEY;
    if (!grokApiKey) {
      return NextResponse.json({ error: 'XAI_API_KEY is not configured' }, { status: 500 });
    }

    const grokEndpoint = 'https://api.x.ai/v1/chat/completions';

    const payload: any = {
      model: 'grok-3-mini-fast',
      messages,
      temperature: temperature ?? 0.7,
      reasoning_effort: reasoning_effort || "high",
      search_parameters: search_parameters || { 
        mode: "on", 
        return_citations: true 
      },
      stream: stream !== undefined ? stream : true,
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      payload.tools = tools;
      if (tool_choice) {
        payload.tool_choice = tool_choice;
      }
    }

    const grokResponse = await fetch(grokEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!grokResponse.ok) {
      const errorBody = await grokResponse.text();
      console.error(`Grok API Error: ${grokResponse.status} ${grokResponse.statusText}`, errorBody);
      
      // Parse error for better client handling
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorBody);
      } catch {
        errorDetail = { message: errorBody };
      }
      
      return NextResponse.json(
        { 
          error: `Grok API Error: ${grokResponse.status}`, 
          details: errorDetail 
        },
        { status: grokResponse.status }
      );
    }

    if (!grokResponse.body) {
      return NextResponse.json({ error: 'No response body from Grok API' }, { status: 500 });
    }
    
    if (payload.stream) {
      // For streaming responses, pass through the SSE stream
      return new Response(grokResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable Nginx buffering
        },
      });
    } else {
      // For non-streaming, return the JSON response with usage info
      const jsonResponse = await grokResponse.json();
      return NextResponse.json(jsonResponse);
    }

  } catch (error: any) {
    console.error('Error in /api/grok-chat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
