from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import threading
import time
import os
import signal
import atexit

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

TARGET_FILE = "user_app.py"
STREAMLIT_PORT = 8501 # Default Streamlit port

class StreamlitManager:
    def __init__(self, target_file=TARGET_FILE, port=STREAMLIT_PORT):
        self.target_file = target_file
        self.port = port
        self.process = None
        self.lock = threading.Lock() # Lock for thread safety

    def _monitor_process(self):
        if self.process:
            self.process.wait()
            with self.lock:
                print(f"Streamlit process {self.process.pid} ended.")
                self.process = None

    def stop(self):
        with self.lock:
            if not self.process or self.process.poll() is not None:
                print("Streamlit process already stopped or not running.")
                self.process = None
                return True # Indicate it's stopped

            pid = self.process.pid
            print(f"Attempting to terminate Streamlit process {pid}...")
            try:
                # Use taskkill on Windows to terminate the process and its children
                subprocess.run(['taskkill', '/F', '/PID', str(pid), '/T'], check=True, capture_output=True, text=True)
                print(f"Terminated Streamlit process {pid}")
                # Wait a moment for the process to fully terminate and release the port
                try:
                    self.process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    print(f"Process {pid} did not terminate cleanly after taskkill.")
                self.process = None
                time.sleep(2) # Extra sleep to help ensure port is free
                return True
            except subprocess.CalledProcessError as e:
                if "not found" in e.stderr.lower():
                    print(f"Process {pid} not found, likely already terminated.")
                    self.process = None # Ensure process is marked as None
                    return True
                else:
                    print(f"Failed to terminate Streamlit process {pid}: {e.stderr}")
                    # Optionally attempt SIGKILL if SIGTERM failed, though taskkill /F /T is forceful
            except Exception as e:
                print(f"An error occurred during termination of process {pid}: {e}")
            
            # If termination failed somehow, mark as stopped anyway for consistency
            self.process = None 
            return False # Indicate termination might have failed

    def start(self):
        with self.lock:
            # Ensure any existing process is stopped first
            if self.process and self.process.poll() is None:
                 print("Streamlit is already running. Attempting to restart.")
                 if not self.stop(): # Try stopping it
                     print("Warning: Failed to cleanly stop existing process before starting new one.")
            
            # Reset process state before starting
            self.process = None

            print(f"Starting Streamlit on port {self.port} with {self.target_file}...")
            try:
                # Use 'python -m streamlit run ...'
                # Use CREATE_NEW_PROCESS_GROUP on Windows
                self.process = subprocess.Popen(
                    ['python', '-m', 'streamlit', 'run', self.target_file, '--server.port', str(self.port), '--server.headless', 'true'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=os.path.dirname(os.path.abspath(__file__)),
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                    text=True, # Use text mode for easier output handling
                    errors='ignore' # Ignore decoding errors in stderr/stdout
                )
                print(f"Streamlit process started with PID: {self.process.pid}")

                # Start monitor thread
                monitor_thread = threading.Thread(target=self._monitor_process, daemon=True)
                monitor_thread.start()

                # Give Streamlit time to start
                time.sleep(4)

                # Check if started successfully
                if self.process and self.process.poll() is None:
                    print(f"Streamlit seems to be running on http://localhost:{self.port}")
                    return True
                else:
                    # Capture stderr if the process failed immediately
                    stderr_output = "N/A"
                    if self.process and self.process.stderr:
                        try:
                            # Poll stderr with a timeout
                             stderr_output = self.process.stderr.read()
                        except Exception as e:
                            stderr_output = f"Error reading stderr: {e}"
                    print(f"Streamlit failed to start. Stderr: {stderr_output}")
                    self.process = None # Reset if failed
                    return False
            except Exception as e:
                print(f"Exception during Streamlit start: {e}")
                self.process = None
                return False

    def get_status(self):
        with self.lock:
            if self.process and self.process.poll() is None:
                return {"status": "running", "pid": self.process.pid, "port": self.port}
            else:
                # If process object exists but poll is not None, it has stopped
                if self.process: 
                    print(f"Streamlit process {self.process.pid} appears to have stopped.")
                    self.process = None # Clean up
                return {"status": "stopped"}

# Create a single instance of the manager
streamlit_manager = StreamlitManager()

# Register shutdown hook using the manager's stop method
atexit.register(streamlit_manager.stop)

@app.route('/update_code', methods=['POST'])
def update_code():
    data = request.json
    code = data.get('code')

    if not code:
        return jsonify({"status": "error", "message": "No code provided"}), 400

    try:
        file_path = os.path.join(os.path.dirname(__file__), TARGET_FILE)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Code written to {TARGET_FILE}")

        # Use the manager to restart Streamlit
        if streamlit_manager.start():
            status = streamlit_manager.get_status()
            return jsonify({"status": "success", "message": f"Code updated and Streamlit (re)started on port {status.get('port')}"})
        else:
             return jsonify({"status": "error", "message": "Failed to restart Streamlit process."}), 500

    except Exception as e:
        print(f"Error updating code or restarting Streamlit: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    # Use the manager to get the status
    current_status = streamlit_manager.get_status()
    return jsonify(current_status)


if __name__ == '__main__':
    print("Starting Flask server for code updates...")
    # Initial start of Streamlit using the manager
    streamlit_manager.start()
    # Run Flask on port 5001
    app.run(host='0.0.0.0', port=5001, debug=False) 