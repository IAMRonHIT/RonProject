import { NextRequest, NextResponse } from 'next/server';

// The URL of the Python backend test endpoint
const BACKEND_URL = 'http://localhost:5001/api/careplan/test';

/**
 * Handle POST requests to /api/careplan/test
 * Verifies that the Python backend is running and the API key is available
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Testing backend connection...');
    
    // Forward the request to the Python backend
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend test failed: ${response.status}. Response: ${errorText}`);
      return NextResponse.json(
        { error: `Backend test failed: ${response.status}. ${errorText}` },
        { status: response.status }
      );
    }
    
    // Return the response from the backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error testing backend connection:', error);
    return NextResponse.json(
      { error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}