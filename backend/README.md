# Backend for Streamlit IDE

This directory contains the Flask backend server (`server.py`) and the user-editable Streamlit application (`user_app.py`).

## Setup

1.  **Navigate to this directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:** Ensure you have Python, Flask, Flask-CORS, and Streamlit installed.
    ```bash
    pip install Flask Flask-CORS streamlit pandas numpy altair plotly streamlit-plotly-events
    ```
    *Note: You might want to use a virtual environment (`python -m venv venv`, `source venv/bin/activate` or `venv\Scripts\activate`).*

## Running the Backend

1.  **Start the Flask server:**
    ```bash
    python server.py
    ```
2.  This will:
    *   Start the Flask server (usually on port 5001).
    *   Automatically start the initial `user_app.py` using Streamlit (usually on port 8501).

3.  The frontend application (running on your Next.js dev server, likely port 3000) will communicate with the Flask server on port 5001.
4.  When you edit code in the frontend IDE and click "Run", the Flask server will:
    *   Overwrite `user_app.py` with the new code.
    *   Terminate the existing Streamlit process.
    *   Start a new Streamlit process with the updated `user_app.py`.
    *   The preview panel in the frontend will refresh to show the updated Streamlit app.

## Notes

*   The Flask server listens on `0.0.0.0`, making it accessible on your local network.
*   Streamlit runs in headless mode (`--server.headless true`).
*   Ensure ports 5001 and 8501 are not blocked by other applications or firewalls.
*   The `server.py` attempts graceful shutdown of the Streamlit process when the Flask server exits. 