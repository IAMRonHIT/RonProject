# Plan to Implement Streaming Care Plan Generation with Reasoning

**1. Goal:**
   - Fix the streaming functionality to correctly display reasoning tokens in real-time.
   - Fix the non-streaming functionality by correcting the request payload sent to the Perplexity API.
   - Implement the desired user experience flow for care plan generation.

**2. Desired User Experience Flow:**
   - User fills and submits the `PatientDataForm.tsx`.
   - An animation confirms the form submission is in progress.
   - The UI switches to display the `ReasoningDisplay.tsx` component.
   - Reasoning tokens received from the Perplexity API stream into the `ReasoningDisplay.tsx` component (like Star Wars intro text).
   - Once reasoning is complete, a spinner indicates the final care plan is being constructed from the JSON data.
   - The UI displays the fully populated `careplan-template.tsx` using the JSON data received from the API.
   - A dedicated section displays the citation sources provided by the API.

**3. Key Findings from Perplexity API Documentation (Evidence-Based Approach):**
   - **`response_format`:** The API supports `response_format: { "type": "json_object" }`. This should be used in API calls to request structured JSON output.
   - **Prepended Reasoning:** Even with `response_format` set, the API response content may still include reasoning text *before* the JSON object. The backend parsing logic *must* reliably extract the JSON from the full response string.
   - **Streaming:** The API supports streaming via the `stream=True` parameter. Standard SSE (Server-Sent Events) protocols are used.
   - **Citations:** The API can provide citation data which needs to be captured and displayed. (The exact format needs confirmation during implementation based on actual API responses).

**4. Technical Implementation Strategy:**
   - **Fix Streaming (405 Error):** Implement the POST-initiate / GET-connect flow.
   - **Fix Non-Streaming (400 Error):** Debug and correct the request payload sent from the Python backend to the Perplexity API, ensuring it includes `response_format` and aligns with API specifications.
   - **Backend Parsing:** Enhance the Python JSON extraction logic (`perplexity_client.py`) to robustly handle potential text preceding the JSON object in the API response.
   - **Frontend Updates:** Modify the frontend to orchestrate the new streaming flow and render the different stages of the UX (animation, reasoning stream, spinner, final plan, citations).

**5. Detailed Implementation Steps:**

   **A. Python Backend (`backend/careplan/`)**
      *   **`perplexity_client.py`:**
          *   Modify `generate_care_plan` and `generate_care_plan_stream` methods:
              *   Add `"response_format": {"type": "json_object"}` to the `data` payload sent to the Perplexity API endpoint (`https://api.perplexity.ai/chat/completions`).
              *   Review and enhance the `_extract_reasoning_and_json` function (and any similar logic in the streaming method) to reliably find and parse the JSON object, even if preceded by reasoning text (e.g., find the first `{` and attempt parsing from there). Log errors clearly if JSON parsing fails.
          *   In `generate_care_plan_stream`:
              *   Ensure it correctly yields structured chunks (e.g., `{"type": "reasoning", "content": "..."}` for reasoning text found before the JSON, and potentially `{"type": "json_chunk", "content": "..."}` for parts of the JSON if needed, or a final `{"type": "complete", "data": {...}}` once the full JSON is parsed). Ensure citations are included if available in the API response.
      *   **`app.py`:**
          *   **Create Initiation Endpoint:**
              *   Add a new route: `@app.route('/api/careplan/initiate-stream', methods=['POST'])`.
              *   This route should:
                  *   Receive patient data via POST request.
                  *   Generate a unique `stream_id`.
                  *   Store the `patient_data` temporarily (e.g., in a simple dictionary keyed by `stream_id`). Consider adding a timeout/cleanup mechanism for stored data.
                  *   Return `jsonify({"stream_id": stream_id})` with a 200 status.
          *   **Modify Streaming Endpoint:**
              *   Change `@app.route('/api/careplan/generate/stream', methods=['POST'])` to `@app.route('/api/careplan/generate/stream/<stream_id>', methods=['GET'])`.
              *   This route should:
                  *   Retrieve the `patient_data` using the `stream_id` from the temporary storage. Handle cases where the ID is invalid or expired.
                  *   Call `perplexity_client.generate_care_plan_stream(patient_data)`.
                  *   Stream the SSE events yielded by the client back to the caller.
                  *   Remove the `patient_data` from temporary storage once the stream is complete or fails.
      *   **Debugging (400 Error):** Add detailed logging within `perplexity_client.py` just before the `requests.post` call to print the exact `headers` and `json=data` payload being sent to Perplexity for the non-streaming request. This will help identify the malformed part causing the `400 Bad Request`.

   **B. Next.js API (`app/api/careplan/`)**
      *   **Create Initiation Proxy Route:**
          *   Add a new file `app/api/careplan/initiate-stream/route.ts`.
          *   This route should handle POST requests.
          *   It should proxy the request (including the body) to the Python backend's `/api/careplan/initiate-stream` endpoint.
          *   It should return the response (including the `stream_id`) from the Python backend.
      *   **Modify Stream Proxy Route (`app/api/careplan/stream/route.ts`):**
          *   Change this route to handle GET requests. It will likely need dynamic routing to capture the `stream_id` (e.g., `app/api/careplan/stream/[stream_id]/route.ts`).
          *   Extract the `stream_id` from the request URL.
          *   Proxy the GET request to the Python backend's `/api/careplan/generate/stream/<stream_id>` endpoint.
          *   Crucially, ensure this route correctly streams the SSE response from the Python backend back to the frontend client. This might require specific handling in Next.js API routes for streaming responses.

   **C. Frontend (`lib/`, `components/`, `app/care-plan-generator/`)**
      *   **`lib/sonar-service.ts`:**
          *   Add a new method `initiateStream(patientData)`:
              *   Sends a POST request to `/api/careplan/initiate-stream` with `patientData`.
              *   Returns the `stream_id` from the response.
          *   Modify `getStreamingUrl()` to accept the `stream_id` and return `/api/careplan/stream/${stream_id}`.
      *   **`app/care-plan-generator/page.tsx`:**
          *   Modify `handleFormSubmit` for the streaming case (`useStreaming === true`):
              *   Call `sonarService.initiateStream(formData)` first.
              *   On success, get the `stream_id`.
              *   Construct the streaming URL using `sonarService.getStreamingUrl(stream_id)`.
              *   Create the `EventSource` using this URL. *Remove* the separate `fetch` POST call that was previously causing the 405 error.
          *   Enhance state management to track the different phases (submitting, streaming_reasoning, building_plan, displaying_plan).
          *   Modify the `EventSource` `onmessage` handler:
              *   Process the structured chunks received (e.g., `data.type === 'reasoning'`, `data.type === 'complete'`).
              *   Update `streamingReasoning` state for reasoning chunks.
              *   When the `complete` chunk arrives containing the final parsed JSON (`data.content.json_data`) and potentially formatted reasoning steps (`data.content.reasoning_steps`) and citations:
                  *   Set `carePlanData` state with the final JSON.
                  *   Set `reasoningSteps` state if provided separately.
                  *   Update loading/phase state.
      *   **UI Components:**
          *   Implement submission animation.
          *   Ensure `ReasoningDisplay.tsx` correctly displays the `streamingReasoning` state as it updates.
          *   Implement a spinner display triggered when reasoning is complete but before the final `carePlanData` is set.
          *   Ensure `careplan-template.tsx` correctly renders using the `carePlanData` state.
          *   Add a component/section to display citations based on data received in the `complete` stream event.