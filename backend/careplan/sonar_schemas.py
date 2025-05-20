from typing import List, Optional, Union, Literal, Dict
from pydantic import BaseModel, Field

# --- Schemas for ADPIE Generation (mirroring careplan-template.tsx) ---

class RecommendedAssessmentItemModel(BaseModel):
    item: str = Field(..., description="The specific assessment item to be performed.")
    rationale: str = Field(..., description="The rationale for performing this assessment.")
    status: Literal['pending', 'in_progress', 'completed', 'deferred'] = Field(..., description="Initial status of the assessment.")

class InterventionModel(BaseModel):
    interventionText: str = Field(..., description="The specific text of the intervention.")
    interventionType: Literal['general', 'health_teaching', 'monitoring', 'psychosocial'] = Field(..., description="The type of intervention.")
    rationale: str = Field(..., description="The rationale for this intervention.")

class EvaluationModel(BaseModel):
    evaluationText: str = Field(..., description="Text describing how the goal will be evaluated or the result of the evaluation.")
    evaluationMethod: str = Field(..., description="Method used for evaluation (e.g., patient report, observation).")
    evaluationTargetDate: Optional[str] = Field(None, description="Target date for evaluation, if applicable (YYYY-MM-DD).")
    evaluationStatus: Literal['met', 'partially_met', 'not_met', 'ongoing'] = Field(..., description="Status of the goal evaluation.")

class GoalModelForSonar(BaseModel):
    goal_description: str = Field(..., description="The SMART goal description.")
    goal_target_date: Optional[str] = Field(None, description="Target date for achieving the goal (YYYY-MM-DD).")
    goal_outcomes: List[str] = Field(..., description="List of measurable outcomes for the goal.")
    goal_rationale: Optional[str] = Field(None, description="Rationale for setting this goal.")
    interventions: List[InterventionModel] = Field(..., description="List of interventions for this specific goal. Aim for 3-4 interventions per goal, ensuring a total of 10 interventions for the parent diagnosis, with at least 3 of those 10 being 'health_teaching'.", min_items=3, max_items=4) # Prompt will guide total & health_teaching count
    evaluation: EvaluationModel = Field(..., description="The evaluation criteria and status for this goal.")

class SingleNursingDiagnosisADPIEOutputSchema(BaseModel):
    """
    Defines the structured JSON output for a single, complete nursing diagnosis 
    with all its ADPIE components.
    """
    # Nursing Diagnosis Core Fields
    diagnosis_nanda: str = Field(..., description="The NANDA nursing diagnosis label.")
    diagnosis_related_to: Optional[str] = Field(None, description="Factors related to the diagnosis (etiology).")
    diagnosis_evidence: List[str] = Field(..., description="Signs and symptoms (evidence) supporting the diagnosis, drawn from patient context.")
    diagnosis_is_risk: Optional[bool] = Field(False, description="Is this a risk diagnosis?")
    diagnosis_risk_factors: Optional[List[str]] = Field(default_factory=list, description="List of risk factors if it's a risk diagnosis.")

    # Narrative Assessments specific to this diagnosis
    assessment_subjective_chief_complaint: Optional[str] = Field(None, description="Patient's chief complaint relevant to this diagnosis.")
    assessment_subjective_hpi: Optional[str] = Field(None, description="History of present illness relevant to this diagnosis.")
    assessment_subjective_goals: Optional[str] = Field(None, description="Patient's stated goals relevant to this diagnosis.")
    assessment_subjective_other: Optional[str] = Field(None, description="Other subjective findings relevant to this diagnosis.")
    
    assessment_objective_vitals_summary: Optional[str] = Field(None, description="Narrative summary of vital signs relevant to this diagnosis.")
    assessment_objective_physical_exam: Optional[str] = Field(None, description="Key physical exam findings relevant to this diagnosis.")
    assessment_objective_diagnostics: Optional[str] = Field(None, description="Summary of diagnostic results (labs, imaging) relevant to this diagnosis.")
    assessment_objective_meds_reviewed: Optional[str] = Field(None, description="Medication review notes relevant to this diagnosis.")
    assessment_objective_other: Optional[str] = Field(None, description="Other objective findings relevant to this diagnosis.")

    # ADPIE Components for this diagnosis
    recommendedAssessmentsList: List[RecommendedAssessmentItemModel] = Field(..., description="List of exactly 10 recommended assessment items for this diagnosis.", min_items=10, max_items=10)
    goals: List[GoalModelForSonar] = Field(..., description="List of exactly 3 goals for this diagnosis. Each goal will have its own evaluation and interventions.", min_items=3, max_items=3)
    # Interventions are now under each goal as per careplan-template.tsx. The prompt will guide the total count and health_teaching distribution.
    
    # General plan elements that Sonar might associate with this diagnosis, or could be generated once overall.
    # For now, making them optional here. `app.py` might aggregate these from one of the calls or handle them separately.
    interdisciplinaryPlan: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Interdisciplinary plan items relevant to managing this diagnosis.")
    # overall_plan_summary and next_steps are likely too broad for a single diagnosis output, will be handled by app.py after all diagnoses.

    class Config:
        title = "NursingDiagnosisFullADPIE"

