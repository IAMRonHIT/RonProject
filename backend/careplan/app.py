import asyncio
from typing import List, Optional, Dict, Any, Literal, Union # Added Union, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import aiohttp
import uvicorn

# Direct imports
from perplexity_client import (
    generate_full_adpie_for_one_diagnosis,
    generate_prior_auth_items_only
)
from sonar_schemas import (
    PriorAuthItemSchema, # For the PA items list in FullCarePlanDataResponse
    # Import the ADPIE component models defined in sonar_schemas.py
    RecommendedAssessmentItemModel,
    InterventionModel,
    EvaluationModel,
    GoalModelForSonar # This is the structure Sonar returns for a goal
)

# --- Pydantic Models for data structures (mirroring careplan-template.tsx & sonar_schemas.py) ---

class VitalSignsModel(BaseModel):
    vital_bp: Optional[str] = None
    vital_pulse: Optional[str] = None
    vital_resp_rate: Optional[str] = None
    vital_temp: Optional[str] = None
    vital_o2sat: Optional[str] = None
    vital_pain_score: Optional[str] = None

class LabResultModel(BaseModel):
    id: Optional[str] = None # Keep if scenarios might send it
    lab_n_name: Optional[str] = None # Make optional if not always present
    lab_n_value: Optional[str] = None
    lab_n_flag: Optional[str] = None
    lab_n_trend: Optional[str] = None

class MedicationModel(BaseModel):
    id: Optional[str] = None
    med_n_name: Optional[str] = None
    med_n_dosage: Optional[str] = None
    med_n_route: Optional[str] = None
    med_n_frequency: Optional[str] = None
    med_n_status: Optional[str] = None
    med_n_pa_required: Optional[Union[bool, str]] = None # Match template

class TreatmentModel(BaseModel):
    id: Optional[str] = None
    treatment_n_name: Optional[str] = None
    treatment_n_status: Optional[str] = None
    treatment_n_details: Optional[str] = None
    treatment_n_date: Optional[str] = None
    treatment_n_pa_required: Optional[Union[bool, str]] = None # Match template

# Models for ADPIE components that will be part of FormStateModel if sent by frontend,
# and also part of FullCarePlanDataResponse. These mirror sonar_schemas and careplan-template
class GoalResponseModel(BaseModel): # Mirrors structure in careplan-template.tsx
    goal_description: str
    goal_target_date: Optional[str] = None
    goal_outcomes: List[str] = Field(default_factory=list)
    goal_rationale: Optional[str] = None
    interventions: List[InterventionModel] = Field(default_factory=list)
    evaluation: EvaluationModel

class NursingDiagnosisResponseModel(BaseModel): # Mirrors structure in careplan-template.tsx
    diagnosis_nanda: str
    diagnosis_related_to: Optional[str] = None
    diagnosis_evidence: List[str] = Field(default_factory=list)
    diagnosis_is_risk: Optional[bool] = False
    diagnosis_risk_factors: Optional[List[str]] = Field(default_factory=list)
    goals: List[GoalResponseModel] = Field(default_factory=list)
    # Note: careplan-template.tsx has interventions directly under goal.
    # SingleNursingDiagnosisADPIEOutputSchema from sonar_schemas also has interventions under goal.
    # So, GoalResponseModel should include interventions.

# FormStateModel: Input from the frontend (from scenarios.ts)
# This model should only contain fields that are actually present in scenarios.ts data.
# ADPIE elements are NOT in scenarios.ts, they will be generated.
class FormStateModel(BaseModel):
    patient_full_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    patient_mrn: Optional[str] = None
    patient_dob: Optional[str] = None
    patient_insurance_plan: Optional[str] = None
    patient_policy_number: Optional[str] = None
    patient_primary_provider: Optional[str] = None
    patient_admission_date: Optional[str] = None
    allergies: Optional[List[str]] = Field(default_factory=list)
    vitalSigns: Optional[VitalSignsModel] = None
    nyha_class_description: Optional[str] = None
    primary_diagnosis_text: Optional[str] = None
    secondaryDiagnoses: Optional[List[str]] = Field(default_factory=list)
    labs: Optional[List[LabResultModel]] = Field(default_factory=list)
    medications: Optional[List[MedicationModel]] = Field(default_factory=list)
    treatments: Optional[List[TreatmentModel]] = Field(default_factory=list)
    last_imaging_summary: Optional[str] = None
    last_ecg_summary: Optional[str] = None
    # NO ADPIE fields here, as they are not in scenarios.ts

