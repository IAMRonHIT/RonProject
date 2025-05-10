# Implementation Plan: Gemini RAG with Zapier & HubSpot for Lead Generation

## 1. Overview
   - **Goal**: Leverage Gemini for Retrieval Augmented Generation (RAG) and intelligent tool calling to capture, qualify, and process leads using Zapier for workflow automation and HubSpot as the CRM for lead management.
   - **Core Components**:
     - Google Gemini 2.0 Flash Lite (or `gemini-2.0-flash` / `gemini-2.0-flash-001` as per SDK availability).
     - RAG pipeline for contextual understanding and lead qualification.
     - Zapier for connecting to lead sources (e.g., web forms, chatbot outputs) and orchestrating initial lead processing steps, including potentially sending data to HubSpot.
     - HubSpot CRM for storing and managing leads (Contacts, Deals).
   - **Tool Calling**: Gemini will be equipped with tools to:
     - Send lead data to a Zapier webhook.
     - Directly interact with the HubSpot API (e.g., create contacts/deals).
   - **Optional**: Integration with a Model-Client Protocol (MCP) Server for managing and exposing these tools to Gemini.

## 2. Prerequisites & Setup

   - **Python Environment**: Python 3.8 or newer recommended.
   - **Google Cloud Project**:
     - Vertex AI API enabled.
     - Authentication configured (e.g., Application Default Credentials or a service account key).
   - **Zapier Account**: A Zapier account with the ability to create Zaps and use Webhooks by Zapier.
   - **HubSpot Account**:
     - HubSpot CRM instance.
     - API Key or a private app with necessary OAuth scopes (e.g., `crm.objects.contacts.write`, `crm.objects.deals.write`).
   - **Required Python Libraries**:
     ```bash
     pip install --upgrade google-cloud-aiplatform hubspot-api-client requests langchain langchain-google-vertexai faiss-cpu
     # faiss-cpu is one option for a vector store; others like ChromaDB, Pinecone can also be used.
     # langchain and related libraries are optional if not building a complex agent/RAG with LangChain.
     ```
     *Reference (Gemini/RAG):* `Installing Required Packages for Gemini RAG` (from Gemini docs)
     *Reference (HubSpot):* `Installing HubSpot Python Client` (from HubSpot docs)

   - **Initialize Gemini Model**:
     ```python
     from vertexai.generative_models import GenerativeModel, Part, Tool, FunctionDeclaration
     from google.genai.types import GenerateContentConfig # For older SDK versions, might be from vertexai.generative_models

     PROJECT_ID = "your-gcp-project-id"  # Replace with your Project ID
     LOCATION = "your-gcp-region"    # Replace with your Region

     # Initialize Vertex AI
     import vertexai
     vertexai.init(project=PROJECT_ID, location=LOCATION)

     MODEL_ID = "gemini-2.0-flash-001" # Or "gemini-2.0-flash"
     gemini_model = GenerativeModel(MODEL_ID)
     print(f"Initialized Gemini Model: {MODEL_ID}")
     ```
     *Reference (Gemini):* `Loading Gemini Models in Python`, `Selecting Gemini Model for Function Calling`

   - **Configure HubSpot Client**:
     ```python
     from hubspot import HubSpot

     # Ensure your HubSpot Access Token is securely managed (e.g., environment variable)
     HUBSPOT_ACCESS_TOKEN = "your-hubspot-access-token"
     hubspot_client = HubSpot(access_token=HUBSPOT_ACCESS_TOKEN)
     print("HubSpot client configured.")
     ```
     *Reference (HubSpot):* `Configuring HubSpot Client`

