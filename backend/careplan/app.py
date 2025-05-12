#!/usr/bin/env python3
"""
Care Plan Generator Backend
--------------------------
Flask app that interfaces with Perplexity's Sonar Reasoning Pro API to generate care plans.
"""

import os
import json
import uuid
import time
import sys
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from perplexity_client import get_perplexity_client

# Load environment variables
load_dotenv()

# Configuration
SONAR_API_KEY = os.environ.get('SONAR_API_KEY')
CARE_PLAN_SERVER_PORT = int(os.environ.get('CARE_PLAN_SERVER_PORT', 5001))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Store active streams
active_streams = {}

# Validate API key
if not SONAR_API_KEY:
    print("ERROR: SONAR_API_KEY environment variable is not set.")
    print("Please set it to your Perplexity API key.")
    sys.exit(1)

# Initialize the Perplexity client
print("Attempting to initialize Perplexity client...")
try:
    perplexity_client = get_perplexity_client()
    print("Perplexity client initialized successfully.")
except Exception as e:
    print(f"ERROR: Failed during Perplexity client initialization: {str(e)}")
    import traceback
    traceback.print_exc() # Print full traceback for detailed debugging
    sys.exit(1)

@app.route('/api/healthcheck', methods=['GET'])
def healthcheck():
    """Basic healthcheck endpoint"""
    return jsonify({"status": "ok", "message": "Care Plan API is running"}), 200

@app.route('/api/careplan/test', methods=['POST'])
def test_connection():
    """Test endpoint to verify the backend is running and API key is available"""
    try:
        # Verify the API key by making a minimal request to Perplexity
        # This will use the client's _validate_api_key method indirectly
        get_perplexity_client()
        
        return jsonify({
            "status": "success",
            "message": "Connection to Perplexity API successful",
            "timestamp": time.time()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Backend error: {str(e)}",
            "timestamp": time.time()
        }), 500

# Removed non-streaming route /api/careplan

@app.route('/api/careplan/initiate-stream', methods=['POST'])
def initiate_stream():
    """Start a streaming session and return a stream ID"""
    try:
        # Generate a random stream ID
        stream_id = str(uuid.uuid4())
        
        # Store the patient data for this stream
        active_streams[stream_id] = {
            "patient_data": request.json,
            "created_at": time.time()
        }
        
        # Return the stream ID
        return jsonify({"stream_id": stream_id})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def stream_generator(stream_id):
    """Generate a stream of events for the care plan generation process"""
    try:
        if stream_id not in active_streams:
            yield f"data: {json.dumps({'type': 'error', 'content': 'Invalid stream ID'})}\n\n"
            return
            
        patient_data = active_streams[stream_id]["patient_data"]
        
        # Send SSE events as the stream progresses
        yield f"data: {json.dumps({'type': 'start', 'content': 'Starting care plan generation'})}\n\n"
        
        # Use the Perplexity client to stream the care plan generation
        for chunk in perplexity_client.stream_full_care_plan_sequentially(patient_data["patient_form_data"], patient_data["care_environment"], patient_data["focus_areas"]):
            # Forward the chunk to the client
            yield f"data: {json.dumps(chunk)}\n\n"
        
        # Clean up the stream
        if stream_id in active_streams:
            del active_streams[stream_id]
            
        # Signal the end of the stream
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        print(f"Stream error: {str(e)}")
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
        yield "data: [DONE]\n\n"
        
        # Clean up on error
        if stream_id in active_streams:
            del active_streams[stream_id]

@app.route('/api/careplan/stream', methods=['GET'])
def stream_route():
    """SSE endpoint for streaming care plan generation"""
    try:
        stream_id = request.args.get('streamId')
        if not stream_id:
            return jsonify({"error": "No stream ID provided"}), 400
            
        # Create a streaming response
        return Response(
            stream_with_context(stream_generator(stream_id)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"Starting Care Plan Generator backend on port {CARE_PLAN_SERVER_PORT}")
    print(f"API Key: {'CONFIGURED' if SONAR_API_KEY else 'MISSING'}")
    app.run(host='0.0.0.0', port=CARE_PLAN_SERVER_PORT, debug=True)