# --- Pydantic Models for API Response (mirroring careplan-template.tsx) ---
class PatientDataResponse(BaseModel):
    patient_full_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None
    patient_mrn: Optional[str] = None
    patient_dob: Optional[str] = None
    patient_insurance_plan: Optional[str] = None
    patient_policy_number: Optional[str] = None
    patient_primary_provider: Optional[str] = None
    patient_admission_date: Optional[str] = None
    allergies: Optional[List[str]] = Field(default_factory=list)
    vitalSigns: Optional[VitalSignsModel] = None
    nyha_class_description: Optional[str] = None

class ClinicalDataResponse(BaseModel):
    primary_diagnosis_text: Optional[str] = None
    secondaryDiagnoses: Optional[List[str]] = Field(default_factory=list)
    labs: Optional[List[LabResultModel]] = Field(default_factory=list)
    medications: Optional[List[MedicationModel]] = Field(default_factory=list)
    treatments: Optional[List[TreatmentModel]] = Field(default_factory=list)
    last_imaging_summary: Optional[str] = None
    last_ecg_summary: Optional[str] = None

class AgentTypeResponse(BaseModel): # Mirrors AgentType in careplan-template.tsx
    name: Optional[str] = None
    specialty: Optional[str] = None
    confidenceScore: Optional[float] = None # Use float for numbers
    insights: Optional[List[str]] = Field(default_factory=list)
    assessmentContribution: Optional[str] = None
    planningContribution: Optional[str] = None
    implementationContribution: Optional[str] = None
    evaluationContribution: Optional[str] = None

class SourceDataResponse(BaseModel): # Mirrors SourceData in careplan-template.tsx
    source_n_id: Optional[str] = None
    source_n_title: Optional[str] = None
    source_n_type: Optional[str] = None
    source_n_url: Optional[str] = None
    source_n_snippet: Optional[str] = None
    source_n_retrieval_date: Optional[str] = None
    source_n_agent_source: Optional[str] = None


class FullCarePlanDataResponse(BaseModel): # Mirrors CarePlanJsonData
    patientData: Optional[PatientDataResponse] = None
    clinicalData: Optional[ClinicalDataResponse] = None
    aiAgents: Optional[List[AgentTypeResponse]] = Field(default_factory=list) # Mocked
    priorAuthItems: Optional[List[PriorAuthItemSchema]] = Field(default_factory=list) # From Sonar
    sourcesData: Optional[List[SourceDataResponse]] = Field(default_factory=list) # From Perplexity citations

    # ADPIE elements generated by Sonar
    assessment_subjective_chief_complaint: Optional[str] = None
    assessment_subjective_hpi: Optional[str] = None
    assessment_subjective_goals: Optional[str] = None
    assessment_subjective_other: Optional[str] = None
    assessment_objective_vitals_summary: Optional[str] = None
    assessment_objective_physical_exam: Optional[str] = None
    assessment_objective_diagnostics: Optional[str] = None
    assessment_objective_meds_reviewed: Optional[str] = None
    assessment_objective_other: Optional[str] = None
    
    recommendedAssessmentsList: Optional[List[RecommendedAssessmentItemModel]] = Field(default_factory=list)
    nursingDiagnoses: Optional[List[NursingDiagnosisResponseModel]] = Field(default_factory=list) # This will hold the 5 generated diagnoses
    
    interdisciplinaryPlan: Optional[List[Dict[str, str]]] = Field(default_factory=list) # Using Dict as per template
    overall_plan_summary: Optional[str] = None
    next_steps: List[str] = Field(default_factory=list)
    
    notification_title: Optional[str] = None # These are for UI, likely not from Sonar
    notification_message: Optional[str] = None
    notification_detail_1: Optional[str] = None
    notification_detail_2: Optional[str] = None

class CarePlanApiResponse(BaseModel):
    full_care_plan: FullCarePlanDataResponse
    reasoning_text: List[str] # Now a list to hold reasoning from multiple calls
    # citations will be part of full_care_plan.sourcesData