# --- Schema for Prior Authorization Generation ---

class PriorAuthItemSchema(BaseModel): # This schema is already well-aligned with careplan-template.tsx
    pa_n_id: Optional[str] = Field(None, description="Unique ID for the prior authorization item, if available or generated by the AI.")
    pa_n_item_name: str = Field(..., description="Name of the medication, service, or procedure identified as potentially requiring prior authorization.")
    pa_n_type: str = Field(..., description="Type of item. For the 5 items: one should be 'Medication', three should be 'Outpatient Service' or 'Outpatient Procedure', and one should be 'Inpatient Admission Potential' or a care-coordination related 'Outpatient Service'.")
    pa_n_status: Optional[str] = Field(None, description="Suggested or known status of the prior authorization (e.g., 'Requires Submission', 'Likely Approved', 'Further Review Needed').")
    pa_n_cpt_code: Optional[str] = Field(None, description="Applicable CPT or HCPCS code, if known or can be reasonably inferred.")
    pa_n_description: Optional[str] = Field(None, description="Brief description or rationale why this item might need PA based on the patient context.")
    pa_n_pos_code: Optional[str] = Field(None, description="Place of Service code, if relevant and known.")
    pa_n_units: Optional[str] = Field(None, description="Number of units, if applicable (e.g., '30 tablets', '1 procedure', '3 sessions').")
    pa_n_dates_of_service: Optional[str] = Field(None, description="Anticipated or applicable dates of service (e.g., 'YYYY-MM-DD', 'Next 30 days').")
    pa_n_criteria_met_details: str = Field(..., description="AI's analysis: Detailed explanation of why this item likely needs PA, referencing specific patient context (diagnoses, meds, treatments, labs from provided FormState) and general medical necessity criteria. Include any supporting evidence or source citations like [S1] if applicable from its knowledge or the provided context.")
    pa_n_estimated_response: Optional[str] = Field(None, description="AI's estimated timeframe for payer response (e.g., '3-5 business days'), if it can infer one.")
    pa_n_approval_confidence: Optional[Union[float, str]] = Field(None, description="AI's estimated confidence level (0.0 to 1.0) for approval, or a descriptive string (e.g., 'High', 'Medium', 'Low'), based on the context.")

class SonarExpectedPaOutputSchema(BaseModel):
    """
    Defines the structured JSON output expected from Perplexity Sonar for Prior Authorization items.
    Sonar is tasked with generating a list of exactly five (5) potential prior authorization items
    based on the full patient context provided (including all generated ADPIE data).
    The five items should be:
    1. One (1) care-related item (e.g., 'Inpatient Admission Potential' or a significant care coordination 'Outpatient Service').
    2. One (1) Rx/Medication item.
    3. Three (3) outpatient items (can be 'Outpatient Service' or 'Outpatient Procedure').
    """
    priorAuthItems: List[PriorAuthItemSchema] = Field(
        ..., 
        description="A list of exactly five potential prior authorization items as specified: 1 care-related, 1 Rx, 3 outpatient. Each item should be fully detailed according to the PriorAuthItemSchema.",
        min_items=5,
        max_items=5 
    )

    class Config:
        title = "PriorAuthorizationItemsOutput"
