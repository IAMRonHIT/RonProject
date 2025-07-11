# Ron AI Healthcare Platform

This project includes three main components:
1. A Next.js application with a Plan of Care Generator that uses Sonar Pro for reasoning and Gemini 2.5 Pro for care plan generation
2. A Streamlit application that simulates Ron AI's multi-agent framework for coordinating healthcare workflows
3. An enhanced RAG-powered chatbot with lead capture and HubSpot integration

## Plan of Care Generator

The Plan of Care Generator is a Next.js application that allows users to generate FHIR-compliant care plans using AI. It leverages Sonar Pro for reasoning and research, and Gemini 2.5 Pro for generating the final care plan.

### Features

- **Form-based input**: Enter patient details including disease, age, and gender
- **FHIR JSON generation**: Converts form input to FHIR-compliant JSON
- **AI-powered reasoning**: Uses Sonar Pro to research and reason about the best care plan
- **Care plan generation**: Uses Gemini 2.5 Pro to generate a comprehensive care plan
- **Interactive UI**: Shows the reasoning process in real-time with animations
- **Results display**: Presents the care plan in a 3-card layout with assessment, implementation, and evaluation sections

### Setup

1. **Prerequisites:**
   * Node.js 18+ installed
   * API keys for Perplexity (Sonar Pro) and Google AI (Gemini 2.5 Pro)

2. **Installation:**
   ```bash
   # Clone the repository
   git clone https://github.com/your-username/ron-ai-platform.git
   cd ron-ai-platform

   # Install dependencies
   npm install
   ```

3. **Environment Setup:**
   * Copy `.env.local.example` to `.env.local`
   * Add your API keys to `.env.local`:
     ```
     SONAR_API_KEY=your_SONAR_API_KEY_here
     GOOGLE_AI_API_KEY=your_google_ai_api_key_here
     ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```
   This will start the Next.js development server at http://localhost:3000

### Usage

1. Navigate to the Plan of Care Generator page
2. Fill out the patient information form
3. Click "Generate Plan" to create the FHIR JSON
4. Click "Send to Ron" to start the AI reasoning process
5. Watch as Sonar Pro reasons through the care plan
6. View the final care plan generated by Gemini 2.5 Pro

## Multi-Agent Framework Simulation

### Objective

The simulation demonstrates how a 14-agent, LLM-orchestrated framework handles events like a "New MRI Order". It aims to provide a clear understanding of agent roles, data flow, and orchestration benefits, especially for non-technical stakeholders, including those with visual impairments.

### Running the Simulation

1.  **Prerequisites:**
    *   Python 3.8+ installed.
    *   Required libraries: `streamlit`, `plotly`. Install them using pip:
        ```bash
        pip install streamlit plotly
        ```

2.  **Navigate to the Project Directory:**
    Open your terminal or command prompt and change to the directory containing this README and the `scripts` folder (e.g., `/Users/timmys/RonProject`).

3.  **Run the Streamlit App:**
    Execute the following command:
    ```bash
    streamlit run scripts/app.py
    ```
    This will start the Streamlit server and open the simulation in your default web browser.

4.  **Interact with the Simulation:**
    *   Click the "**▶️ Start Sim**" button to begin the workflow.
    *   Observe the agent grid, data stream, and decision dial update in real-time.
    *   Check the "**Simulate Failure**" box before starting to see the failure path demonstration (the 'Authorization' agent is currently hardcoded to fail in this mode).
    *   Click "**🔄 Reset Sim**" to clear the state and run again.

## Enhanced RAG-Powered Chatbot

The enhanced chatbot provides intelligent responses about Ron AI, captures leads, and integrates with HubSpot.

### Features

- **RAG Knowledge Base**: Contextually answers questions about Ron AI using stored knowledge
- **Lead Detection & Capture**: Identifies potential leads and gathers contact information
- **HubSpot Integration**: Creates contacts and deals in HubSpot for qualified leads
- **User Context Tracking**: Extracts and remembers user information from conversation
- **Proactive Messaging**: Sends notifications to engage users after periods of inactivity
- **Enhanced UI**: Modern glassmorphic design with animations and improved visuals

### Setup Instructions

#### 1. Environment Variables

Add the following to your `.env.local` file:

```
# For the RAG system
OPENAI_API_KEY=your_openai_api_key

# For HubSpot integration
HUBSPOT_API_KEY=your_hubspot_api_key
HUBSPOT_PORTAL_ID=your_hubspot_portal_id
```

