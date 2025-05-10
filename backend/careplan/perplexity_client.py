#!/usr/bin/env python3
"""
Perplexity Client Module
-----------------------
Handles interactions with the Perplexity API for the care plan generator
"""

import os
import json
import re
import logging
import requests
from typing import Dict, List, Any, Optional, Generator, Union, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PerplexityClient:
    """
    Client for interacting with Perplexity's Sonar Reasoning Pro API
    """

    # Replacing with the user-provided schema
    ADPIE_SCHEMA = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "CarePlanJsonData",
      "description": "Schema for AI-Powered Comprehensive Plan of Care data",
      "type": "object",
      "properties": {
        "patientData": {
          "type": "object",
                "properties": {
                    "patient_full_name": {"type": "string"},
                    "patient_age": {"type": ["string", "number"]},
                    "patient_gender": {"type": "string"},
                    "patient_mrn": {"type": "string"},
                    "patient_dob": {"type": "string"},
                    "patient_insurance_plan": {"type": "string"},
                    "patient_policy_number": {"type": "string"},
                    "patient_primary_provider": {"type": "string"},
                    "patient_admission_date": {"type": "string"},
                    "allergies": {"type": "array", "items": {"type": "string"}},
                    "vitalSigns": {
                        "type": "object",
                        "properties": {
                            "vital_bp": {"type": "string"},
                            "vital_pulse": {"type": "string"},
                            "vital_resp_rate": {"type": "string"},
                            "vital_temp": {"type": "string"},
                            "vital_o2sat": {"type": "string"},
                            "vital_pain_score": {"type": "string"}
                        }
                    },
                    "nyha_class_description": {"type": "string"}
                }
            },
            "clinicalData": {
                "type": "object",
                "properties": {
                    "primary_diagnosis_text": {"type": "string"},
                    "secondaryDiagnoses": {"type": "array", "items": {"type": "string"}},
                    "labs": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "lab_n_name": {"type": "string"},
                                "lab_n_value": {"type": "string"},
                                "lab_n_flag": {"type": "string"},
                                "lab_n_trend": {"type": "string"}
                            }
                        }
                    },
                    "medications": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "med_n_name": {"type": "string"},
                                "med_n_dosage": {"type": "string"},
                                "med_n_route": {"type": "string"},
                                "med_n_frequency": {"type": "string"},
                                "med_n_status": {"type": "string"},
                                "med_n_pa_required": {"type": ["boolean", "string"]}
                            }
                        }
                    },
                    "treatments": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "treatment_n_name": {"type": "string"},
                                "treatment_n_status": {"type": "string"},
                                "treatment_n_details": {"type": "string"},
                                "treatment_n_date": {"type": "string"},
                                "treatment_n_pa_required": {"type": ["boolean", "string"]}
                            }
                        }
                    },
                    "last_imaging_summary": {"type": "string"},
                    "last_ecg_summary": {"type": "string"}
                }
            },
            "aiAgents": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "specialty": {"type": "string"}
                    },
                    "additionalProperties": True
                }
            },
            "priorAuthItems": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "item": {"type": "string"},
                        "type": {"type": "string"},
                        "status": {"type": "string"},
                        "submittedDate": {"type": "string"},
                        "approvedDate": {"type": "string"},
                        "expirationDate": {"type": "string"},
                        "estimatedResponse": {"type": "string"},
                        "estimatedSubmission": {"type": "string"},
                        "confidence": {"type": "string"},
                        "criteria": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "met": {"type": ["boolean", "string"]},
                                    "notes": {"type": "string"}
                                }
                            }
                        }
                    },
                    "additionalProperties": True
                }
            },
            "sourcesData": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "title": {"type": "string"},
                        "type": {"type": "string"},
                        "url": {"type": "string"},
                        "snippet": {"type": "string"},
                        "retrieval_date": {"type": "string"},
                        "agent_source": {"type": "string"}
                    },
                    "additionalProperties": True
                }
            },
            "assessment_subjective_chief_complaint": {"type": "string"},
            "assessment_subjective_hpi": {"type": "string"},
            "assessment_subjective_goals": {"type": "string"},
            "assessment_subjective_other": {"type": "string"},
            "assessment_objective_vitals_summary": {"type": "string"},
            "assessment_objective_physical_exam": {"type": "string"},
            "assessment_objective_diagnostics": {"type": "string"},
        "assessment_objective_meds_reviewed": { "type": "string" },
        "assessment_objective_other": { "type": "string" },
        "nursingDiagnoses": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "diagnosis_nanda": { "type": "string" },
              "diagnosis_related_to": { "type": "string" },
              "diagnosis_evidence": { "type": "array", "items": { "type": "string" } },
              "diagnosis_is_risk": { "type": "boolean" },
              "diagnosis_risk_factors": { "type": "array", "items": { "type": "string" } },
              "goals": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "goal_description": { "type": "string" },
                    "goal_target_date": { "type": "string", "format": "date" },
                    "goal_outcomes": { "type": "array", "items": { "type": "string" } },
                    "goal_rationale": { "type": "string" }
                  },
                  "required": ["goal_description", "goal_outcomes"]
                }
              },
              "interventions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "intervention_action": { "type": "string" },
                    "intervention_rationale": { "type": "string" },
                    "intervention_is_pending": { "type": "boolean" }
                  },
                  "required": ["intervention_action", "intervention_rationale"]
                }
              }
            },
            "required": ["diagnosis_nanda", "diagnosis_evidence", "goals", "interventions"]
          }
        },
        "evaluations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "evaluation_goal_description_ref": { "type": "string" },
              "evaluation_date": { "type": "string", "format": "date" },
              "evaluation_status": { "type": "string" },
              "evaluation_evidence": { "type": "string" },
              "evaluation_revision": { "type": "string" },
              "evaluation_rationale": { "type": "string" }
            },
            "required": ["evaluation_goal_description_ref", "evaluation_evidence"]
          }
        },
        "interdisciplinaryPlan": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "discipline": { "type": "string" },
                    "plan_item": { "type": "string" }
                },
                "required": ["discipline", "plan_item"]
            }
        },
        "overall_plan_summary": { "type": "string" },
        "next_steps": { "type": "array", "items": { "type": "string" }, "default": [] },
        "notification_title": { "type": "string" },
        "notification_message": { "type": "string" },
        "notification_detail_1": { "type": "string" },
        "notification_detail_2": { "type": "string" }
      },
      "required": ["patientData", "clinicalData", "nursingDiagnoses", "evaluations", "next_steps"]
    }


    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Perplexity API client
        
        Args:
            api_key: Perplexity API key (if None, will try to load from env var)
        """
        self.api_key = api_key or os.environ.get('SONAR_API_KEY')
        if not self.api_key:
            raise ValueError("API key not provided and SONAR_API_KEY environment variable not set")
            
        self.base_url = "https://api.perplexity.ai"
        self.chat_endpoint = f"{self.base_url}/chat/completions"
        
        # Removed blocking API key validation during initialization
        # self._validate_api_key() 
        # Validation will happen implicitly on the first actual API call.

    def _format_reasoning_as_markdown(self, reasoning_text: str) -> str:
        """
        Formats raw reasoning text into Markdown.
        """
        if not reasoning_text:
            return ""

        # Normalize line endings
        markdown = reasoning_text.replace('\r\n', '\n')

        # Headings: Convert lines like "Assessment:" or "Step 1:"
        markdown = re.sub(r'^(Assessment|Diagnosis|Planning|Implementation|Evaluation|Conclusion|Summary):$', r'## \1:', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^(Step\s*\d+):', r'### \1:', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^(Rationale|Evidence|Considerations):$', r'#### \1:', markdown, flags=re.MULTILINE)

        # Bold important keywords (case-insensitive, whole word)
        keywords_to_bold = [
            'ADPIE', 'NANDA', 'CHF', 'Congestive Heart Failure', 'Hypertension', 'Diabetes',
            'Assessment', 'Diagnosis', 'Planning', 'Implementation', 'Evaluation',
            'Goal', 'Outcome', 'Intervention', 'Rationale', 'Evidence', 'Risk for', 'Related to', 'As evidenced by'
        ]
        for keyword in keywords_to_bold:
            # Match whole word, case insensitive
            markdown = re.sub(r'\b(' + re.escape(keyword) + r')\b', r'**\1**', markdown, flags=re.IGNORECASE)

        # Italicize source references (e.g., [S1], [3], [Source A])
        markdown = re.sub(r'(\[\s*(?:S\d+|\d+|[A-Za-z]+)\s*\])', r'*\1*', markdown)
        
        # Format bulleted lists (lines starting with - or *)
        markdown = re.sub(r'^\s*-\s+(.*)', r'* \1', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^\s*\*\s+(.*)', r'* \1', markdown, flags=re.MULTILINE)

        # Format numbered lists (lines starting with 1., 2., etc.)
        markdown = re.sub(r'^\s*(\d+\.)\s+(.*)', r'\1 \2', markdown, flags=re.MULTILINE)

        # Format blockquotes (lines starting with >)
        markdown = re.sub(r'^\s*>\s*(.*)', r'> \1', markdown, flags=re.MULTILINE)

        # Ensure proper paragraph spacing (convert single newlines within a block to space, multiple newlines to paragraph breaks)
        # This is tricky with regex alone for complex cases, but a common approach is to split by double newlines, then process blocks
        blocks = markdown.split('\n\n')
        processed_blocks = []
        for block in blocks:
            # Join lines within a block that are not list items or headings
            if not (block.startswith('* ') or block.startswith('#') or block.startswith('>') or re.match(r'^\d+\.\s', block)):
                block = block.replace('\n', ' ') # Convert single newlines to spaces
            processed_blocks.append(block.strip())
        markdown = '\n\n'.join(processed_blocks)

        return markdown.strip()
        
    def _validate_api_key(self) -> bool:
        """
        Validate the API key by making a minimal request to Perplexity
        
        Returns:
            bool: True if the API key is valid, raises an exception otherwise
        """
        headers = self._get_headers()
        payload = {
            "model": "sonar-reasoning-pro",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 8000
        }
        
        try:
            logger.info("Validating API key...")
            response = requests.post(
                self.chat_endpoint,
                headers=headers,
                json=payload,
                timeout=15 # Increased timeout to 15 seconds
            )
            
            if response.status_code != 200:
                error_msg = f"API key validation failed: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise ValueError(error_msg)
                
            logger.info("API key validated successfully")
            return True
            
        except requests.RequestException as e:
            error_msg = f"Error validating API key: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    def _get_headers(self) -> Dict[str, str]:
        """
        Get the headers for Perplexity API requests
        
        Returns:
            Dict[str, str]: The headers with authorization
        """
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    # Removed non-streaming generate_care_plan method
    
    def stream_care_plan(self, patient_data: Dict[str, Any]) -> Generator[Dict[str, Any], None, None]:
        """
        Stream a care plan generation from the Perplexity Sonar API
        
        Args:
            patient_data: Dictionary containing patient information
            
        Yields:
            Dict[str, Any]: Chunks of the streaming response
        """
        try:
            # Construct the system and user prompts
            system_prompt, user_prompt = self._construct_prompts(patient_data)
            
            # Build the payload for streaming with separate system and user messages
            payload = {
                "model": "sonar-reasoning-pro",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": 8000, # Increased token limit
                "stream": True,
                "response_format": {
                    "type": "json_schema",
                    "json_schema": { "schema": self.ADPIE_SCHEMA } 
                }
            }
            
            logger.info("Starting streaming request to Perplexity API with JSON schema")
            headers = self._get_headers()
            
            # Send the streaming request
            response = requests.post(
                self.chat_endpoint,
                headers=headers,
                json=payload,
                stream=True,
                timeout=60 
            )
            
            if response.status_code != 200:
                error_msg = f"Perplexity API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield {"type": "error", "content": error_msg}
                return
                
            # Process the streaming response
            accumulated_content = "" # For the full message content
            last_known_citations: List[str] = [] # To track and yield citations only when they change
            
            for line in response.iter_lines():
                if line:
                    line_text = line.decode('utf-8')
                    if line_text.startswith('data: '):
                        json_str = line_text[len('data: '):]
                        
                        if json_str == "[DONE]":
                            logger.info("Received [DONE] signal from stream.")
                            break
                            
                        try:
                            chunk = json.loads(json_str)
                            
                            # Extract and yield citations if they have changed
                            current_citations = chunk.get("citations", []) # Perplexity API might include citations field
                            if current_citations and current_citations != last_known_citations:
                                logger.info(f"Yielding updated citations: {current_citations}")
                                yield {"type": "citations", "content": current_citations}
                                last_known_citations = current_citations
                            
                            # Extract delta content
                            delta_content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            
                            if delta_content:
                                accumulated_content += delta_content
                                # Yield raw content chunk
                                yield {"type": "content_chunk", "content": delta_content}
                                
                        except json.JSONDecodeError:
                            logger.warning(f"Skipping non-JSON line in stream: {json_str}")
                            continue
            
            # Post-stream processing
            logger.info("Streaming complete. Processing accumulated content.")
            
            # Extract Raw Reasoning
            raw_reasoning = self._extract_reasoning_from_think_tags(accumulated_content)
            logger.info(f"Raw reasoning extracted (first 100 chars): {raw_reasoning[:100]}")

            # Format Reasoning
            formatted_reasoning_markdown = self._format_reasoning_as_markdown(raw_reasoning)
            logger.info(f"Formatted reasoning generated (first 100 chars): {formatted_reasoning_markdown[:100]}")
            
            # Yield Formatted Reasoning
            yield {"type": "final_reasoning", "content": formatted_reasoning_markdown}
            
            # Extract Schema JSON
            json_data = self._extract_json_from_response(accumulated_content)
            if json_data:
                 logger.info("JSON data extracted successfully.")
            else:
                 logger.warning("Failed to extract JSON data from accumulated content.")
            
            # Yield Schema JSON
            yield {"type": "final_json", "content": json_data}
            
        except Exception as e:
            error_msg = f"Error in streaming: {str(e)}"
            logger.exception("Exception during streaming care plan:") # Log full traceback
            logger.error(error_msg)
            yield {"type": "error", "content": error_msg}
    
    def _construct_prompts(self, patient_data: Dict[str, Any]) -> Tuple[str, str]:
        """
        Construct system and user prompts for the care plan generation
        
        Args:
            patient_data: Dictionary containing patient information
            
        Returns:
            Tuple[str, str]: The system prompt and user prompt
        """
        # Convert patient data to a formatted string
        patient_data_str = json.dumps(patient_data, indent=2)
        
        # The system prompt with instructions for the model, updated for new schema and content requirements
        system_prompt = """
        You are Ron of Ron AI, an expert clinical AI specializing in comprehensive, evidence-based ADPIE nursing care plans.
        
        1.  **Reasoning First:** Begin your response with your detailed clinical reasoning enclosed in `<think>` tags. Analyze the patient data thoroughly.
        2.  **Structured JSON:** Following the reasoning, provide a structured JSON object for the care plan. This JSON object MUST strictly adhere to the JSON schema provided in the API request.
        
        **JSON Content Requirements:**
        
        *   **Populate Fully:** Fill all relevant sections: `patientData`, `clinicalData`, `assessment_*`, `nursingDiagnoses`, `interdisciplinaryPlan`, `evaluations`, `overall_plan_summary`, `next_steps`, `aiAgents`, `priorAuthItems`, `sourcesData`, and `notification_*` fields if applicable.
        *   **Nursing Diagnoses (Critical Detail):**
            *   Identify priority nursing diagnoses (actual and risk).
            *   For **each** diagnosis in the `nursingDiagnoses` array:
                *   Provide the `diagnosis_nanda` label.
                *   Provide the `diagnosis_related_to` factors.
                *   If it's an actual diagnosis (`diagnosis_is_risk` is false or omitted), list **at least 5** specific subjective/objective assessment findings in the `diagnosis_evidence` array.
                *   If it's a risk diagnosis (`diagnosis_is_risk` is true), list relevant risk factors in the `diagnosis_risk_factors` array.
                *   Define **at least 3** patient-centered SMART goals in the `goals` array, each with a `goal_description`, `goal_target_date`, and measurable `goal_outcomes` (array of strings).
                *   List **at least 10** specific nursing interventions in the `interventions` array, each with a detailed `intervention_action` and `intervention_rationale`. Use `intervention_is_pending` if appropriate.
        *   **Citations:** Use inline citations (e.g., [S1], [S2]) within rationales or evidence fields where appropriate. Ensure every cited source corresponds to an entry in the `sourcesData` array within the JSON.
        *   **`sourcesData` Array:** Populate this array comprehensively for all cited sources, including `id`, `title`, `type`, `url` (if available), `snippet`, `retrieval_date`, and `agent_source`.
        
        Ensure your reasoning is thorough and directly supports the diagnoses, goals, and interventions selected in the JSON plan. Prioritize patient safety and evidence-based practice.
        """
        
        # The user prompt containing patient data (remains the same)
        user_prompt = f"""
        Please generate a comprehensive ADPIE nursing care plan for the patient detailed below, including your clinical reasoning, AI agent contributions, prior authorization considerations, and cited sources, followed by the structured JSON care plan.

        Patient Data:
        {patient_data_str}
        """
        return system_prompt, user_prompt
    
    # _process_response is no longer called directly by stream_care_plan.
    # Its logic has been integrated into the post-stream processing section of stream_care_plan.
    # It can be kept if other methods might use it, or removed if not.
    # For now, let's comment it out to ensure it's not accidentally used.
    # def _process_response(self, response_text: str) -> Dict[str, Any]:
    #     """
    #     Process the response from the Perplexity API
        
    #     Args:
    #         response_text: The raw response text from the API (expected to be message.content)
            
    #     Returns:
    #         Dict[str, Any]: The processed response with reasoning and JSON data
    #     """
    #     # Extract reasoning from think tags (searches the whole text)
    #     reasoning = self._extract_reasoning_from_think_tags(response_text)
        
    #     # Extract JSON data from the whole text, independent of reasoning block position
    #     json_data = self._extract_json_from_response(response_text)
        
    #     # Return the formatted result
    #     return {
    #         "reasoning": reasoning,
    #         "json_data": json_data
    #     }

    def _extract_reasoning_from_think_tags(self, response_text: str) -> str:
        """
        Extract reasoning content from <think> tags
        
        Args:
            response_text: The raw response text
            
        Returns:
            str: The extracted reasoning content
        """
        pattern = r'<think>(.*?)</think>'
        matches = re.findall(pattern, response_text, re.DOTALL)
        
        if matches:
            # Join all found reasoning blocks with newlines
            return '\n\n'.join(matches)
        
        # If no think tags found, return empty string
        return ""
    
    def _extract_json_from_response(self, response_text: str) -> Dict[str, Any]:
        """
        Extract JSON content from the response
        
        Args:
            response_text: The raw response text potentially containing JSON and other text.
            
        Returns:
            Dict[str, Any]: The extracted JSON data, or an empty dict if not found/invalid.
        """
        # Attempt to find the first '{' and its corresponding '}' to extract the JSON object
        json_obj = None
        start_index = response_text.find('{')
        if start_index != -1:
            brace_level = 0
            for i, char in enumerate(response_text[start_index:]):
                if char == '{':
                    brace_level += 1
                elif char == '}':
                    brace_level -= 1
                
                if brace_level == 0:
                    # Found a potential JSON object string
                    potential_json_str = response_text[start_index : start_index + i + 1]
                    try:
                        json_obj = json.loads(potential_json_str)
                        # Successfully parsed, break the loop
                        break 
                    except json.JSONDecodeError:
                        # This substring wasn't valid JSON, continue searching if possible
                        # (This simple version takes the first complete {} block)
                        logger.warning(f"Found a '{{...}}' block but it wasn't valid JSON: {potential_json_str[:100]}...")
                        # More robust logic could search for the *next* '{' here, 
                        # but for now, we assume the first complete block is the target.
                        pass # Continue to the end of the function which returns {} if json_obj is still None
            
        if json_obj:
            return json_obj
        else:
            logger.warning("Could not find or parse a valid JSON object in the response text.")
            logger.debug(f"Full response text for JSON extraction failure: {response_text}")
            return {}

# Create a singleton instance
def get_perplexity_client() -> PerplexityClient:
    """Get or create a singleton instance of the PerplexityClient"""
    if not hasattr(get_perplexity_client, 'instance'):
        get_perplexity_client.instance = PerplexityClient()
    return get_perplexity_client.instance