## 3. Phase 1: RAG Implementation with Gemini

   - **3.1. Define Knowledge Base for RAG**:
     - Collect documents relevant to your products, services, FAQs, pricing, or any information Gemini might need to understand user inquiries and qualify leads.
     - Supported formats: Text files, PDFs, etc.
   - **3.2. Setup Vector Store**:
     - **Chunking**: Split your documents into smaller, manageable chunks.
       ```python
       # Example using LangChain for simplicity
       # from langchain.text_splitter import RecursiveCharacterTextSplitter
       # text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
       # texts = text_splitter.split_documents(loaded_documents) # Assuming loaded_documents
       ```
     - **Embeddings**: Generate embeddings for each chunk using a Vertex AI embedding model.
       ```python
       # from langchain_google_vertexai import VertexAIEmbeddings
       # embeddings_service = VertexAIEmbeddings(model_name="textembedding-gecko@latest") # Or other embedding model
       ```
     - **Storage**: Store chunks and their embeddings in a vector database (e.g., FAISS, ChromaDB, Pinecone).
       ```python
       # from langchain.vectorstores import FAISS
       # vector_store = FAISS.from_documents(texts, embeddings_service)
       ```
       *Reference (Gemini/RAG):* `Importing Libraries for Gemini RAG`
   - **3.3. Implement Retrieval Logic**:
     - Create a function to retrieve relevant chunks from the vector store based on a user's query.
       ```python
       # def retrieve_context(query, top_k=3):
       #     return vector_store.similarity_search(query, k=top_k)
       ```
   - **3.4. Integrate RAG with Gemini for Contextual Responses**:
     - When a user query comes in, retrieve relevant context.
     - Construct a prompt for Gemini that includes the user's query and the retrieved context.
       ```python
       # user_query = "Tell me about your enterprise plan."
       # relevant_docs = retrieve_context(user_query)
       # context_str = "\n".join([doc.page_content for doc in relevant_docs])
       #
       # rag_prompt = f"""Based on the following context, answer the user's query.
       # Context:
       # {context_str}
       #
       # User Query: {user_query}
       # Answer:"""
       # response = gemini_model.generate_content(rag_prompt)
       # print(response.text)
       ```
     *Reference (Gemini/RAG):* `Implementing RAG Pipeline Function in Python` (conceptual)

## 4. Phase 2: Lead Capture & Initial Processing with Zapier

   - **4.1. Design Lead Capture Flow**:
     - Determine how leads will be captured (e.g., through a chatbot interface powered by Gemini, a web form that triggers a backend process, etc.).
     - Gemini, using RAG, can interact with users, understand their needs, and identify when a user expresses interest that qualifies as a lead.
   - **4.2. Create a Zapier Webhook Trigger**:
     - Go to your Zapier dashboard.
     - Click "Create Zap".
     - For the Trigger, search and select "Webhooks by Zapier".
     - Choose the event "Catch Hook".
     - Click "Continue". Zapier will provide a "Custom Webhook URL". Copy this URL.
   - **4.3. Define a Gemini Tool to Send Data to Zapier Webhook**:
     - This tool will be a Python function that Gemini can call.
     - **Tool Name**: `send_lead_to_zapier`
     - **Description**: "Captures lead details (name, email, company, inquiry) and sends them to a Zapier webhook for automated processing."
     - **Parameters**: `name` (string), `email` (string), `company` (string, optional), `phone` (string, optional), `inquiry_details` (string, optional), `lead_source` (string, optional, default: "GeminiInteraction").
     - **Implementation (Python function)**:
       ```python
       import requests
       import json

       ZAPIER_WEBHOOK_URL = "YOUR_ZAPIER_CATCH_HOOK_URL" # Replace with your actual URL from Zapier

       def send_lead_to_zapier(name: str, email: str, company: str = None, phone: str = None, inquiry_details: str = None, lead_source: str = "GeminiInteraction"):
           """Sends lead information to a predefined Zapier webhook."""
           if not ZAPIER_WEBHOOK_URL or "YOUR_ZAPIER_CATCH_HOOK_URL" in ZAPIER_WEBHOOK_URL:
               return {"status": "error", "message": "Zapier Webhook URL not configured."}

           lead_data = {
               "name": name,
               "email": email,
               "company": company,
               "phone": phone,
               "inquiry": inquiry_details,
               "source": lead_source,
           }
           headers = {"Content-Type": "application/json"}
           try:
               response = requests.post(ZAPIER_WEBHOOK_URL, data=json.dumps(lead_data), headers=headers)
               response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
               # Zapier webhooks usually return a status, attempt_id etc.
               return {"status": "success", "message": "Lead sent to Zapier.", "zapier_response": response.json() if response.content else ""}
           except requests.exceptions.RequestException as e:
               return {"status": "error", "message": f"Failed to send lead to Zapier: {str(e)}"}
           except json.JSONDecodeError:
                return {"status": "success", "message": "Lead sent to Zapier, but response was not JSON.", "zapier_raw_response": response.text}

       ```
     *Conceptual Reference (Zapier):* `POST /hooks/callback/...` (illustrates Zapier receiving a POST request).
   - **4.4. Configure Zapier Workflow (Actions in the Zap)**:
     - After setting up the "Catch Hook" trigger in Zapier, send a test request to your webhook URL (e.g., using Postman or a simple Python script with the `send_lead_to_zapier` function) so Zapier can detect the data fields.
     - **Action 1 (Optional but Recommended)**: Add a "Filter by Zapier" step to ensure essential data (like email) is present.
     - **Action 2 (Optional)**: Add lead details to a Google Sheet for backup or quick review.
     - **Action 3 (Optional)**: Send an email notification (e.g., to sales team) using "Email by Zapier" or Gmail/Outlook integration.
     - **Action 4**: Send lead data to HubSpot (covered in Phase 3).

