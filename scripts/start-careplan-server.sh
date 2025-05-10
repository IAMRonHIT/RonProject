#!/bin/bash

# Set environment variables
export CARE_PLAN_SERVER_PORT=5001
export CARE_PLAN_API_URL=http://localhost:5001
export FLASK_DEBUG=1

# Create a named session for the Python backend
echo "Starting Python backend for care plan generation..."
cd "$(dirname "$0")/../backend/careplan"
./start_server.sh &
PYTHON_PID=$!

# Wait a moment for the Python backend to start
sleep 2

# Return to the root directory and start the Next.js server
cd "$(dirname "$0")/.."
echo "Starting Next.js server..."
npm run dev &
NEXTJS_PID=$!

# Function to kill processes on script termination
cleanup() {
  echo "Stopping servers..."
  kill $PYTHON_PID 2>/dev/null
  kill $NEXTJS_PID 2>/dev/null
  exit 0
}

# Set trap for Ctrl+C and other termination signals
trap cleanup INT TERM

# Keep the script running
echo "Both servers are running. Press Ctrl+C to stop both servers."
wait