#!/bin/bash

# Stop the existing Python backend processes
echo "Stopping existing Python backend processes..."
pkill -f "python.*app.py" || true

# Short pause to ensure processes terminate
sleep 2

# Change to the backend directory
cd /Users/timmys/RonProject/backend/careplan

# Start the server in the background
echo "Starting Python backend with Sonar Reasoning Pro integration..."
./start_server.sh &

echo "Python backend restart initiated!"