app = FastAPI(
    title="Care Plan Generator Backend",
    description="Provides an API to generate a comprehensive care plan using Perplexity Sonar.",
    version="0.2.0" # Version bump
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    app.state.http_session = aiohttp.ClientSession()

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.http_session.close()

@app.post("/api/v1/generate-care-plan", response_model=CarePlanApiResponse)
async def generate_care_plan_endpoint(form_state_input: FormStateModel):
    form_state_dict = form_state_input.model_dump(exclude_unset=True)
    
    all_generated_adpie_components: List[Dict[str, Any]] = [] # To store full ADPIE for each of 5 diagnoses
    all_reasoning_texts: List[str] = []
    all_citations_data: List[Dict[str, Any]] = []
    previously_selected_nanda_labels: List[str] = []

    try:
        # Loop 5 times to generate ADPIE for 5 nursing diagnoses
        for i in range(5):
            print(f"Generating ADPIE for nursing diagnosis #{i+1}...")
            adpie_call_result = await generate_full_adpie_for_one_diagnosis(
                form_state_dict=form_state_dict, # Base patient context
                previously_selected_nanda_labels=previously_selected_nanda_labels,
                session=app.state.http_session
            )
            
            current_reasoning = adpie_call_result.get("reasoning_text", f"No reasoning for ADPIE call {i+1}.")
            all_reasoning_texts.append(f"--- Reasoning for Diagnosis {i+1} ---\n{current_reasoning}")
            
            current_citations = adpie_call_result.get("citations", [])
            all_citations_data.extend(current_citations)

            generated_adpie_set = adpie_call_result.get("adpie_data")
            if generated_adpie_set and isinstance(generated_adpie_set, dict):
                all_generated_adpie_components.append(generated_adpie_set)
                # Ensure diagnosis_nanda is a string before appending
                nanda_label = generated_adpie_set.get("diagnosis_nanda")
                if isinstance(nanda_label, str):
                    previously_selected_nanda_labels.append(nanda_label)
                else:
                    print(f"Warning: diagnosis_nanda for iteration {i+1} is not a string or is missing.")
                    # Potentially break or handle error if a NANDA label can't be extracted
            else:
                print(f"Warning: ADPIE data for diagnosis #{i+1} was not generated or is invalid. Stopping ADPIE generation.")
                # Decide if we should stop or continue with fewer diagnoses
                break # For now, stop if one fails

        # Prepare context for PA call (original form_state + all generated ADPIE)
        # The structure of all_generated_adpie_components needs to match how `nursingDiagnoses` is expected in `FullCarePlanDataResponse`
        # Each item in all_generated_adpie_components is a dict from SingleNursingDiagnosisADPIEOutputSchema
        
        # The `nursingDiagnoses` field in `FullCarePlanDataResponse` expects a list of `NursingDiagnosisResponseModel`.
        # We need to map the output of `generate_full_adpie_for_one_diagnosis` (which is `SingleNursingDiagnosisADPIEOutputSchema`)
        # to `NursingDiagnosisResponseModel`. They should be very similar.
        
        # For now, let's assume SingleNursingDiagnosisADPIEOutputSchema can be directly used or easily mapped.
        # The key is that `generate_prior_auth_items_only` gets this list of diagnosis objects.
        context_for_pa = {
            **form_state_dict,
            "generated_nursing_diagnoses_adpie": all_generated_adpie_components # Pass the list of full ADPIE sets
        }

        print("Generating Prior Authorization items...")
        pa_call_result = await generate_prior_auth_items_only(
            full_context_dict=context_for_pa,
            session=app.state.http_session
        )
        
        pa_reasoning = pa_call_result.get("reasoning_text", "No reasoning for PA call.")
        all_reasoning_texts.append(f"--- Reasoning for Prior Authorizations ---\n{pa_reasoning}")
        
        pa_citations = pa_call_result.get("citations", [])
        all_citations_data.extend(pa_citations)
        
        generated_pa_items = pa_call_result.get("prior_auth_items", [])

        # Assemble the final response
        patient_data_resp = PatientDataResponse(**form_state_dict.get("patientData", form_state_dict)) # Pass relevant part or whole dict
        clinical_data_resp = ClinicalDataResponse(**form_state_dict.get("clinicalData", form_state_dict))

        # Map generated ADPIE data to NursingDiagnosisResponseModel
        # Each item in `all_generated_adpie_components` is a dict from `SingleNursingDiagnosisADPIEOutputSchema`
        final_nursing_diagnoses: List[NursingDiagnosisResponseModel] = []
        overall_assessment_subjective_chief_complaint = []
        # ... similar lists for other narrative assessment fields
        # For simplicity, we'll take the narrative assessments from the first generated diagnosis,
        # or Sonar could be prompted to provide one overall set.
        # For now, let's assume the SingleNursingDiagnosisADPIEOutputSchema contains these narratives.

        # Extract narrative assessments and other top-level ADPIE fields from the generated data.
        # This part needs careful handling based on how SingleNursingDiagnosisADPIEOutputSchema is structured
        # and whether these fields are per-diagnosis or meant to be aggregated.
        # For now, taking from the first valid ADPIE set if available.
        first_adpie_set = all_generated_adpie_components[0] if all_generated_adpie_components else {}

        for adpie_set_dict in all_generated_adpie_components:
            # Map adpie_set_dict (from SingleNursingDiagnosisADPIEOutputSchema) to NursingDiagnosisResponseModel
            # This assumes direct field compatibility or requires explicit mapping here.
            # For now, direct unpacking if fields match.
            goals_for_response = []
            for goal_data in adpie_set_dict.get("goals", []):
                # Map goal_data (from GoalModelForSonar) to GoalResponseModel
                interventions_for_response = [InterventionModel(**inter) for inter in goal_data.get("interventions", [])]
                evaluation_for_response = EvaluationModel(**goal_data.get("evaluation", {}))
                goals_for_response.append(GoalResponseModel(
                    **{k: v for k, v in goal_data.items() if k not in ['interventions', 'evaluation']}, # pass other goal fields
                    interventions=interventions_for_response,
                    evaluation=evaluation_for_response
                ))
            
            final_nursing_diagnoses.append(NursingDiagnosisResponseModel(
                diagnosis_nanda=adpie_set_dict.get("diagnosis_nanda","Unknown Diagnosis"),
                diagnosis_related_to=adpie_set_dict.get("diagnosis_related_to"),
                diagnosis_evidence=adpie_set_dict.get("diagnosis_evidence",[]),
                diagnosis_is_risk=adpie_set_dict.get("diagnosis_is_risk", False),
                diagnosis_risk_factors=adpie_set_dict.get("diagnosis_risk_factors",[]),
                goals=goals_for_response
            ))

        full_care_plan = FullCarePlanDataResponse(
            patientData=patient_data_resp,
            clinicalData=clinical_data_resp,
            priorAuthItems=generated_pa_items,
            aiAgents=[ # Mocked
                {"name": "Ron AI Clinical Synthesizer", "specialty": "Care Plan Generation & PA", "confidenceScore": 0.90, "insights": ["Generated ADPIE and PA items based on comprehensive analysis."]}
            ],
            sourcesData=[SourceDataResponse(**cit) for cit in all_citations_data], # Convert dicts to SourceDataResponse

            # Populate ADPIE from the generated data
            assessment_subjective_chief_complaint=first_adpie_set.get("assessment_subjective_chief_complaint"),
            assessment_subjective_hpi=first_adpie_set.get("assessment_subjective_hpi"),
            assessment_subjective_goals=first_adpie_set.get("assessment_subjective_goals"),
            assessment_subjective_other=first_adpie_set.get("assessment_subjective_other"),
            assessment_objective_vitals_summary=first_adpie_set.get("assessment_objective_vitals_summary"),
            assessment_objective_physical_exam=first_adpie_set.get("assessment_objective_physical_exam"),
            assessment_objective_diagnostics=first_adpie_set.get("assessment_objective_diagnostics"),
            assessment_objective_meds_reviewed=first_adpie_set.get("assessment_objective_meds_reviewed"),
            assessment_objective_other=first_adpie_set.get("assessment_objective_other"),
            
            recommendedAssessmentsList=[RecommendedAssessmentItemModel(**item) for item in first_adpie_set.get("recommendedAssessmentsList", [])], # Assuming assessments are tied to first diagnosis for now
            nursingDiagnoses=final_nursing_diagnoses,
            
            interdisciplinaryPlan=[item for dx_set in all_generated_adpie_components for item in dx_set.get("interdisciplinaryPlan", [])], # Combine all
            overall_plan_summary=first_adpie_set.get("overall_plan_summary", "Plan summary to be consolidated."), # Placeholder
            next_steps=first_adpie_set.get("next_steps", ["Further review and refinement."]) # Placeholder
        )

        return CarePlanApiResponse(
            full_care_plan=full_care_plan,
            reasoning_text=all_reasoning_texts
        )

    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except aiohttp.ClientError as e:
        print(f"AIOHTTP ClientError in endpoint: {e}")
        raise HTTPException(status_code=502, detail=f"Error calling Perplexity API: {e}")
    except Exception as e:
        print(f"Unexpected error in generate_care_plan_endpoint: {type(e).__name__} - {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {type(e).__name__} - {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8008)
