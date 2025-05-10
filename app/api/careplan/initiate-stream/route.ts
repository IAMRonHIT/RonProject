import { NextRequest, NextResponse } from 'next/server';

// The URL of the Python backend
const BACKEND_URL = 'http://localhost:5001/api/careplan/initiate-stream';

/**
 * Handle POST requests to /api/careplan/initiate-stream
 * Forwards the request to the Python backend to initiate a streaming session
 */
export async function POST(request: NextRequest) {
  try {
    // Get patient data from the request
    const patientData = await request.json();
    
    console.log('Initiating care plan streaming session');
    
    // Forward the request to the Python backend
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Stream initiation error: ${response.status}. Response: ${errorText}`);
      return NextResponse.json(
        { error: `Stream initiation error: ${response.status}. ${errorText}` },
        { status: response.status }
      );
    }
    
    // Return the response from the backend (should contain stream_id)
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error initiating stream:', error);
    return NextResponse.json(
      { error: `Stream initiation error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}