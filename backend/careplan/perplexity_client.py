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

# Helper for deep merging dictionaries
def deep_merge(source, destination):
    """
    Deeply merges source dict into destination dict.
    Arrays are typically replaced, unless specific logic is added.
    """
    for key, value in source.items():
        if isinstance(value, dict):
            # get node or create one
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        elif isinstance(value, list):
            # For lists, decide on strategy: replace, extend, or item-wise merge
            # For nursingDiagnoses goals/interventions, we'll handle item-wise merge specifically.
            # For most other lists, replacement is simpler.
            destination[key] = value # Default: replace
        else:
            destination[key] = value
    return destination

class PerplexityClient:
    """
    Client for interacting with Perplexity's Sonar Reasoning Pro API
    """

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
                        "specialty": {"type": "string"},
                        "confidenceScore": {"type": "number", "description": "Overall confidence of this agent in its contributions (0.0 to 1.0)"},
                        "insights": {"type": "array", "items": {"type": "string"}, "description": "Key insights or summaries provided by this agent"},
                        "assessmentContribution": {"type": "string", "description": "Summary of this agent's contribution to the assessment phase"},
                        "planningContribution": {"type": "string", "description": "Summary of this agent's contribution to the planning phase (diagnoses, goals)"},
                        "implementationContribution": {"type": "string", "description": "Summary of this agent's contribution to the implementation phase (interventions)"},
                        "evaluationContribution": {"type": "string", "description": "Summary of this agent's contribution to the evaluation phase"}
                    },
                    "required": ["name", "specialty", "confidenceScore", "insights"],
                    "additionalProperties": False
                }
            },
            "recommendedAssessmentsList": {
                "type": "array",
                "description": "List of recommended assessments to be performed, with rationales and status.",
                "items": {
                    "type": "object",
                    "properties": {
                        "item": {"type": "string", "description": "Specific assessment to be performed (e.g., 'Monitor blood pressure q4h')"},
                        "rationale": {"type": "string", "description": "Reason for performing this assessment"},
                        "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "deferred"], "description": "Current status of the assessment"}
                    },
                    "required": ["item", "rationale", "status"]
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
                    "goal_rationale": { "type": "string" },
                    "interventions": {
                      "type": "array",
                      "description": "Interventions specific to this goal.",
                      "items": {
                        "type": "object",
                        "properties": {
                          "interventionText": {"type": "string", "description": "The specific nursing intervention action."},
                          "interventionType": {"type": "string", "enum": ["general", "health_teaching", "monitoring", "psychosocial"], "description": "Type of intervention."},
                          "rationale": {"type": "string", "description": "Evidence-based rationale for the intervention."}
                        },
                        "required": ["interventionText", "interventionType", "rationale"]
                      }
                    },
                    "evaluation": {
                      "type": "object",
                      "description": "Evaluation criteria and status for this goal.",
                      "properties": {
                        "evaluationText": {"type": "string", "description": "Description of how the goal achievement will be evaluated."},
                        "evaluationMethod": {"type": "string", "description": "Method used for evaluation (e.g., patient report, observation, lab values)."},
                        "evaluationTargetDate": {"type": "string", "format": "date", "description": "Target date for this specific evaluation point."},
                        "evaluationStatus": {"type": "string", "enum": ["met", "partially_met", "not_met", "ongoing"], "description": "Status of goal achievement."}
                      },
                      "required": ["evaluationText", "evaluationMethod", "evaluationStatus"]
                    }
                  },
                  "required": ["goal_description", "goal_outcomes", "interventions", "evaluation"]
                }
              }
            },
            "required": ["diagnosis_nanda", "diagnosis_evidence", "goals"]
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
      "required": ["patientData", "clinicalData", "nursingDiagnoses", "recommendedAssessmentsList", "next_steps"]
    }

    STAGES_CONFIG = [
        {
            "name": "stage_1_assessment_setup",
            "accordion_title": "Stage 1: Comprehensive Assessment, Diagnoses & Assessments List",
            "system_prompt_focus_template": (
                "Conduct a comprehensive initial assessment. Populate demographics, vitals, history, and detailed additional assessment fields. "
                "Generate an `assessmentList` of up to 10 items, each with `type`, `rationale`, and `status`. "
                "Create initial nursing diagnoses up to 5, including diagnosis name, related factors, and evidence. "
                "Populate the `aiAgents` array with their initial contributions."
            ),
            "properties_to_generate_or_update": [
                "patientData", "clinicalData",
                "assessment_subjective_chief_complaint", "assessment_subjective_hpi",
                "assessment_subjective_goals", "assessment_subjective_other",
                "assessment_objective_vitals_summary", "assessment_objective_physical_exam",
                "assessment_objective_diagnostics", "assessment_objective_meds_reviewed", "assessment_objective_other",
                "recommendedAssessmentsList",  # New list of assessments
                "nursingDiagnoses",  # Shell: diagnosis_nanda, related_to, evidence, is_risk, risk_factors
                "aiAgents"  # Initial agent details and assessment contribution
                "recommendedAssessmentsList", # New list of assessments
                "nursingDiagnoses", # Shell: diagnosis_nanda, related_to, evidence, is_risk, risk_factors
                "aiAgents" # Initial agent details and assessment contribution
            ],
            "required_for_this_stage_output": ["patientData", "clinicalData", "assessment_subjective_chief_complaint", "nursingDiagnoses", "recommendedAssessmentsList", "aiAgents"]
        },
        {
            "name": "stage_2_diagnosis_goals",
            "accordion_title": "Stage 2: Nursing Diagnoses Refinement & Goal Setting (up to 5 goals/diagnosis)",
            "system_prompt_focus_template": (
                "Based on the assessment and initial diagnoses, refine `diagnosis_evidence` or `diagnosis_risk_factors` for each of the up to 5 NANDA diagnoses. "
                "Then, for each confirmed nursing diagnosis, develop up to 5 specific, measurable, achievable, relevant, and time-bound (SMART) "
                "patient-centered goals. Populate ONLY the `goals` array for each nursing diagnosis, including `goal_description`, `goal_target_date`, `goal_outcomes`, and `goal_rationale`. "
                "Update `aiAgents` with their `planningContribution`. "
                "Ensure the output strictly adheres to the JSON schema provided for this stage."
            ),
            "properties_to_generate_or_update": [
                "nursingDiagnoses.*.diagnosis_evidence", "nursingDiagnoses.*.diagnosis_risk_factors",
                "nursingDiagnoses.*.goals", # This will generate the goals array under each diagnosis
                "aiAgents" # Update with planning contribution
            ],
            "required_for_this_stage_output": ["nursingDiagnoses"] # Expecting goals to be filled
        },
        {
            "name": "stage_3_interventions",
            "accordion_title": "Stage 3: Intervention Planning (20 interventions/goal)",
            "system_prompt_focus_template": (
                "For each goal (up to 5 goals per diagnosis), develop a comprehensive set of 20 evidence-based nursing interventions "
                "(specifically 15 general interventions and 5 health teaching interventions). "
                "Populate ONLY the `interventions` array within each `goal` object. Each intervention must include `interventionText`, `interventionType` (e.g., 'general', 'health_teaching'), and `rationale`. "
                "Update `aiAgents` with their `implementationContribution`. "
                "The output must strictly follow the JSON schema for this stage."
            ),
            "properties_to_generate_or_update": [
                "nursingDiagnoses.*.goals.*.interventions", # Interventions are now under goals
                "aiAgents" # Update with implementation contribution
            ],
            "required_for_this_stage_output": ["nursingDiagnoses"] # Expecting interventions under goals to be filled
        },
        {
            "name": "stage_4_evaluation_criteria", # Renamed and repurposed
            "accordion_title": "Stage 4: Evaluation Criteria Planning (1 evaluation/goal)",
            "system_prompt_focus_template": (
                "For each goal (up to 5 goals per diagnosis), define specific evaluation criteria. "
                "Populate ONLY the `evaluation` object within each `goal` object. This object must include `evaluationText`, `evaluationMethod`, `evaluationTargetDate`, and `evaluationStatus`. "
                "Update `aiAgents` with their `evaluationContribution`. "
                "The output must strictly follow the JSON schema for this stage."
            ),
            "properties_to_generate_or_update": [
                "nursingDiagnoses.*.goals.*.evaluation", # Evaluation is now an object under goals
                "aiAgents" # Update with evaluation contribution
            ],
            "required_for_this_stage_output": ["nursingDiagnoses"] # Expecting evaluation under goals to be filled
        },
        {
            "name": "stage_5_summary_admin_coordination", # Combined coordination here
            "accordion_title": "Stage 5: Interdisciplinary Plan, Summary & Administrative Support",
            "system_prompt_focus_template": (
                "Develop an `interdisciplinaryPlan` identifying key collaborations. "
                "Provide an `overall_plan_summary`. Define clear `next_steps` for ongoing care. "
                "Identify any `priorAuthItems` required. Update `aiAgents` with final `confidenceScore` and overall `insights`. "
                "Generate `sourcesData` used throughout the plan. "
                "Create `notification_title`, `notification_message`, and details for care team communication. "
                "Strictly adhere to the JSON schema provided for this stage for all generated fields."
            ),
            "properties_to_generate_or_update": [
                "interdisciplinaryPlan", # From old stage 4
                "overall_plan_summary", "next_steps",
                "priorAuthItems", "aiAgents", "sourcesData",
                "notification_title", "notification_message",
                "notification_detail_1", "notification_detail_2"
            ],
            "required_for_this_stage_output": ["interdisciplinaryPlan", "overall_plan_summary", "next_steps", "aiAgents"]
        }
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get('SONAR_API_KEY')
        if not self.api_key:
            raise ValueError("API key not provided and SONAR_API_KEY environment variable not set")
            
        self.base_url = "https://api.perplexity.ai"
        self.chat_endpoint = f"{self.base_url}/chat/completions"
        
    def _format_reasoning_as_markdown(self, reasoning_text: str) -> str:
        if not reasoning_text:
            return ""
        markdown = reasoning_text.replace('\r\n', '\n')
        markdown = re.sub(r'^(Assessment|Diagnosis|Planning|Implementation|Evaluation|Conclusion|Summary):$', r'## \1:', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^(Step\s*\d+):', r'### \1:', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^(Rationale|Evidence|Considerations):$', r'#### \1:', markdown, flags=re.MULTILINE)
        keywords_to_bold = [
            'ADPIE', 'NANDA', 'CHF', 'Congestive Heart Failure', 'Hypertension', 'Diabetes',
            'Assessment', 'Diagnosis', 'Planning', 'Implementation', 'Evaluation',
            'Goal', 'Outcome', 'Intervention', 'Rationale', 'Evidence', 'Risk for', 'Related to', 'As evidenced by'
        ]
        for keyword in keywords_to_bold:
            markdown = re.sub(r'\b(' + re.escape(keyword) + r')\b', r'**\1**', markdown, flags=re.IGNORECASE)
        markdown = re.sub(r'(\[\s*(?:S\d+|\d+|[A-Za-z]+)\s*\])', r'*\1*', markdown)
        markdown = re.sub(r'^\s*-\s+(.*)', r'* \1', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^\s*\*\s+(.*)', r'* \1', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^\s*(\d+\.)\s+(.*)', r'\1 \2', markdown, flags=re.MULTILINE)
        markdown = re.sub(r'^\s*>\s*(.*)', r'> \1', markdown, flags=re.MULTILINE)
        blocks = markdown.split('\n\n')
        processed_blocks = []
        for block in blocks:
            if not (block.startswith('* ') or block.startswith('#') or block.startswith('>') or re.match(r'^\d+\.\s', block)):
                block = block.replace('\n', ' ')
            processed_blocks.append(block.strip())
        markdown = '\n\n'.join(processed_blocks)
        return markdown.strip()
        
    def _validate_api_key(self) -> bool:
        headers = self._get_headers()
        payload = {
            "model": "sonar-reasoning-pro",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 8000 
        }
        try:
            logger.info("Validating API key...")
            response = requests.post(self.chat_endpoint, headers=headers, json=payload, timeout=15)
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
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
    def _get_sub_schema(self, properties_to_target: List[str], stage_specific_required: List[str]) -> Dict[str, Any]:
        sub_schema_properties = {}
        sub_schema_required = set()

        def get_nested_property_definition(path_parts: List[str], schema_node: Dict[str, Any]) -> Optional[Dict[str, Any]]:
            current_node = schema_node
            for part in path_parts:
                if part == "*" and current_node.get("type") == "array" and "items" in current_node:
                    current_node = current_node["items"]
                elif "properties" in current_node and part in current_node["properties"]:
                    current_node = current_node["properties"][part]
                else:
                    return None
            return current_node

        for prop_path_str in properties_to_target:
            path_parts = prop_path_str.split('.')
            current_sub_schema_level = sub_schema_properties
            
            for i, part_name in enumerate(path_parts):
                is_last_part = (i == len(path_parts) - 1)
                
                if part_name == "*":
                    if not isinstance(current_sub_schema_level, dict) or current_sub_schema_level.get("type") != "array":
                        if i == 0 and path_parts[0] in self.ADPIE_SCHEMA["properties"] and self.ADPIE_SCHEMA["properties"][path_parts[0]].get("type") == "array":
                           current_sub_schema_level = {"type": "array", "items": {"type": "object", "properties": {}}}
                           sub_schema_properties[path_parts[0]] = current_sub_schema_level 
                        else:
                            logger.warning(f"Schema path error: Expected array for '*' in {prop_path_str}")
                            break 
                    
                    if "items" not in current_sub_schema_level or not isinstance(current_sub_schema_level["items"], dict):
                         current_sub_schema_level["items"] = {"type": "object", "properties": {}}
                    
                    if "properties" not in current_sub_schema_level["items"]:
                        current_sub_schema_level["items"]["properties"] = {}
                        
                    current_sub_schema_level = current_sub_schema_level["items"]["properties"]
                    continue

                if part_name not in current_sub_schema_level:
                    original_prop_def = get_nested_property_definition(path_parts[:i+1], self.ADPIE_SCHEMA)
                    if not original_prop_def:
                        logger.warning(f"Property definition not found in ADPIE_SCHEMA for: {'.'.join(path_parts[:i+1])}")
                        break 

                    current_sub_schema_level[part_name] = {"type": original_prop_def.get("type")}
                    if original_prop_def.get("type") == "object":
                        current_sub_schema_level[part_name]["properties"] = {}
                    elif original_prop_def.get("type") == "array":
                        current_sub_schema_level[part_name]["items"] = json.loads(json.dumps(original_prop_def.get("items", {"type": "string"})))

                if is_last_part:
                    full_def = get_nested_property_definition(path_parts, self.ADPIE_SCHEMA)
                    if full_def:
                        current_sub_schema_level[part_name] = json.loads(json.dumps(full_def))
                    else:
                         logger.warning(f"Could not get full definition for {prop_path_str}")
                else:
                    if current_sub_schema_level[part_name].get("type") == "object":
                        current_sub_schema_level = current_sub_schema_level[part_name]["properties"]
                    elif current_sub_schema_level[part_name].get("type") == "array":
                        original_item_def_for_array = get_nested_property_definition(path_parts[:i+1], self.ADPIE_SCHEMA)
                        if original_item_def_for_array and \
                           original_item_def_for_array.get("type") == "array" and \
                           isinstance(original_item_def_for_array.get("items"), dict) and \
                           original_item_def_for_array["items"].get("type") == "object":
                            current_sub_schema_level[part_name]["items"] = json.loads(json.dumps(original_item_def_for_array["items"]))
                        else:
                            logger.warning(f"Cannot navigate into non-object items for array path {prop_path_str} at {part_name}")
                            break 
                        current_sub_schema_level = current_sub_schema_level[part_name]["items"]["properties"]
                    else: 
                        break
        
        for req_path_str in stage_specific_required:
            req_path_parts = req_path_str.split('.')
            if req_path_parts[0] in sub_schema_properties:
                 sub_schema_required.add(req_path_parts[0])

        final_sub_schema = {
            "type": "object",
            "properties": sub_schema_properties,
        }
        if sub_schema_required:
            final_sub_schema["required"] = sorted(list(sub_schema_required))
        
        return final_sub_schema

    def stream_full_care_plan_sequentially(self, patient_form_data: Dict[str, Any], care_environment: str, focus_areas: List[str]) -> Generator[Dict[str, Any], None, None]:
        current_care_plan: Dict[str, Any] = {}
        yield {"type": "overall_generation_start"}

        for stage_idx, stage_config in enumerate(self.STAGES_CONFIG):
            stage_name = stage_config["name"]
            accordion_title = stage_config["accordion_title"]
            logger.info(f"Starting {stage_name} ({accordion_title})")
            yield {"type": "stage_start", "stage_name": stage_name, "accordion_title": accordion_title, "stage_index": stage_idx}

            base_system_prompt = (
                "You are an expert clinical AI. Based on the full patient context and any previously generated care plan sections "
                "provided in the user message, your task for this specific stage is to: {focus_template}. "
                "Generate ONLY the data specified by the JSON schema provided for this stage. "
                "Do not regenerate or include any fields that are not part of this stage's specific schema."
            )
            system_prompt = base_system_prompt.format(focus_template=stage_config["system_prompt_focus_template"])
            
            user_message_content = {
                "patientFormData": patient_form_data,
                "careEnvironment": care_environment,
                "focusAreas": focus_areas
            }
            if stage_idx > 0:
                user_message_content["currentCarePlanContext"] = current_care_plan
            user_prompt = f"Patient and Care Plan Context:\n{json.dumps(user_message_content, indent=2)}"

            sub_schema_for_stage = self._get_sub_schema(
                stage_config["properties_to_generate_or_update"],
                stage_config["required_for_this_stage_output"]
            )
            
            payload = {
                "model": "sonar-reasoning-pro",
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                "max_tokens": 8000, "stream": True, "temperature": 0.2,
                "response_format": {"type": "json_schema", "json_schema": {"schema": sub_schema_for_stage}}
            }
            
            stage_full_response_text = ""
            in_think_block_for_streaming = False
            
            try:
                logger.info(f"Requesting Perplexity for {stage_name}. Sub-schema properties: {list(sub_schema_for_stage.get('properties', {}).keys())}")
                response = requests.post(self.chat_endpoint, headers=self._get_headers(), json=payload, stream=True, timeout=180)

                if response.status_code != 200:
                    error_msg = f"Perplexity API Error for {stage_name}: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    yield {"type": "error", "stage_name": stage_name, "content": error_msg}
                    continue

                for line in response.iter_lines():
                    if line:
                        line_text = line.decode('utf-8')
                        if line_text.startswith('data: '):
                            json_str = line_text[len('data: '):]
                            if json_str == "[DONE]": break
                            try:
                                chunk = json.loads(json_str)
                                delta_content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                if delta_content:
                                    stage_full_response_text += delta_content
                                    
                                    current_think_content = ""
                                    if "<think>" in delta_content:
                                        in_think_block_for_streaming = True
                                        # Content after <think> in this chunk
                                        temp_content = delta_content.split("<think>", 1)[1]
                                        if "</think>" in temp_content: # <think>...</think> in same chunk
                                            current_think_content = temp_content.split("</think>", 1)[0]
                                            in_think_block_for_streaming = False
                                        else: # Just <think>...
                                            current_think_content = temp_content
                                    elif in_think_block_for_streaming:
                                        if "</think>" in delta_content: # ...</think>
                                            current_think_content = delta_content.split("</think>", 1)[0]
                                            in_think_block_for_streaming = False
                                        else: # ...middle of think block...
                                            current_think_content = delta_content
                                    
                                    if current_think_content:
                                        yield {"type": "reasoning_text_chunk", "stage_name": stage_name, "content": current_think_content}
                                            
                            except json.JSONDecodeError:
                                logger.warning(f"Skipping non-JSON line in stream for {stage_name}: {json_str}")
                
                logger.info(f"Stream complete for {stage_name}. Accumulated response length: {len(stage_full_response_text)}")
            except requests.RequestException as e:
                error_msg = f"RequestException during {stage_name}: {str(e)}"
                logger.error(error_msg)
                yield {"type": "error", "stage_name": stage_name, "content": error_msg}
                continue
            except Exception as e_generic:
                error_msg = f"Generic Exception during {stage_name} API call: {str(e_generic)}"
                logger.exception(f"Generic exception in {stage_name}:")
                yield {"type": "error", "stage_name": stage_name, "content": error_msg}
                continue
            
            raw_reasoning = self._extract_reasoning_from_think_tags(stage_full_response_text)
            markdown_reasoning = self._format_reasoning_as_markdown(raw_reasoning)
            stage_json_output = self._extract_json_from_response(stage_full_response_text)

            logger.info(f"Extracted reasoning for {stage_name} (len: {len(markdown_reasoning)}). JSON extracted: {'Yes' if stage_json_output else 'No'}")
            if not stage_json_output:
                 logger.warning(f"No JSON output extracted for {stage_name}. Full response: {stage_full_response_text[:500]}")

            yield {"type": "stage_reasoning_complete", "stage_name": stage_name, "reasoning_markdown": markdown_reasoning}
            yield {"type": "stage_json_chunk", "stage_name": stage_name, "json_data": stage_json_output if stage_json_output else {}}

            if stage_json_output:
                # Special handling for merging nursingDiagnoses parts (goals, interventions, evaluations)
                if stage_name in ["stage_2_diagnosis_goals", "stage_3_interventions", "stage_4_evaluation_criteria"] and \
                   "nursingDiagnoses" in stage_json_output and \
                   "nursingDiagnoses" in current_care_plan and \
                   isinstance(current_care_plan.get("nursingDiagnoses"), list) and \
                   isinstance(stage_json_output.get("nursingDiagnoses"), list):

                    current_diagnoses_list = current_care_plan["nursingDiagnoses"]
                    updated_diagnoses_list_from_stage = stage_json_output["nursingDiagnoses"]

                    for diag_idx, current_diag_obj in enumerate(current_diagnoses_list):
                        if diag_idx < len(updated_diagnoses_list_from_stage) and isinstance(updated_diagnoses_list_from_stage[diag_idx], dict):
                            stage_diag_data = updated_diagnoses_list_from_stage[diag_idx]
                            
                            # Merge diagnosis-level fields for Stage 2
                            if stage_name == "stage_2_diagnosis_goals":
                                if "diagnosis_evidence" in stage_diag_data:
                                    current_diag_obj["diagnosis_evidence"] = stage_diag_data["diagnosis_evidence"]
                                if "diagnosis_risk_factors" in stage_diag_data:
                                    current_diag_obj["diagnosis_risk_factors"] = stage_diag_data["diagnosis_risk_factors"]
                                # Goals themselves are also part of stage_diag_data for Stage 2
                                if "goals" in stage_diag_data and isinstance(stage_diag_data["goals"], list):
                                     current_diag_obj["goals"] = stage_diag_data["goals"] # Assume full replacement of goals array for simplicity

                            # Merge goal-level fields (interventions for Stage 3, evaluation for Stage 4)
                            if "goals" in stage_diag_data and isinstance(stage_diag_data["goals"], list) and \
                               "goals" in current_diag_obj and isinstance(current_diag_obj["goals"], list):
                                
                                current_goals_list = current_diag_obj["goals"]
                                updated_goals_list_from_stage = stage_diag_data["goals"]

                                for goal_idx, current_goal_obj in enumerate(current_goals_list):
                                    if goal_idx < len(updated_goals_list_from_stage) and isinstance(updated_goals_list_from_stage[goal_idx], dict):
                                        stage_goal_data = updated_goals_list_from_stage[goal_idx]

                                        if stage_name == "stage_3_interventions":
                                            if "interventions" in stage_goal_data:
                                                current_goal_obj["interventions"] = stage_goal_data["interventions"]
                                        elif stage_name == "stage_4_evaluation_criteria":
                                            if "evaluation" in stage_goal_data:
                                                current_goal_obj["evaluation"] = stage_goal_data["evaluation"]
                    
                    # Remove nursingDiagnoses from stage_json_output to prevent deep_merge from overwriting the manual merge
                    del stage_json_output["nursingDiagnoses"]

                current_care_plan = deep_merge(stage_json_output, current_care_plan)
            
            logger.info(f"Care plan after {stage_name} (keys: {list(current_care_plan.keys())})")

        yield {"type": "full_care_plan_complete", "care_plan": current_care_plan}
        logger.info("All stages complete. Final care plan generated.")

    def _extract_reasoning_from_think_tags(self, response_text: str) -> str:
        pattern = r'<think>(.*?)</think>'
        matches = re.findall(pattern, response_text, re.DOTALL)
        return '\n\n'.join(matches) if matches else ""
    
    def _extract_json_from_response(self, response_text: str) -> Dict[str, Any]:
        json_obj = None
        # Remove the <think> block before trying to parse JSON
        cleaned_response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
        
        start_index = cleaned_response_text.find('{')
        if start_index != -1:
            brace_level = 0
            for i, char in enumerate(cleaned_response_text[start_index:]):
                if char == '{': brace_level += 1
                elif char == '}': brace_level -= 1
                if brace_level == 0:
                    potential_json_str = cleaned_response_text[start_index : start_index + i + 1]
                    try:
                        json_obj = json.loads(potential_json_str)
                        break 
                    except json.JSONDecodeError:
                        logger.warning(f"Found a '{{...}}' block but it wasn't valid JSON: {potential_json_str[:100]}...")
                        # Continue searching if this block is invalid, in case of malformed prefix
                        start_index = cleaned_response_text.find('{', start_index + i + 1)
                        if start_index == -1: break # No more opening braces
                        brace_level = 0 # Reset for next potential JSON object
                        continue # Restart search from new start_index
        if not json_obj:
            logger.warning(f"Could not find or parse a valid JSON object in the cleaned response text. Cleaned text: {cleaned_response_text[:500]}")
            return {}
        return json_obj

def get_perplexity_client() -> PerplexityClient:
    if not hasattr(get_perplexity_client, 'instance'):
        get_perplexity_client.instance = PerplexityClient()
    return get_perplexity_client.instance