## 5. Phase 3: Lead Management in HubSpot

   - **5.1. Option A: HubSpot Actions within Zapier (Recommended for Simplicity)**:
     - In your Zap (from Phase 4.4), add a new action step.
     - Search for and select the "HubSpot" app integration in Zapier.
     - Choose the action: "Create or Update Contact".
       - Connect your HubSpot account.
       - Map the fields from the Zapier webhook trigger (e.g., `name`, `email`, `company`) to the corresponding HubSpot contact properties.
     - **Optional**: Add another HubSpot action step to "Create Deal" if applicable, associating it with the newly created/updated contact.
     - *Benefit*: Leverages Zapier's robust HubSpot integration and error handling, simplifies authentication management.
     *Reference (Zapier concept):* `Create a Zap - Request` (shows structuring Zap steps).

   - **5.2. Option B: Direct HubSpot API Tools for Gemini (for more granular control or if Zapier's HubSpot actions are insufficient)**:
     - **5.2.1. Define Gemini Tool: `create_hubspot_contact`**
       - **Description**: "Creates a new contact in HubSpot CRM with the provided details."
       - **Parameters**: `email` (string, required), `firstname` (string, optional), `lastname` (string, optional), `phone` (string, optional), `company` (string, optional).
       - **Implementation (Python function using HubSpot SDK)**:
         ```python
         from hubspot.crm.contacts import SimplePublicObjectInputForCreate
         from hubspot.crm.contacts.exceptions import ApiException

         # hubspot_client should be initialized as shown in Prerequisites

         def create_hubspot_contact(email: str, firstname: str = None, lastname: str = None, phone: str = None, company: str = None):
             """Creates a contact in HubSpot."""
             try:
                 properties = {"email": email}
                 if firstname: properties["firstname"] = firstname
                 if lastname: properties["lastname"] = lastname
                 if phone: properties["phone"] = phone
                 if company: properties["company"] = company
                 
                 contact_input = SimplePublicObjectInputForCreate(properties=properties)
                 api_response = hubspot_client.crm.contacts.basic_api.create(
                     simple_public_object_input_for_create=contact_input
                 )
                 return {"status": "success", "contact_id": api_response.id, "data": api_response.to_dict()}
             except ApiException as e:
                 # Log the full error for debugging
                 error_details = str(e)
                 if hasattr(e, 'body'): # HubSpot API errors often have details in e.body
                     error_details = f"{e} - Body: {e.body}"
                 print(f"HubSpot API Exception when creating contact: {error_details}")
                 return {"status": "error", "message": f"HubSpot API Exception: {e.reason if hasattr(e, 'reason') else str(e)}"}
         ```
       *Reference (HubSpot):* `Creating CRM Contact`, `Updating CRM Object Creation Methods in Python`.
     - **5.2.2. Define Gemini Tool (Optional): `create_hubspot_deal`**
       - **Description**: "Creates a new deal in HubSpot CRM and associates it with a contact."
       - **Parameters**: `dealname` (string), `amount` (string/float), `contact_id` (string, for association), `dealstage` (string, pipeline stage ID).
       - **Implementation**: Similar structure to `create_hubspot_contact`, using `hubspot_client.crm.deals.basic_api.create(...)` and potentially `hubspot_client.crm.deals.associations_api.create(...)` to link to a contact (Note: Associations API client structure might have changed, check latest HubSpot SDK docs if `crm.deals.associations_api` was removed as per changelog snippet).
         *Note:* The `Removing CRM Associations API Clients` snippet indicates direct association APIs were removed. Associations are now typically managed as a property during object creation or via a dedicated V4 associations endpoint. For creating a deal and associating it, you'd likely set an `associations` property in the `SimplePublicObjectInputForCreate` for the deal, or make a separate call to the V4 associations API.

   - **5.3. Gemini's Role in HubSpot Interaction**:
     - **If using Zapier (Option A)**: Gemini's primary role is to identify a lead and gather necessary information, then call the `send_lead_to_zapier` tool. Zapier handles the subsequent HubSpot interaction.
     - **If using Direct HubSpot API Tools (Option B)**: After qualifying a lead (potentially using RAG), Gemini would decide to call `create_hubspot_contact` (and/or `create_hubspot_deal`) directly.

## 6. Phase 4: Integrating with Gemini's Tool Calling Mechanism

   - **6.1. Prepare Tool Declarations for Gemini**:
     - For each Python function tool you want Gemini to use (e.g., `send_lead_to_zapier`, `create_hubspot_contact`), create a `FunctionDeclaration`.
       ```python
       send_lead_to_zapier_func = FunctionDeclaration(
           name="send_lead_to_zapier",
           description="Captures lead details (name, email, company, inquiry) and sends them to a Zapier webhook for automated processing.",
           parameters={
               "type": "OBJECT", # Use Type.OBJECT if importing from google.genai.types
               "properties": {
                   "name": {"type": "STRING", "description": "Full name of the lead."},
                   "email": {"type": "STRING", "description": "Email address of the lead."},
                   "company": {"type": "STRING", "description": "Company name (optional)."},
                   "phone": {"type": "STRING", "description": "Phone number (optional)."},
                   "inquiry_details": {"type": "STRING", "description": "Details of the lead's inquiry (optional)."},
                   "lead_source": {"type": "STRING", "description": "Source of the lead (optional, e.g., 'Chatbot')."}
               },
               "required": ["name", "email"]
           }
       )

       create_hubspot_contact_func = FunctionDeclaration(
           name="create_hubspot_contact",
           description="Creates a new contact in HubSpot CRM with the provided details.",
           parameters={
               "type": "OBJECT",
               "properties": {
                   "email": {"type": "STRING", "description": "Email address of the contact (required)."},
                   "firstname": {"type": "STRING", "description": "First name of the contact (optional)."},
                   "lastname": {"type": "STRING", "description": "Last name of the contact (optional)."},
                   "phone": {"type": "STRING", "description": "Phone number (optional)."},
                   "company": {"type": "STRING", "description": "Company name (optional)."}
               },
               "required": ["email"]
           }
       )
       # Add more function declarations as needed
       ```
     - Bundle these into a `Tool` object for Gemini:
       ```python
       gemini_tools = Tool(
           function_declarations=[
               send_lead_to_zapier_func,
               create_hubspot_contact_func,
               # Add other function declarations here
           ]
       )
       ```
     *Reference (Gemini):* `Defining Tool Declarations for Function Calling in Python`, `Automatic Function Calling with Python Function in Gemini API`.

   - **6.2. Main Gemini Interaction Loop**:
     - **User Interaction**: Receive user input (e.g., from a chat interface).
     - **RAG (Optional but Recommended)**: Enhance user query with context if needed.
     - **Call Gemini**: Send the (potentially RAG-enhanced) prompt to Gemini, including the `tools` configuration.
       ```python
       # conversation_history = [] # Manage conversation history
       # user_prompt = "I'm interested in your services. My name is John Doe, email john.doe@example.com."
       # conversation_history.append(Part.from_text(user_prompt)) # Or construct Content objects

       # response = gemini_model.generate_content(
       #     contents=conversation_history, # Send history for multi-turn
       #     generation_config=GenerateContentConfig(
       #         tools=[gemini_tools],
       #         # Optional: force a tool call if appropriate
       #         # tool_config={"function_calling_config": {"mode": "ANY"}}
       #     )
       # )
       ```
     - **Process Gemini's Response**:
       - Check if `response.candidates[0].content.parts[0].function_call` exists.
       - If a function call is requested:
         - Get the function name (`fc.name`) and arguments (`fc.args`).
         - Execute the corresponding Python function:
           ```python
           # fc = response.candidates[0].content.parts[0].function_call
           # if fc.name == "send_lead_to_zapier":
           #     tool_result = send_lead_to_zapier(**fc.args)
           # elif fc.name == "create_hubspot_contact":
           #     tool_result = create_hubspot_contact(**fc.args)
           # else:
           #     tool_result = {"status": "error", "message": f"Unknown tool: {fc.name}"}
           ```
         - Send the tool's result back to Gemini:
           ```python
           # conversation_history.append(response.candidates[0].content) # Add model's turn
           # conversation_history.append(Part.from_function_response(name=fc.name, response=tool_result))
           #
           # final_response = gemini_model.generate_content(
           #     contents=conversation_history,
           #     generation_config=GenerateContentConfig(tools=[gemini_tools]) # Allow further tool calls or final answer
           # )
           # print(final_response.text) # Final natural language response from Gemini
           ```
       - If no function call, `response.text` contains Gemini's direct answer.
     *Reference (Gemini):* General flow from `intro_gemini_2_0_flash_lite.ipynb` snippets, `Running Agent Loop with Function Calls in Python` (conceptual for multi-turn).

## 7. Phase 5: MCP Server Integration (Optional)

   - If you are using a Model-Client Protocol (MCP) server to manage your tools:
   - **7.1. Expose Tools via MCP**:
     - Adapt the Python functions (`send_lead_to_zapier`, `create_hubspot_contact`) to be callable services within your MCP server.
     - The MCP server will need to define schemas for these tools.
   - **7.2. Gemini Interacts with MCP Client**:
     - Your application code will use a `ClientSession` object (specific to your MCP implementation) to communicate with the MCP server.
     - The Gemini model will be configured with tools discovered from the MCP server.
       ```python
       # Conceptual - depends on your MCP client library
       # mcp_session = YourMCPClientSession(mcp_server_url)
       # await mcp_session.initialize()
       # session_tool_list = await mcp_session.list_tools()
       #
       # gemini_tool_config_from_mcp = types.Tool(
       #     function_declarations=[
       #         types.FunctionDeclaration(name=tool.name, description=tool.description, parameters=tool.inputSchema)
       #         for tool in session_tool_list.tools
       #     ]
       # )
       #
       # # Then use gemini_tool_config_from_mcp in generate_content calls
       ```
   - **7.3. Agent Loop for MCP**:
     - Utilize or adapt the `run_agent_loop` and `_execute_tool_calls` patterns from the Gemini MCP documentation snippets.
     - `_execute_tool_calls` would use `mcp_session.call_tool(tool_name, args)` to invoke tools on the MCP server.
     *Reference (Gemini/MCP):* `Executing Tool Calls via MCP Server in Python`, `Running Multi-turn Agent Loop with Gemini Model in Python`.
     *Reference (HubSpot/MCP):* The `/ajbmachon/mcp-hubspot` library could be a pre-built MCP server or client for HubSpot interactions. Investigate if it fits your architecture.

## 8. Error Handling & Logging

   - **Robust Error Handling**:
     - Wrap all API calls (Zapier webhook, HubSpot SDK, Gemini SDK) in `try...except` blocks.
     - Handle specific exceptions (e.g., `requests.exceptions.RequestException`, `hubspot.crm.contacts.exceptions.ApiException`, `google.api_core.exceptions.GoogleAPIError`).
     - Provide meaningful error messages back to Gemini (if a tool fails) or to the application logs.
   - **Logging**:
     - Implement comprehensive logging using Python's `logging` module.
     - Log key events: user queries, RAG context retrieved, Gemini prompts, tool calls requested by Gemini, tool execution parameters, tool responses (success/failure), final Gemini responses.
     - This is crucial for debugging and monitoring.

## 9. Testing

   - **Unit Tests**:
     - Test individual Python tool functions (`send_lead_to_zapier`, `create_hubspot_contact`) with mock API responses to ensure they handle data correctly and manage errors.
   - **Integration Tests**:
     - **Zapier**: Test the Zapier webhook and subsequent actions independently by sending sample payloads.
     - **HubSpot**: Test direct HubSpot API interactions (contact/deal creation) with test data.
     - **Gemini Tool Calling**: Test the flow where Gemini correctly identifies the need for a tool, calls it with appropriate arguments, and processes the tool's response.
   - **End-to-End Tests**:
     - Simulate a full user interaction:
       - User provides input that should result in a lead.
       - Verify RAG provides correct context (if applicable).
       - Verify Gemini calls the appropriate tool (Zapier or HubSpot).
       - Verify the lead is correctly created in Zapier/HubSpot.
       - Verify Gemini provides an appropriate final response to the user.

This plan provides a detailed roadmap. Each step will require careful implementation and testing. Remember to replace placeholder values (like API keys, URLs, project IDs) with your actual configuration.
