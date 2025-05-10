#!/bin/bash

# Script to kill running servers and clean up resources

# Find Next.js process and kill it
echo "Stopping Next.js development server..."
pkill -f "node.*next" || true

# No MAISI containers to stop anymore

# Kill RAG server process
echo "Stopping RAG server..."
pkill -f "start-rag-server.js" || true

# Kill Care Plan Python backend
echo "Stopping Care Plan Python backend..."
pkill -f "python.*app.py" || true
lsof -ti :5001 | xargs kill -9 2>/dev/null || true

# Kill any processes running on port 3000-3010 (Next.js commonly uses these)
echo "Ensuring ports 3000-3010 are free..."
for port in {3000..3010}; do
  lsof -ti :$port | xargs kill -9 2>/dev/null || true
done

# Make sure there are no other lingering processes
echo "Ensuring ports are free..."

echo "All servers and containers have been stopped."