#### 2. Knowledge Base Setup

The RAG system uses knowledge documents in `/data/knowledge/`. 

To add more knowledge:
1. Create text files in the `/data/knowledge/` directory
2. Each file should cover a specific aspect of Ron AI
3. Format using simple markdown for better organization
4. Restart the server after adding new documents to rebuild the vector store

#### 3. HubSpot Integration

The HubSpot integration creates contacts and deals when potential leads are identified.

To configure:
1. Create a private app in HubSpot with the following scopes:
   - `crm.objects.contacts.write`
   - `crm.objects.contacts.read`
   - `crm.objects.deals.write`
   - `crm.objects.deals.read`
2. Add the generated API key to your environment variables

#### 4. Installing Dependencies

```bash
npm install langchain @langchain/openai hnswlib-node
```

### Usage

The chatbot consists of the following components:

1. **Frontend Component**: `/components/chatbot-ui.tsx`
   - Handles UI rendering, user input, and message display
   - Manages user context and proactive messaging

2. **Chat API**: `/app/api/chat/route.ts`
   - Processes user messages
   - Incorporates RAG context
   - Detects potential leads

3. **RAG Service**: `/lib/rag-service.ts`
   - Manages knowledge storage and retrieval
   - Builds and queries vector embeddings

4. **HubSpot API**: `/app/api/hubspot/route.ts`
   - Creates contacts and deals in HubSpot
   - Checks if users are existing contacts

### Customization Options

#### Adding Custom Proactive Messages

Edit the `proactiveMessages` array in `chatbot-ui.tsx` to customize the proactive messages.

#### Modifying Lead Detection

The lead detection logic in `route.ts` uses regex patterns to identify potential leads. Update the `leadIndicators` array to modify detection patterns.

#### Styling

The chatbot UI uses Tailwind CSS with custom glassmorphic styling. Modify the classes in `chatbot-ui.tsx` to customize the appearance.

## Visual Blueprint & Accessibility

The UI is designed based on the "Visual Blueprint" described in the prompt, prioritizing accessibility:

*   **Layout:** A 5-zone layout (Event Queue, Agent Grid, Data Stream, Decision Dial, Outcome Banner) provides a structured view.
*   **Color Palette:** Uses a high-contrast "cyberpunk operating theatre" theme (Deep Navy, Neon Teal, Magenta) with contrast ratios checked to be ≥ 7:1 for text elements against the background.
    *   White (#FFF) on Navy (#0a0e17): 17.74:1
    *   Teal (#18e7d3) on Navy (#0a0e17): 7.95:1
    *   Magenta (#ff1ecd) on Navy (#0a0e17): 7.15:1
    *   Secondary Text (#a4b8d3) on Navy (#0a0e17): 7.19:1
*   **Typography:** Clear distinction between `Inter` (sans-serif) for labels/text and `JetBrains Mono` (monospace) for code/data streams, with accessible font sizes.
*   **Motion:** Animations (pulsing nodes, sliding logs/banner) are purposeful and use `ease-in-out` timing.
*   **Screen Reader Support (ARIA):**
    *   `aria-label` attributes are added to major zones (Event Queue, Agent Grid, Decision Dial) to provide context.
    *   The **Data Stream Pane (Zone C)** uses `aria-live="polite"` to announce new log entries as they appear, allowing screen reader users to follow the agent activity. `aria-atomic="false"` ensures only new additions are read.
    *   The **Outcome Banner (Zone E)** uses `aria-live="assertive"` (implicitly via the fixed banner appearing) to announce the final result immediately.
*   **Keyboard Navigation & Focus:** While standard Streamlit has limitations in fine-grained focus control, the logical layout and standard browser controls should allow for basic keyboard navigation (Tab, Shift+Tab). Buttons are focusable.
*   **Failure Indication:** Agent failures are indicated visually (red flashing node) and announced in the Data Stream log (`❌ FAILED`) which is read by screen readers due to `aria-live`. The final outcome banner also reflects the failure state.

## Technical Details

*   **Stack:** Python, Streamlit, asyncio, Plotly (for the gauge). Next.js, React, Tailwind CSS.
*   **Concurrency:** `asyncio` is used to run mock agent tasks concurrently (`asyncio.gather`). Each agent simulates work with `asyncio.sleep`.
*   **Data:** Uses hardcoded synthetic patient and policy data. No external databases required.
*   **Extensibility:** Agent definitions are stored in the `AGENT_DEFINITIONS` dictionary, making it easier to add or modify agents.