# Care Plan Generator - Python Backend

This is the Python backend for the Care Plan Generator. It integrates with the Perplexity Sonar Reasoning Pro API to generate comprehensive care plans.

## Quick Start

The easiest way to run the complete care plan generator (both frontend and backend) is with the npm script:

```bash
# From the project root directory
npm run careplan
```

This will start both the Python backend on port 5001 and the Next.js frontend on port 3000, with the Perplexity API key already configured.

## Setup

If you want to set up the backend manually:

1. Create a virtual environment (optional, but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your Perplexity API key:
   ```bash
   export SONAR_API_KEY=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
   ```

## Running the Backend Manually

You can start the server manually:

```bash
python app.py
```

Or use the provided startup script:

```bash
./start_server.sh
```

The server will run on port 5001 by default. You can change this by setting the `CARE_PLAN_SERVER_PORT` environment variable.

## API Endpoints

### Generate Care Plan (Non-Streaming)

- **URL**: `/api/careplan/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**: Patient data object
- **Response**: JSON object containing:
  - `reasoning`: Clinical reasoning text
  - `json_data`: Structured care plan data
  - `reasoning_steps`: Array of structured reasoning steps

### Generate Care Plan (Streaming)

- **URL**: `/api/careplan/generate/stream`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Accept**: `text/event-stream`
- **Request Body**: Patient data object
- **Response**: Server-Sent Events (SSE) with the following event types:
  - `reasoning`: Chunks of reasoning text
  - `json`: Chunks of JSON data
  - `complete`: Final response with all data
  - `error`: Error information (if applicable)

## Testing

A test script is provided to test the API endpoints:

```bash
# Test non-streaming endpoint
python test_api.py

# Test streaming endpoint
python test_api.py --stream
```

## NPM Scripts

Several npm scripts are available from the project root:

```bash
# Start everything (Next.js, RAG, and Care Plan Python backend)
npm run dev

# Start only the care plan feature (Python backend + Next.js)
npm run careplan

# Start without the care plan backend
npm run dev:without-careplan

# Start just the Python backend for care plan
npm run dev:careplan
```

## Environment Variables

- `SONAR_API_KEY`: Your Perplexity API key (already configured in scripts)
- `CARE_PLAN_SERVER_PORT`: Port for the Python backend (default: 5001)
- `FLASK_DEBUG`: Set to 1 for debug mode (default: 1 in development)