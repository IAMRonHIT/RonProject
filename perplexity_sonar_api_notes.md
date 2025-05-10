# Perplexity Sonar Reasoning Pro API Notes

This document summarizes key findings regarding the Perplexity Sonar Reasoning Pro API, focusing on chat completions, structured JSON output, and streaming capabilities, based on available documentation.

## Model Capabilities & Use Cases

Sonar Reasoning Pro is designed for complex tasks involving:
*   **Multi-step reasoning:** Analyzing problems requiring intermediate steps.
*   **Deep research synthesis:** Combining information from multiple sources for comprehensive answers.
*   **Structured data outputs:** Generating machine-readable formats like JSON.

Ideal use cases include:
*   Technical analysis requiring structured data.
*   Real-time dashboards needing streaming JSON feeds.
*   Complex query resolution with detailed reasoning.
*   Enterprise-scale knowledge synthesis.

The model supports a 16K token context window and provides enhanced citation capabilities compared to standard Sonar models.

## Structured JSON Object Response Implementation

The API supports requesting structured JSON output using the `response_format` parameter. However, **it's crucial to note that the API may still prepend reasoning tokens or other text before the actual JSON object in the response content, even when `response_format` is used.** Therefore, client-side parsing to extract the valid JSON portion is always necessary.

Methods to achieve structured output:

1.  **Using `response_format` Parameter:** Specify `"type": "json_object"` in the API call. You can optionally provide a JSON schema to guide the model.
    ```python
    # Example API Call using response_format
    data = {
        "model": "sonar-reasoning-pro",
        "messages": [
             {
                "role": "system",
                "content": "You are an assistant that provides analysis in JSON format." # Prompt still helpful
            },
            {
                "role": "user",
                "content": "Analyze the impact of recent regulations."
            }
        ],
        "response_format": {
            "type": "json_object",
            # Optional: Provide a schema to guide the output
            # "schema": {
            #     "type": "object",
            #     "properties": {
            #         "analysis": {"type": "string"},
            #         "impact_score": {"type": "number"}
            #     },
            #     "required": ["analysis", "impact_score"]
            # }
        },
        "temperature": 0.1,
        "max_tokens": 2048
    }
    # response = requests.post(API_ENDPOINT, headers=headers, json=data)
    ```
2.  **System Prompt Design:** Even when using `response_format`, clearly instructing the model in the system prompt to adhere to the JSON structure remains a best practice to improve reliability.
3.  **Client-Side Parsing & Validation:** Implement robust parsing logic on your backend (e.g., in Python) to find and extract the valid JSON object from the potentially mixed response string. Handle `JSONDecodeError`.
    ```python
    import json
    import re

    def extract_json_from_response(response_content):
        """
        Extracts the first valid JSON object found in the response string,
        handling potential prepended text.
        """
        try:
            # Find the first '{' that likely starts the JSON object
            json_start_index = response_content.find('{')
            if json_start_index == -1:
                print("Error: No JSON object start found.")
                return None

            # Attempt to parse from the first '{' onwards
            # This assumes the JSON is the last major part of the string
            json_str = response_content[json_start_index:]
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            # Add more sophisticated extraction logic if needed (e.g., regex)
            return None

    # Assuming response.text contains the full string from the API
    # full_response_text = response.text
    # parsed_data = extract_json_from_response(full_response_text)
    # if parsed_data:
    #     print("Successfully parsed JSON:", parsed_data)
    # else:
    #     print("Failed to extract valid JSON.")
    ```

## Streaming Implementation with JSON

Streaming JSON responses requires careful handling:

1.  **Enable Streaming:** Set `stream=True` in the API call.
2.  **Chunk Aggregation:** Iterate through the response chunks (`response.iter_content` or similar). Append the content delta from each chunk to a buffer.
3.  **Final Parsing:** Wait until the stream is fully complete. Then, use your JSON extraction logic (like `extract_json_from_response` above) on the aggregated buffer content. Attempting to parse partial JSON during the stream is unreliable.

```python
import requests
import json # Assuming extract_json_from_response is defined as above

API_KEY = "YOUR_API_KEY"
API_ENDPOINT = "https://api.perplexity.ai/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
data = {
    "model": "sonar-reasoning-pro",
    "messages": [{"role": "user", "content": "Generate a JSON analysis."}],
    "response_format": {"type": "json_object"}, # Can be used with streaming
    "stream": True
}

stream_buffer = ""
try:
    response = requests.post(API_ENDPOINT, headers=headers, json=data, stream=True)
    response.raise_for_status() # Check for HTTP errors

    print("Streaming response...")
    for chunk in response.iter_lines(): # iter_lines is often better for SSE
        if chunk:
            decoded_chunk = chunk.decode('utf-8')
            if decoded_chunk.startswith('data: '):
                data_str = decoded_chunk[6:]
                if data_str == "[DONE]":
                    break
                try:
                    chunk_json = json.loads(data_str)
                    content = chunk_json.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if content:
                        print(content, end='', flush=True) # Print stream for visibility
                        stream_buffer += content
                except json.JSONDecodeError:
                    print(f"\nWarning: Could not parse stream chunk JSON: {data_str}")
                    continue

    print("\nStream finished.")

    # Parse the complete response after streaming ends
    final_data = extract_json_from_response(stream_buffer) # Use the extractor
    if final_data:
        print("\nSuccessfully parsed final JSON:", final_data)
    else:
        print("\nFailed to parse valid JSON from the complete stream.")

except requests.exceptions.RequestException as e:
    print(f"\nAPI Request failed: {e}")

```

## Best Practices & Considerations

*   **Parsing is Mandatory:** Always implement robust client-side logic to extract the JSON object, as reasoning tokens or other text may precede it.
*   **Error Handling:** Handle API errors (4xx/5xx status codes) and JSON parsing errors gracefully.
*   **Token Limits:** Use `max_tokens` wisely to avoid truncation of the JSON output.
*   **Streaming:** Aggregate the full response before parsing JSON for reliability.

## Official Resources
*   **API Reference:** [https://docs.perplexity.ai/home](https://docs.perplexity.ai/home)
*   **Model Cards:** [https://docs.perplexity.ai/guides/model-cards](https://docs.perplexity.ai/guides/model-cards)
*   **GitHub Issue Tracking:** [https://github.com/perplexityai/api-docs](https://github.com/perplexityai/api-docs)