# Perplexity ADPIE Cline Rules

## Brief overview

This Cline rule file contains guidelines for developing code related to Perplexity AI's Sonar Reasoning Pro model for ADPIE care plan generation.

## Communication style

- Aim to meet the requirements provided by the user.
- Use the least amount of code possible without sacrificing aesthetic or function.
- Be direct and to the point in responses.
- Avoid conversational phrases like "Great", "Certainly", "Okay", "Sure".

## Development workflow

- Prioritize clear, achievable goals.
- Work through goals sequentially, using available tools one at a time.
- Analyze the file structure and use appropriate tools to accomplish tasks efficiently.
- When making changes to code, consider the context and ensure compatibility with the existing codebase.

## Coding best practices

- Utilize all available parameters of the Sonar Reasoning Pro model to optimize output.
- Implement robust extraction of reasoning tokens and convert them to formatted markdown for clinical transparency.
- Handle parsing and validation of JSON output for React template integration.
- Tailor the implementation specifically for nursing care plans following the ADPIE methodology.
- Use React components that integrate with the provided template.

## Project context

Sonar Reasoning Pro is Perplexity AI's advanced reasoning model designed for complex, multi-step analysis with integrated real-time data retrieval. Here's a detailed breakdown of its structure, capabilities, and implementation:

---

### Output Structure & Source Extraction

Sonar Reasoning Pro generates **Chain-of-Thought (CoT) responses** that include:

1. **Reasoning tokens**: Sequential logic steps marked as `[Step 1]`, `[Step 2]`, etc., demonstrating the analytical process[2][3].
2. **Source citations**: In-line references to web sources using bracketed numbers (e.g., [1][3]) with full URLs provided in a separate section[1][3].
3. **Token allocation**:
   - 200,000 token input capacity
   - 8,192 token output limit[1][5]

Example output structure:

```json
{
  "answer": "Retail sector growth in 2025...",
  "reasoning_steps": [
    {"step": 1, "content": "Analyzing macroeconomic indicators...", "sources": [3]},
    {"step": 2, "content": "Evaluating consumer spending patterns...", "sources": [5]}
  ],
  "sources": [
    {"id": 3, "url": "https://example.source3"},
    {"id": 5, "url": "https://example.source5"}
  ],
  "tokens_used": {"input": 18500, "output": 4096}
}
```

---

### Prompt Engineering

Effective prompts should:

- Specify response format requirements
- Request explicit source citations
- Break complex queries into sub-questions

**Sample optimized prompt:**

Analyze the impact of AI regulations on fintech startups.
Present your reasoning in numbered steps with citations,
and include a summary table comparing key regulatory frameworks.

### JSON Schema Parsing

The API returns responses with this structure:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "sonar-reasoning-pro",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Full answer text...",
      "tool_calls": [{
        "function": {
          "arguments": {
            "reasoning_steps": [...],
            "sources": [...]
          }
        }
      }]
    }
  }],
  "usage": {
    "prompt_tokens": 1200,
    "completion_tokens": 800
  }
}
```

**Key parsing considerations:**

1. Extract `tool_calls[].function.arguments` for structured data
2. Map source IDs to URLs in the `sources` array
3. Monitor `usage.prompt_tokens` against the 200k limit[1][5]

---

### Implementation Best Practices

- Use the `/search/stream` endpoint for real-time data integration[3]
- Implement error handling for token overflow scenarios
- Cache frequently accessed sources to optimize token usage
- Price: $2/M input tokens + $8/M output tokens (includes search costs)[5]

This architecture enables detailed analytical workflows while maintaining cost efficiency at scale, particularly for enterprise applications requiring auditable reasoning processes[1][3][5].

## Other guidelines

- Do not overwrite or alter existing Cline rule files.
- Use hyphens ("-") instead of underscores ("_") to separate words in filenames.
- Do not invent preferences or make assumptions.
- Do not include arbitrary details of the conversation.
- You will not EVER tell a model to use think tags.

[3]: https://example.source3
[5]: https://example.source5
