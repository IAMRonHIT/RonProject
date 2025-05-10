#!/bin/bash

# Set default port if not provided
export CARE_PLAN_SERVER_PORT=${CARE_PLAN_SERVER_PORT:-5001}
export FLASK_APP=app.py
export FLASK_DEBUG=1

echo "Starting care plan server on port $CARE_PLAN_SERVER_PORT..."

# Check if virtual environment exists, if not create one
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "Starting server..."
python app.py