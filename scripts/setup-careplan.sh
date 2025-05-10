#!/bin/bash

# Setup script for the Care Plan Python backend

echo "Setting up Python dependencies for Care Plan Generator in the 'site' virtual environment..."

# Navigate to the project root directory first, then to the careplan directory
cd "$(dirname "$0")/.."
SITE_VENV="$(pwd)/site"

# Navigate to the care plan backend directory
cd backend/careplan

# Activate the site virtual environment
source ../../site/bin/activate || { echo "Failed to activate 'site' virtual environment. Make sure it exists at $SITE_VENV"; exit 1; }

# Install dependencies
echo "Installing dependencies to 'site' virtual environment..."
pip install flask flask-cors requests python-dotenv gunicorn

echo "Setup complete!"
echo "You can now run the application with 'npm run dev'"