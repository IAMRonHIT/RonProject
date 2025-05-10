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

    ADPIE_SCHEMA = {
        "type": "object",
        "properties": {
            "patientData": {
                "type": ["object", "null"],
                "properties": {
                    "patient_full_name": {"type": ["string", "null"]},
                    "patient_age": {"type": ["string", "number", "null"]},
                    "patient_gender": {"type": ["string", "null"]},
                    "patient_mrn": {"type": ["string", "null"]},
                    "patient_dob": {"type": ["string", "null"]},
                    "patient_insurance_plan": {"type": ["string", "null"]},
                    "patient_policy_number": {"type": ["string", "null"]},
                    "patient_primary_provider": {"type": ["string", "null"]},
                    "patient_admission_date": {"type": ["string", "null"]},
                    "allergies": {"type": ["array", "null"], "items": {"type": "string"}},
                    "vitalSigns": {
                        "type": ["object", "null"],
                        "properties": {
                            "vital_bp": {"type": ["string", "null"]},
                            "vital_pulse": {"type": ["string", "null"]},
                            "vital_resp_rate": {"type": ["string", "null"]},
                            "vital_temp": {"type": ["string", "null"]},
                            "vital_o2sat": {"type": ["string", "null"]},
                            "vital_pain_score": {"type": ["string", "null"]},
                        },
                        "additionalProperties": False
                    },
                    "nyha_class_description": {"type": ["string", "null"]},
                },
                "additionalProperties": False
            },
            "clinicalData": {
                "type": ["object", "null"],
                "properties": {
                    "primary_diagnosis_text": {"type": ["string", "null"]},
                    "secondaryDiagnoses": {"type": ["array", "null"], "items": {"type": "string"}},
                    "labs": {
                        "type": ["array", "null"],
                        "items": {
                            "type": "object",
                            "properties": {
                                "lab_n_name": {"type": ["string", "null"]},
                                "lab_n_value": {"type": ["string", "null"]},
                                "lab_n_flag": {"type": ["string", "null"]},
                                "lab_n_trend": {"type": ["string", "null"]},
                            },
                            "additionalProperties": False
                        }
                    },
                    "medications": {
                        "type": ["array", "null"],
                        "items": {
                            "type": "object",
                            "properties": {
                                "med_n_name": {"type": ["string", "null"]},
                                "med_n_dosage": {"type": ["string", "null"]},
                                "med_n_route": {"type": ["string", "null"]},
                                "med_n_frequency": {"type": ["string", "null"]},
                                "med_n_status": {"type": ["string", "null"]},
                                "med_n_pa_required": {"type": ["boolean", "string", "null"]},
                            },
                            "additionalProperties": False
                        }
                    },
                    "treatments": {
                        "type": ["array", "null"],
                        "items": {
                            "type": "object",
                            "properties": {
                                "treatment_n_name": {"type": ["string", "null"]},
                                "treatment_n_status": {"type": ["string", "null"]},
                                "treatment_n_details": {"type": ["string", "null"]},
                                "treatment_n_date": {"type": ["string", "null"]},
                                "treatment_n_pa_required": {"type": ["boolean", "string", "null"]},
                            },
                            "additionalProperties": False
                        }
                    },
                    "last_imaging_summary": {"type": ["string", "null"]},
                    "last_ecg_summary": {"type": ["string", "null"]},
                },
                "additionalProperties": False
            },
            "aiAgents": {
                "type": ["array", "null"],
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": ["string", "null"]},
                        "specialty": {"type": ["string", "null"]},
                    },
                    "additionalProperties": True 
                }
            },
            "priorAuthItems": {
                "type": ["array", "null"],
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": ["string", "null"]},
                        "item": {"type": ["string", "null"]},
                        "type": {"type": ["string", "null"]},
                        "status": {"type": ["string", "null"]},
                        "submittedDate": {"type": ["string", "null"]},
                        "approvedDate": {"type": ["string", "null"]},
                        "expirationDate": {"type": ["string", "null"]},
                        "estimatedResponse": {"type": ["string", "null"]},
                        "estimatedSubmission": {"type": ["string", "null"]},
                        "confidence": {"type": ["string", "number", "null"]},
                        "criteria": {
                            "type": ["array", "null"],
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": ["string", "null"]},
                                    "met": {"type": ["boolean", "string", "null"]},
                                    "notes": {"type": ["string", "null"]},
                                },
                                "additionalProperties": False
                            }
                        }
                    },
                    "additionalProperties": True 
                }
            },
            "sourcesData": {
                "type": ["array", "null"],
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": ["string", "null"]},
                        "title": {"type": ["string", "null"]},
                        "type": {"type": ["string", "null"]},
                        "url": {"type": ["string", "null"]},
                        "snippet": {"type": ["string", "null"]},
                        "retrieval_date": {"type": ["string", "null"]},
                        "agent_source": {"type": ["string", "null"]},
                    },
                    "additionalProperties": True
                }
            },
            "assessment_subjective_chief_complaint": {"type": ["string", "null"]},
            "assessment_subjective_hpi": {"type": ["string", "null"]},
            "assessment_subjective_goals": {"type": ["string", "null"]},
            "assessment_subjective_other": {"type": ["string", "null"]},
            "assessment_objective_vitals_summary": {"type": ["string", "null"]},
            "assessment_objective_physical_exam": {"type": ["string", "null"]},
            "assessment_objective_diagnostics": {"type": ["string", "null"]},
            "assessment_objective_meds_reviewed": {"type": ["string", "null"]},
            "assessment_objective_other": {"type": ["string", "null"]},
            "diagnosis_1_nanda": {"type": ["string", "null"]},
            "diagnosis_1_related_to": {"type": ["string", "null"]},
            "diagnosis_1_evidence": {"type": ["string", "null"]},
            "diagnosis_2_nanda": {"type": ["string", "null"]},
            "diagnosis_2_related_to": {"type": ["string", "null"]},
            "diagnosis_2_evidence": {"type": ["string", "null"]},
            "diagnosis_3_nanda_risk": {"type": ["string", "null"]},
            "diagnosis_3_related_to_risk_factors": {"type": ["string", "null"]},
            "goal_1_description": {"type": ["string", "null"]},
            "goal_1_target_date": {"type": ["string", "null"]},
            "goal_1_outcome_1": {"type": ["string", "null"]},
            "goal_1_outcome_2": {"type": ["string", "null"]},
            "goal_2_description": {"type": ["string", "null"]},
            "goal_2_target_date": {"type": ["string", "null"]},
            "goal_2_outcome_1": {"type": ["string", "null"]},
            "Discipline_1": {"type": ["string", "null"]},
            "discipline_1_plan_item_1": {"type": ["string", "null"]},
            "discipline_1_plan_item_2": {"type": ["string", "null"]},
            "Discipline_2": {"type": ["string", "null"]},
            "discipline_2_plan_item_1": {"type": ["string", "null"]},
            "intervention_target_1": {"type": ["string", "null"]},
            "intervention_1_action": {"type": ["string", "null"]},
            "intervention_1_rationale": {"type": ["string", "null"]},
            "intervention_2_action": {"type": ["string", "null"]},
            "intervention_2_rationale": {"type": ["string", "null"]},
            "intervention_3_action_pending": {"type": ["string", "null"]},
            "intervention_3_rationale": {"type": ["string", "null"]},
            "intervention_target_2": {"type": ["string", "null"]},
            "intervention_4_action": {"type": ["string", "null"]},
            "intervention_4_rationale": {"type": ["string", "null"]},
            "evaluation_1_date": {"type": ["string", "null"]},
            "evaluation_1_status": {"type": ["string", "null"]},
            "evaluation_1_evidence": {"type": ["string", "null"]},
            "evaluation_1_revision": {"type": ["string", "null"]},
            "evaluation_2_date": {"type": ["string", "null"]},
            "evaluation_2_status": {"type": ["string", "null"]},
            "evaluation_2_evidence": {"type": ["string", "null"]},
            "evaluation_2_revision": {"type": ["string", "null"]},
            "overall_plan_summary": {"type": ["string", "null"]},
            "next_step_1": {"type": ["string", "null"]},
            "next_step_2": {"type": ["string", "null"]},
            "next_step_3": {"type": ["string", "null"]},
            "notification_title": {"type": ["string", "null"]},
            "notification_message": {"type": ["string", "null"]},
            "notification_detail_1": {"type": ["string", "null"]},
            "notification_detail_2": {"type": ["string", "null"]},
        },
        "additionalProperties": False,
        "required": [
            "patientData", 
            "clinicalData",
            "assessment_subjective_chief_complaint",
            "diagnosis_1_nanda",
            "goal_1_description",
            "intervention_1_action",
            "evaluation_1_status",
            "overall_plan_summary"
        ]
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
        
        # Verify API key is valid upon initialization
        self._validate_api_key()
        
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
            "max_tokens": 5
        }
        
        try:
            logger.info("Validating API key...")
            response = requests.post(
                self.chat_endpoint,
                headers=headers,
                json=payload,
                timeout=5
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
                "max_tokens": 4000, 
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
            full_response = ""
            
            for line in response.iter_lines():
                if line:
                    line_text = line.decode('utf-8')
                    if line_text.startswith('data: '):
                        json_str = line_text[len('data: '):]
                        
                        if json_str == "[DONE]":
                            break
                            
                        try:
                            chunk = json.loads(json_str)
                            if chunk.get("choices") and chunk["choices"][0].get("delta") and chunk["choices"][0]["delta"].get("content"):
                                content = chunk["choices"][0]["delta"]["content"]
                                full_response += content
                                # Yield content chunks as they arrive.
                                yield {"type": "content_chunk", "content": content}
                        except json.JSONDecodeError:
                            logger.warning(f"Skipping non-JSON line in stream: {json_str}")
                            continue
            
            # Process the complete response after the stream has finished
            logger.info("Streaming complete, now processing full response for reasoning and JSON extraction.")
            final_result = self._process_response(full_response)
            
            # Yield the complete result
            yield {"type": "complete", "content": final_result}
            
        except Exception as e:
            error_msg = f"Error in streaming: {str(e)}"
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
        
        # The system prompt with instructions for the model
        system_prompt = """
        You are Ron of Ron AI, an expert clinical AI. 
        Your primary task is to generate a comprehensive, evidence-based ADPIE nursing care plan.
        
        First, provide your detailed clinical reasoning and analysis of the patient's situation. This reasoning should be thorough, evidence-based, and patient-centered, considering all relevant patient data.

        Next, generate a structured JSON object for the care plan. This JSON object MUST strictly adhere to the JSON schema provided in the API request. 
        Ensure all relevant sections of the schema are populated, including:
        - `patientData`
        - `clinicalData` (with `labs`, `medications`, `treatments`)
        - All ADPIE sections (`assessment_*`, `diagnosis_*`, `planning_*` including `goal_*` and `Discipline_*`, `implementation_*`, `evaluation_*`)
        - `overall_plan_summary` and `next_step_*` fields.
        - `aiAgents`: For each agent, include `name`, `specialty`. Also, provide their specific contributions to each ADPIE section using dynamic keys like `agent_name_assessmentContribution`, `agent_name_diagnosisContribution`, etc., and any insights using keys like `agent_name_insight_1`, `agent_name_insight_2`. Include a confidence score like `agent_name_confidence_score`.
        - `priorAuthItems`: Detail any anticipated prior authorizations, including criteria.
        - `sourcesData`: List any evidence-based sources or citations used, including title, URL if applicable, and a brief snippet or relevance.
        - `notification_title` and `notification_message` if any urgent alerts are warranted.
        """
        
        # The user prompt containing patient data
        user_prompt = f"""
        Please generate a comprehensive ADPIE nursing care plan for the patient detailed below, including your clinical reasoning, AI agent contributions, prior authorization considerations, and cited sources, followed by the structured JSON care plan.

        Patient Data:
        {patient_data_str}
        """
        return system_prompt, user_prompt
    
    def _process_response(self, response_text: str) -> Dict[str, Any]:
        """
        Process the response from the Perplexity API
        
        Args:
            response_text: The raw response text from the API
            
        Returns:
            Dict[str, Any]: The processed response with reasoning and JSON data
        """
        # Extract reasoning from think tags
        reasoning = self._extract_reasoning_from_think_tags(response_text)
        
        # Remove the reasoning part (and <think> tags) to isolate potential JSON
        text_after_reasoning = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
        
        # Extract JSON data from the remaining text
        json_data = self._extract_json_from_response(text_after_reasoning)
        
        # Return the formatted result (reasoning_steps is removed)
        return {
            "reasoning": reasoning,
            "json_data": json_data
        }
    
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
            response_text: The raw response text (expected to be JSON after <think> block removal)
            
        Returns:
            Dict[str, Any]: The extracted JSON data
        """
        # With json_schema, the API should return a valid JSON string directly
        # after the <think> block (if any).
        # We attempt to parse it directly.
        if not response_text: # If the text after <think> block is empty
            logger.warning("No text found after <think> block to parse as JSON.")
            return {}
            
        try:
            # The response_text here is expected to be the JSON string itself
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON from response after <think> block: {e}")
            logger.error(f"Problematic text: '{response_text[:500]}...'") # Log snippet
            return {}

# Create a singleton instance
def get_perplexity_client() -> PerplexityClient:
    """Get or create a singleton instance of the PerplexityClient"""
    if not hasattr(get_perplexity_client, 'instance'):
        get_perplexity_client.instance = PerplexityClient()
    return get_perplexity_client.instance
