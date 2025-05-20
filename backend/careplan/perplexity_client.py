import asyncio
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple # Added Tuple

import aiohttp
from dotenv import load_dotenv
from pydantic import ValidationError # For validating parsed models

# Direct import as sonar_schemas.py is in the same directory
from sonar_schemas import (
    SingleNursingDiagnosisADPIEOutputSchema,
    SonarExpectedPaOutputSchema,
    PriorAuthItemSchema # Keep for PA validation
)

load_dotenv()

SONAR_API_KEY = os.getenv("SONAR_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

async def _make_request(
    session: aiohttp.ClientSession,
    messages: List[Dict[str, str]],
    model: str = "sonar-reasoning-pro",
    temperature: float = 0.2,
    max_tokens: int = 4096, # Increased max_tokens for potentially large ADPIE outputs
    response_format_schema: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Helper function to make a request to the Perplexity API."""
    if not SONAR_API_KEY:
        raise ValueError("SONAR_API_KEY not found in environment variables.")

    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format_schema:
        payload["response_format"] = response_format_schema

    headers = {
        "Authorization": f"Bearer {SONAR_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        async with session.post(PERPLEXITY_API_URL, json=payload, headers=headers) as resp:
            resp.raise_for_status()
            return await resp.json()
    except aiohttp.ClientError as e:
        print(f"AIOHTTP ClientError in _make_request: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error in _make_request: {e}")
        raise

def parse_perplexity_response(
    api_response_data: Dict[str, Any]
) -> Tuple[Optional[Dict[str, Any]], Optional[str], Optional[List[Dict[str, Any]]]]:
    """
    Parses the Perplexity API response to extract reasoning, the main structured JSON output, and top-level citations.
    Returns a tuple: (parsed_json_payload, reasoning_text, citations_list)
    """
    reasoning_text: Optional[str] = None
    parsed_json_payload: Optional[Dict[str, Any]] = None
    citations_list: Optional[List[Dict[str, Any]]] = None

    try:
        if "citations" in api_response_data and isinstance(api_response_data["citations"], list):
            citations_list = api_response_data["citations"]
        elif "sources" in api_response_data and isinstance(api_response_data["sources"], list):
            citations_list = api_response_data["sources"]
            if citations_list:
                 print("Warning: Found 'sources' key for citations, not 'citations'. Using 'sources'.")
        
        full_content = api_response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not full_content:
            print("Warning: No content found in API response choices.")
            return None, None, citations_list

        think_match = re.search(r"<think>(.*?)</think>", full_content, re.DOTALL | re.IGNORECASE)
        if think_match:
            reasoning_text = think_match.group(1).strip()
            json_string_part = full_content[think_match.end():].strip()
        else:
            json_string_part = full_content.strip()
            print("Warning: <think>...</think> block not found in the response.")

        if json_string_part:
            try:
                json_obj_match = re.search(r"^\s*(\{.*\}|\[.*\])\s*$", json_string_part, re.DOTALL)
                if json_obj_match:
                    actual_json_str = json_obj_match.group(0)
                    parsed_json_payload = json.loads(actual_json_str)
                else: # Fallback if regex doesn't find a clear object/array at the start
                    # This might happen if there's leading/trailing non-JSON text not caught
                    print(f"Warning: Could not find clear JSON object/array in string part: '{json_string_part[:100]}...' Trying to load directly.")
                    parsed_json_payload = json.loads(json_string_part) # Attempt direct load
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from response part: '{json_string_part[:500]}...' Error: {e}")
        
    except KeyError as e:
        print(f"KeyError accessing response data: {e}. Response: {api_response_data}")
    except Exception as e:
        print(f"Unexpected error parsing Perplexity response: {e}")

    return parsed_json_payload, reasoning_text, citations_list

async def generate_full_adpie_for_one_diagnosis(
    form_state_dict: Dict[str, Any],
    previously_selected_nanda_labels: List[str],
    session: aiohttp.ClientSession
) -> Dict[str, Any]:
    """
    Generates a complete ADPIE set for a single, new nursing diagnosis.
    """
    schema_for_prompt = SingleNursingDiagnosisADPIEOutputSchema.model_json_schema()
    patient_context_json = json.dumps(form_state_dict, indent=2) # Use indent for readability in logs if needed
    
    previously_selected_str = ", ".join(previously_selected_nanda_labels) if previously_selected_nanda_labels else "None"

    system_prompt = (
        "You are Ron, of Ron AI, an expert AI clinical assistant. Your task is to generate a complete ADPIE (Assessment, Diagnosis, Planning, Implementation, Evaluation) "
        "for a single, clinically relevant nursing diagnosis based on the provided patient context. "
        "If a list of 'Previously Selected NANDA Labels' is provided, you MUST select a NEW, DIFFERENT, and clinically relevant NANDA diagnosis not on that list. "
        "If the list is 'None' or empty, select the most primary nursing diagnosis.\n\n"
        "For the **single** nursing diagnosis you select, you MUST generate:\n"
        "1.  The NANDA diagnosis statement (`diagnosis_nanda`, `related_to`, `evidence`, `is_risk`, `risk_factors`).\n"
        "2.  Narrative subjective and objective assessment findings relevant to THIS diagnosis (`assessment_subjective_chief_complaint`, etc.).\n"
        "3.  Exactly ten (10) `recommendedAssessmentsList` items for THIS diagnosis (each with `item`, `rationale`, `status`).\n"
        "4.  Exactly three (3) `goals` for THIS diagnosis. Each goal must include:\n"
        "    a.  `goal_description`, `goal_target_date`, `goal_outcomes` (list), `goal_rationale`.\n"
        "    b.  For each goal, exactly one (1) `evaluation` (`evaluationText`, `evaluationMethod`, `evaluationTargetDate`, `evaluationStatus`).\n"
        "    c.  For each goal, a list of 3-4 `interventions` (totaling 10 interventions for the diagnosis, with at least 3 of those 10 being 'health_teaching'). Each intervention: `interventionText`, `interventionType`, `rationale`.\n"
        "5.  `interdisciplinaryPlan` items relevant to THIS diagnosis.\n\n"
        "The entire output for this single diagnosis and its ADPIE components MUST strictly conform to the `SingleNursingDiagnosisADPIEOutputSchema` JSON schema. "
        "Output your reasoning within <think></think> tags, followed by the JSON object."
    )

    user_prompt = (
        f"Patient Context:\n```json\n{patient_context_json}\n```\n\n"
        f"Previously Selected NANDA Labels: [{previously_selected_str}]\n\n"
        "Instruction: Based on the patient context, select ONE new nursing diagnosis not listed above. "
        "Then, generate its complete ADPIE components as specified in the system prompt and structure your response according to the `SingleNursingDiagnosisADPIEOutputSchema`."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response_format_config = {
        "type": "json_schema",
        "json_schema": {"schema": schema_for_prompt},
    }

    api_response_data = await _make_request(
        session,
        messages=messages,
        response_format_schema=response_format_config
    )

    parsed_json_payload, reasoning_text, citations = parse_perplexity_response(api_response_data)
    
    validated_adpie_data: Optional[SingleNursingDiagnosisADPIEOutputSchema] = None
    if parsed_json_payload:
        try:
            validated_adpie_data = SingleNursingDiagnosisADPIEOutputSchema.model_validate(parsed_json_payload)
        except ValidationError as e:
            print(f"Pydantic validation error for ADPIE data: {e}")
            print(f"Problematic JSON payload: {parsed_json_payload}")
            # Fallback or error state
            validated_adpie_data = None # Or raise an error / return partial
    
    return {
        "adpie_data": validated_adpie_data.model_dump() if validated_adpie_data else None, # Return as dict
        "reasoning_text": reasoning_text or "No reasoning text extracted.",
        "citations": citations or []
    }

async def generate_prior_auth_items_only( # Renamed and updated
    full_context_dict: Dict[str, Any], # This will include original form_state + all 5 ADPIE sets
    session: aiohttp.ClientSession
) -> Dict[str, Any]:
    """
    Generates a list of five potential prior authorization items based on full patient context including ADPIE.
    """
    schema_for_prompt = SonarExpectedPaOutputSchema.model_json_schema()
    
    # Convert full_context_dict to a compact JSON string for the prompt
    patient_context_json = json.dumps(full_context_dict, indent=2)

    system_prompt = (
        "You are Ron, of Ron AI, an expert AI clinical assistant specializing in identifying items that may require prior authorization (PA). "
        "Based on the comprehensive patient context provided (including demographics, diagnoses, medications, labs, treatments, AND all generated ADPIE elements like nursing diagnoses, goals, interventions, assessments), "
        "your task is to identify and generate a list of **exactly five (5)** potential prior authorization items. "
        "These five items MUST be categorized as follows:\n"
        "1. One (1) care-related PA item (e.g., an 'Inpatient Admission Potential' if a hospital stay seems likely or imminent based on context, "
        "or a significant 'Outpatient Service' that involves complex care coordination or high cost like specialized home health services or DME).\n"
        "2. One (1) Rx/Medication PA item (a specific drug that commonly requires PA or is high-cost).\n"
        "3. Three (3) outpatient PA items (these can be 'Outpatient Service' or 'Outpatient Procedure', e.g., advanced imaging, non-formulary specialist consult, specific therapies).\n"
        "For each of the five items, you MUST provide all fields as defined in the `PriorAuthItemSchema` within the `priorAuthItems` list. "
        "Pay close attention to the `pa_n_criteria_met_details` field, explaining your rationale for why each item might need PA, "
        "referencing specific details from the patient's full context. "
        "The entire output for these items MUST strictly conform to the `SonarExpectedPaOutputSchema` JSON schema. "
        "You will output your reasoning within <think></think> tags, followed by the JSON object containing the `priorAuthItems` list."
    )

    user_prompt = (
        f"Full Patient Context (including ADPIE):\n```json\n{patient_context_json}\n```\n\n"
        "Instruction: Based on the full patient context above, identify exactly five potential prior authorization items "
        "(1 care-related, 1 Rx, 3 outpatient) and structure your response according to the `SonarExpectedPaOutputSchema` JSON schema. "
        "Ensure all fields for each `PriorAuthItemSchema` are detailed, especially `pa_n_criteria_met_details`."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response_format_config = {
        "type": "json_schema",
        "json_schema": {"schema": schema_for_prompt},
    }

    api_response_data = await _make_request(
        session,
        messages=messages,
        response_format_schema=response_format_config,
        max_tokens=2048 # PA items are less verbose than full ADPIE
    )

    parsed_json_payload, reasoning_text, citations = parse_perplexity_response(api_response_data)
    
    prior_auth_items_list: Optional[List[Dict[str, Any]]] = None
    if parsed_json_payload and "priorAuthItems" in parsed_json_payload:
        raw_pa_items = parsed_json_payload.get("priorAuthItems")
        if isinstance(raw_pa_items, list):
            try:
                # Validate each item in the list
                prior_auth_items_list = [PriorAuthItemSchema.model_validate(item).model_dump() for item in raw_pa_items]
                if len(prior_auth_items_list) != 5:
                     print(f"Warning: Expected 5 PA items, but validated {len(prior_auth_items_list)}. Model might not have adhered to count.")
            except ValidationError as e:
                print(f"Pydantic validation error for PA items: {e}")
                print(f"Problematic PA items: {raw_pa_items}")
        else:
            print(f"Warning: 'priorAuthItems' is not a list in the parsed JSON: {type(raw_pa_items)}")

    return {
        "prior_auth_items": prior_auth_items_list or [],
        "reasoning_text": reasoning_text or "No reasoning text extracted.",
        "citations": citations or []
    }

async def main_test():
    # Example FormState (simplified for testing ADPIE generation)
    sample_form_state_adpie = {
        "patient_full_name": "Jane Doe",
        "patient_age": "65",
        "primary_diagnosis_text": "Community Acquired Pneumonia",
        "allergies": ["Penicillin (rash)"],
        "vitalSigns": {"vital_bp": "140/90", "vital_o2sat": "92%"},
        "medications": [{"med_n_name": "Levofloxacin", "med_n_dosage": "750mg", "med_n_status": "New Order"}],
        "labs": [{"lab_n_name": "WBC", "lab_n_value": "15.5", "lab_n_flag": "HIGH"}]
    }
    
    previously_selected = []
    all_adpie_data = []

    async with aiohttp.ClientSession() as session:
        print("\n--- Testing ADPIE Generation (Call 1 of 5) ---")
        adpie_result1 = await generate_full_adpie_for_one_diagnosis(sample_form_state_adpie, previously_selected, session)
        print("Reasoning:", adpie_result1.get("reasoning_text"))
        if adpie_result1.get("adpie_data"):
            print("ADPIE Data:", json.dumps(adpie_result1.get("adpie_data"), indent=2))
            all_adpie_data.append(adpie_result1.get("adpie_data"))
            if adpie_result1.get("adpie_data").get("diagnosis_nanda"):
                 previously_selected.append(adpie_result1.get("adpie_data").get("diagnosis_nanda"))
        else:
            print("No ADPIE data returned or validation failed for call 1.")

        # Simulate getting a second diagnosis
        print("\n--- Testing ADPIE Generation (Call 2 of 5) ---")
        if previously_selected: # Only proceed if first call was successful
            adpie_result2 = await generate_full_adpie_for_one_diagnosis(sample_form_state_adpie, previously_selected, session)
            print("Reasoning:", adpie_result2.get("reasoning_text"))
            if adpie_result2.get("adpie_data"):
                print("ADPIE Data:", json.dumps(adpie_result2.get("adpie_data"), indent=2))
                all_adpie_data.append(adpie_result2.get("adpie_data"))
                # ... and so on for 5 calls
            else:
                print("No ADPIE data returned or validation failed for call 2.")

        print("\n--- Testing Prior Auth Generation ---")
        # Create a combined context for PA items
        full_test_context = {**sample_form_state_adpie, "nursingDiagnosesFullADPIE": all_adpie_data}
        pa_result = await generate_prior_auth_items_only(full_test_context, session)
        print("Reasoning for PAs:", pa_result.get("reasoning_text"))
        print("Prior Auth Items:", json.dumps(pa_result.get("prior_auth_items"), indent=2))
        print("Citations for PAs:", json.dumps(pa_result.get("citations"), indent=2))


if __name__ == "__main__":
    if not SONAR_API_KEY:
        print("Error: SONAR_API_KEY is not set. Please set it in your .env file or environment.")
    else:
        asyncio.run(main_test())
