import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import {
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, TrendingUp, ListChecks, Edit3, Repeat,
  Link, BookOpen, ImageIcon, PlayCircle, Send, ThumbsUp, ThumbsDown, Archive, AlertTriangle, Loader2, Palette, Users, MessageSquare
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import ChatInterface, { ChatMessage } from './ChatInterface';
import ReasoningDisplay from './ReasoningDisplay';
// import SonarChatHandler from './SonarChatHandler'; // No longer used
import GrokChatHandler from './GrokChatHandler'; // Import GrokChatHandler
import {
  generateKanbanData,
  updateTaskStatus as updateTask,
  assignTaskToAgent as assignTask,
  TaskStatus,
  KanbanEpic,
  KanbanTask,
  CarePlanDataForKanban,
  NursingDiagnosis,
  CarePlanIntervention,
  CarePlanGoal,
  CarePlanEvaluation
} from './kanban-helpers';

// --- Data Types ---
type SectionType = 'assessment' | 'diagnosis' | 'implementation' | 'evaluation' | 'sources' | 'kanban' | 'chat' | 'summary_coordination_sources' | 'prior_authorizations';
type ActiveTabType = 'overview' | SectionType;

interface VitalSigns {
  vital_bp?: string;
  vital_pulse?: string;
  vital_resp_rate?: string;
  vital_temp?: string;
  vital_o2sat?: string;
  vital_pain_score?: string;
}

interface PatientData {
  patient_full_name?: string;
  patient_age?: string | number;
  patient_gender?: string;
  patient_mrn?: string;
  patient_dob?: string;
  patient_insurance_plan?: string;
  patient_policy_number?: string;
  patient_primary_provider?: string;
  patient_admission_date?: string;
  allergies?: string[];
  vitalSigns?: VitalSigns;
  nyha_class_description?: string;
}

interface LabResult {
  lab_n_name?: string;
  lab_n_value?: string;
  lab_n_flag?: string;
  lab_n_trend?: string;
}

interface Medication {
  med_n_name?: string;
  med_n_dosage?: string;
  med_n_route?: string;
  med_n_frequency?: string;
  med_n_status?: string;
  med_n_pa_required?: boolean | string;
}

interface Treatment {
  treatment_n_name?: string;
  treatment_n_status?: string;
  treatment_n_details?: string;
  treatment_n_date?: string;
  treatment_n_pa_required?: boolean | string;
}

interface ClinicalData {
  primary_diagnosis_text?: string;
  secondaryDiagnoses?: string[];
  labs?: LabResult[];
  medications?: Medication[];
  treatments?: Treatment[];
  last_imaging_summary?: string;
  last_ecg_summary?: string;
}

interface AgentType {
  name?: string;
  specialty?: string;
  confidenceScore?: number;
  insights?: string[];
  assessmentContribution?: string;
  planningContribution?: string;
  implementationContribution?: string;
  evaluationContribution?: string;
}

interface RecommendedAssessmentItem {
  item: string;
  rationale: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
}

export interface InterventionType {
  interventionText: string;
  interventionType: 'general' | 'health_teaching' | 'monitoring' | 'psychosocial';
  rationale: string;
}

export interface EvaluationType {
  evaluationText: string;
  evaluationMethod: string;
  evaluationTargetDate?: string;
  evaluationStatus: 'met' | 'partially_met' | 'not_met' | 'ongoing';
}

interface PriorAuthCriterion {
  name?: string; // This seems to be part of pa_n_criteria_met_details now
  met?: boolean | string; // This seems to be part of pa_n_criteria_met_details now
  notes?: string; // This seems to be part of pa_n_criteria_met_details now
}

interface PriorAuthItem {
  pa_n_id?: string;
  pa_n_item_name?: string;
  pa_n_type?: 'Medication' | 'Outpatient Service' | 'Outpatient Procedure' | 'Inpatient Admission Potential';
  pa_n_status?: string;
  pa_n_cpt_code?: string;
  pa_n_description?: string;
  pa_n_pos_code?: string;
  pa_n_units?: string;
  pa_n_dates_of_service?: string;
  pa_n_criteria_met_details?: string; // This will contain text and inline citations like [S1]
  pa_n_estimated_response?: string;
  pa_n_approval_confidence?: string; // Should be number, but schema says string. Will parse.
  // Adding back date fields for simulation logic, prefixed
  pa_n_submitted_date?: string;
  pa_n_approved_date?: string;
  pa_n_expiration_date?: string;
  pa_n_estimated_submission?: string; // This was in the old schema, might be useful for mock
  [key: string]: any; // Keep for flexibility if backend sends extra fields
}

interface SourceData {
  source_n_id?: string;
  source_n_title?: string;
  source_n_type?: string;
  source_n_url?: string;
  source_n_snippet?: string;
  source_n_retrieval_date?: string;
  source_n_agent_source?: string;
  [key: string]: any;
}

export interface CarePlanJsonData {
  patientData?: PatientData;
  clinicalData?: ClinicalData;
  aiAgents?: AgentType[];
  priorAuthItems?: PriorAuthItem[]; // Uses the new PriorAuthItem interface
  sourcesData?: SourceData[]; // Uses the new SourceData interface
  assessment_subjective_chief_complaint?: string;
  assessment_subjective_hpi?: string;
  assessment_subjective_goals?: string;
  assessment_subjective_other?: string;
  assessment_objective_vitals_summary?: string;
  assessment_objective_physical_exam?: string;
  assessment_objective_diagnostics?: string;
  assessment_objective_meds_reviewed?: string;
  assessment_objective_other?: string;
  recommendedAssessmentsList?: RecommendedAssessmentItem[];
  nursingDiagnoses?: {
    diagnosis_nanda: string;
    diagnosis_related_to?: string;
    diagnosis_evidence: string[];
    diagnosis_is_risk?: boolean;
    diagnosis_risk_factors?: string[];
    goals: {
      goal_description: string;
      goal_target_date?: string;
      goal_outcomes: string[];
      goal_rationale?: string;
      interventions: InterventionType[];
      evaluation: EvaluationType;
    }[];
  }[];
  interdisciplinaryPlan?: {
      discipline: string;
      plan_item: string;
  }[];
  overall_plan_summary?: string;
  next_steps: string[];
  notification_title?: string;
  notification_message?: string;
  notification_detail_1?: string;
  notification_detail_2?: string;
}

// Definition for ReasoningStage, used by CarePlanTemplateProps
interface ReasoningStage {
  markdownContent: string | null;
  isLoading: boolean;
  isComplete: boolean;
}

interface CarePlanTemplateProps {
  data: CarePlanJsonData | null;
  enableSimulations?: boolean;
  sectionReasoning?: { [sectionId: string]: ReasoningStage };
  sectionUiStates?: { [sectionId: string]: { isReady: boolean; displayName: string; } };
  onSectionToggle?: (sectionKey: string) => void;
  expandedSectionsFromParent?: Record<string, boolean>;
  initialTab?: ActiveTabType; // Added initialTab prop
  initialReasoningContent?: string | null; // Added for Grok reasoning
  initialGrokResponse?: string; // Added for Grok initial response
}

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string | number | null | undefined;
  color?: string;
}

interface StatusBadgeProps {
  status: string;
}

const randomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const generateMockCarePlanData = (): CarePlanJsonData => {
  // ... (mock data generation remains the same) ...
  const createMockInterventions = (goalDesc: string, count: number = 20): InterventionType[] => {
    const interventions: InterventionType[] = [];
    const commonActions = [
      "Monitor vital signs q4h and PRN", "Assess pain level using 0-10 scale", "Educate patient on medication purpose, dosage, side effects",
      "Provide emotional support and active listening", "Encourage deep breathing and coughing exercises", "Maintain strict intake and output records",
      "Administer prescribed medications as ordered", "Turn and reposition patient q2h", "Assess for signs of infection",
      "Collaborate with physical therapy for mobility plan", "Consult dietitian for nutritional needs", "Reinforce adherence to treatment plan",
      "Provide comfort measures", "Document patient response to interventions", "Prepare patient for discharge (education, follow-up)"
    ];
    const teachingActions = [
        "Educate on signs and symptoms of worsening condition", "Teach proper medication administration technique", "Review dietary restrictions and recommendations",
        "Instruct on self-monitoring techniques (e.g., daily weights)", "Provide information on community resources"
    ];

    for (let i = 0; i < count; i++) {
      const isHealthTeaching = i >= (count - 5); // Last 5 are health teaching
      const actionList = isHealthTeaching ? teachingActions : commonActions;
      const actionIndex = isHealthTeaching ? i - (count - 5) : i;
      
      interventions.push({
        interventionText: `${actionList[actionIndex % actionList.length]} (for goal: ${goalDesc.substring(0,30)}...)`,
        interventionType: isHealthTeaching ? 'health_teaching' : 'general',
        rationale: `To support achievement of '${goalDesc.substring(0,30)}...' by ${isHealthTeaching ? 'enhancing patient knowledge and self-management skills' : 'providing direct care and monitoring'}. Rationale snippet ${i+1}.`,
      });
    }
    return interventions;
  };

  const createMockEvaluation = (goalDesc: string): EvaluationType => {
    const statuses: EvaluationType['evaluationStatus'][] = ['met', 'partially_met', 'not_met', 'ongoing'];
    return {
      evaluationText: `Assess patient's progress towards: ${goalDesc.substring(0,50)}...`,
      evaluationMethod: "Patient report, observation, and review of vital signs/lab data.",
      evaluationTargetDate: randomDate(new Date(Date.now() + 86400000 * 7), new Date(Date.now() + 86400000 * 14)),
      evaluationStatus: statuses[Math.floor(Math.random() * statuses.length)],
    };
  };

  const createGoals = (numGoals: number, diagnosisName: string) => {
    const goals = [];
    for (let i = 0; i < numGoals; i++) {
      const goalDesc = `Patient will demonstrate understanding of ${diagnosisName.toLowerCase()} management by ${randomDate(new Date(Date.now() + 86400000 * (i+1)))}. Goal ${i+1}.`;
      goals.push({
        goal_description: goalDesc,
        goal_target_date: randomDate(new Date(Date.now() + 86400000 * (i+2)), new Date(Date.now() + 86400000 * (i+7))),
        goal_outcomes: [
          `Outcome 1 for goal ${i+1} (e.g., verbalizes 3 key self-care strategies).`,
          `Outcome 2 for goal ${i+1} (e.g., demonstrates correct technique for X).`,
          `Outcome 3 for goal ${i+1} (e.g., identifies 2 reportable symptoms).`,
        ],
        goal_rationale: `This goal is crucial for ${diagnosisName.toLowerCase()} because it empowers the patient towards self-management and reduces risk of readmission. Rationale ${i+1}.`,
        interventions: createMockInterventions(goalDesc, 20), // 15 general, 5 health teaching
        evaluation: createMockEvaluation(goalDesc), 
      });
    }
    return goals;
  };
  
  const diagnosisNames = [
    "Fluid Volume Excess", "Activity Intolerance", "Ineffective Airway Clearance", "Anxiety", "Risk for Impaired Skin Integrity"
  ];

  const assessmentStatuses: RecommendedAssessmentItem['status'][] = ['pending', 'in_progress', 'completed', 'deferred'];
  const mockRecommendedAssessments: RecommendedAssessmentItem[] = Array.from({ length: 10 }, (_, i) => ({
    item: `Recommended Assessment Item ${i + 1} (e.g., Daily weight monitoring)`,
    rationale: `Rationale for assessment ${i + 1}: To monitor fluid status and early signs of decompensation.`,
    status: assessmentStatuses[Math.floor(Math.random() * assessmentStatuses.length)],
  }));

  return {
    patientData: {
      patient_full_name: "Sarah Connor", patient_age: 45, patient_gender: "Female", patient_mrn: "MRN789012", patient_dob: "1979-05-10",
      patient_insurance_plan: "United HealthCare PPO", patient_policy_number: "UHC123456789", patient_primary_provider: "Dr. Eliza Marcus",
      patient_admission_date: randomDate(new Date(2024, 0, 1)), allergies: ["Penicillin (Rash)", "Shellfish (Anaphylaxis)"],
      vitalSigns: { vital_bp: "122/78 mmHg", vital_pulse: "72 bpm", vital_resp_rate: "16/min", vital_temp: "37.0°C", vital_o2sat: "98%", vital_pain_score: "2/10" },
      nyha_class_description: "NYHA Class II (Mild symptoms)",
    },
    clinicalData: {
      primary_diagnosis_text: "Congestive Heart Failure, exacerbation",
      secondaryDiagnoses: ["Hypertension", "Type 2 Diabetes Mellitus"],
      labs: [
        { lab_n_name: "BNP", lab_n_value: "450 pg/mL", lab_n_flag: "HIGH", lab_n_trend: "increasing" },
        { lab_n_name: "Potassium", lab_n_value: "3.8 mEq/L", lab_n_flag: "NORMAL", lab_n_trend: "stable" },
      ],
      medications: [
        { med_n_name: "Lisinopril", med_n_dosage: "10mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false },
        { med_n_name: "Entresto", med_n_dosage: "49/51mg", med_n_route: "PO", med_n_frequency: "BID", med_n_status: "Pending Submission", med_n_pa_required: true },
      ],
      treatments: [
        { treatment_n_name: "Cardiac Diet Education", treatment_n_status: "Scheduled", treatment_n_details: "Consult with dietitian", treatment_n_date: randomDate(), treatment_n_pa_required: false },
        { treatment_n_name: "Echocardiogram", treatment_n_status: "Pending Submission", treatment_n_details: "Assess LV function", treatment_n_date: randomDate(new Date(Date.now() + 86400000*2)), treatment_n_pa_required: true },
      ],
      last_imaging_summary: "Chest X-ray (2024-01-15): Mild pulmonary congestion, consistent with CHF.",
      last_ecg_summary: "ECG (2024-01-15): Normal Sinus Rhythm, LVH noted.",
    },
    aiAgents: [
      { name: "Clinical Insight Agent", specialty: "Cardiology Focus", confidenceScore: 0.92, assessmentContribution: "Suggests monitoring fluid balance closely due to CHF exacerbation and potential impact of comorbidities. Review NYHA classification.", planningContribution: "Confirms CHF as primary, highlights risk of renal impairment with diuretics. Suggests NANDA diagnoses related to fluid balance and activity. Recommends daily weights, strict I/O monitoring.", implementationContribution: "Flags potential Lisinopril-Furosemide interaction (monitor potassium). Suggests specific patient education points for CHF self-management.", evaluationContribution: "Advises reassessment of NYHA class post-diuresis and evaluation of patient's understanding of discharge medications.", insights: ["BNP trend indicates response to initial therapy may be slow.", "Consider echocardiogram if symptoms worsen despite treatment."] },
      { name: "Authorization & Benefits Agent", specialty: "Prior Auth & Formulary Compliance", confidenceScore: 0.85, planningContribution: "Identified Entresto as requiring PA; initiated process. Verified formulary status and co-pay estimation.", implementationContribution: "Prepared documentation packet for Entresto PA submission, including relevant clinical notes and lab values.", insights: ["Entresto PA typically requires documentation of Lisinopril trial/failure or intolerance. Expedited review possible with peer-to-peer.", "Alternative ARNI, Sacubitril/Valsartan, may have similar PA requirements. Estimated approval timeline for Entresto is 3-5 days."] },
      { name: "Discharge Coordination Agent", specialty: "Continuity of Care & Readmission Prevention", confidenceScore: 0.78, planningContribution: "Suggests home health referral for medication management and CHF education post-discharge. Identifies need for follow-up PCP appointment within 7 days.", evaluationContribution: "Recommends assessing patient's ability to obtain medications and transportation for follow-up. Confirms DME needs (e.g., walker, scale).", insights: ["Patient has strong family support, which is beneficial for home care. Identified local pharmacy for medication synchronization.", "Flagged patient for telephonic follow-up 48 hours post-discharge by care manager to address any early issues."] }
    ],
    recommendedAssessmentsList: mockRecommendedAssessments,
    priorAuthItems: [
      { 
        pa_n_id: "PA-RX-001", 
        pa_n_item_name: "Entresto 49/51mg", 
        pa_n_type: "Medication", 
        pa_n_status: "Pending Submission", 
        pa_n_cpt_code: "J0123 (example NDC)", 
        pa_n_description: "Sacubitril/valsartan for HFrEF",
        pa_n_pos_code: "11", // Office
        pa_n_units: "60 tablets",
        pa_n_dates_of_service: `${randomDate()} - ${randomDate(new Date(Date.now() + 30 * 86400000))}`,
        pa_n_criteria_met_details: "Patient has symptomatic HFrEF with LVEF < 40% on recent echo [S2]. Currently on Lisinopril, but per guidelines [S1], Entresto is preferred for further risk reduction. Meets payer criteria for ACEi trial.",
        pa_n_estimated_response: "3-5 business days", 
        pa_n_approval_confidence: "0.75"
      },
      { 
        pa_n_id: "PA-OUTPT-001", 
        pa_n_item_name: "Echocardiogram, complete", 
        pa_n_type: "Outpatient Procedure", 
        pa_n_status: "Requires Submission", 
        pa_n_cpt_code: "93306",
        pa_n_description: "Comprehensive echocardiogram to assess LV function and valvular status.",
        pa_n_pos_code: "22", // Outpatient Hospital
        pa_n_units: "1 procedure",
        pa_n_dates_of_service: randomDate(new Date(Date.now() + 2 * 86400000)),
        pa_n_criteria_met_details: "Patient presenting with CHF exacerbation symptoms (dyspnea, edema) [S2]. Necessary to evaluate current cardiac function to guide therapy adjustments as per AHA/ACC guidelines [S1].",
        pa_n_estimated_response: "1-2 business days", 
        pa_n_approval_confidence: "0.90" 
      },
      // Add 3 more outpatient and 1 inpatient potential mock PAs
      {
        pa_n_id: "PA-OUTPT-002",
        pa_n_item_name: "Cardiac Rehabilitation Program",
        pa_n_type: "Outpatient Service",
        pa_n_status: "Pending Review",
        pa_n_cpt_code: "93798",
        pa_n_description: "Physician-supervised cardiac rehabilitation program, 36 sessions.",
        pa_n_pos_code: "22",
        pa_n_units: "36 sessions",
        pa_n_dates_of_service: `${randomDate(new Date(Date.now() + 7 * 86400000))} - ${randomDate(new Date(Date.now() + 90 * 86400000))}`,
        pa_n_criteria_met_details: "Post-CHF exacerbation, to improve functional capacity and reduce readmission risk [S1, S3]. Patient motivated.",
        pa_n_estimated_response: "5-7 business days",
        pa_n_approval_confidence: "0.80"
      },
      {
        pa_n_id: "PA-OUTPT-003",
        pa_n_item_name: "Sleep Study (Polysomnography)",
        pa_n_type: "Outpatient Procedure", // Changed to "Outpatient Procedure"
        pa_n_status: "Requires Submission",
        pa_n_cpt_code: "95810",
        pa_n_description: "Overnight sleep study to evaluate for obstructive sleep apnea, a common comorbidity in CHF.",
        pa_n_pos_code: "11", // Can be done in sleep lab (office setting for some) or hospital outpatient
        pa_n_units: "1 study",
        pa_n_dates_of_service: randomDate(new Date(Date.now() + 14 * 86400000)),
        pa_n_criteria_met_details: "Patient reports daytime fatigue and partner notes snoring [S2]. OSA is prevalent in CHF and impacts outcomes [S3].",
        pa_n_estimated_response: "7-10 business days",
        pa_n_approval_confidence: "0.70"
      },
      {
        pa_n_id: "PA-OUTPT-004",
        pa_n_item_name: "Nutritional Counseling for CHF",
        pa_n_type: "Outpatient Service",
        pa_n_status: "Likely Approved",
        pa_n_cpt_code: "97802",
        pa_n_description: "Medical nutrition therapy, initial assessment and intervention.",
        pa_n_pos_code: "11",
        pa_n_units: "1 session",
        pa_n_dates_of_service: randomDate(new Date(Date.now() + 3 * 86400000)),
        pa_n_criteria_met_details: "Essential for CHF management, focusing on low sodium diet and fluid balance [S1]. Patient has Type 2 Diabetes, further indicating need [S2].",
        pa_n_estimated_response: "1-2 business days",
        pa_n_approval_confidence: "0.95"
      },
      {
        pa_n_id: "PA-INPT-001",
        pa_n_item_name: "Inpatient Hospital Admission for CHF Exacerbation",
        pa_n_type: "Inpatient Admission Potential",
        pa_n_status: "Likely Approved (based on presentation)",
        pa_n_cpt_code: "DRG 291 (Heart Failure & Shock w MCC)", // Example DRG
        pa_n_description: "Admission for acute decompensated heart failure requiring IV diuretics and intensive monitoring.",
        pa_n_pos_code: "21", // Inpatient Hospital
        pa_n_units: "Est. 3-5 days",
        pa_n_dates_of_service: randomDate(new Date(2024,0,1)), // Use randomDate or a fixed mock date
        pa_n_criteria_met_details: "Patient presents with worsening dyspnea, bibasilar crackles, 2+ pitting edema, and elevated BNP (450 pg/mL) [S2]. Meets InterQual/Milliman criteria for inpatient admission due to acute decompensation and need for IV therapy [S4 - hypothetical payer policy source].",
        pa_n_estimated_response: "Concurrent Review",
        pa_n_approval_confidence: "0.88"
      }
    ],
    sourcesData: [
      { source_n_id: "S1", source_n_title: "AHA/ACC CHF Guidelines 2023", source_n_type: "Clinical Guideline", source_n_url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063", source_n_snippet: "Guideline for management of heart failure, including pharmacologic and non-pharmacologic interventions, and indications for procedures.", source_n_retrieval_date: randomDate(), source_n_agent_source: "Ron of Ron AI" },
      { source_n_id: "S2", source_n_title: "Patient EHR Record - Admission Note (Simulated)", source_n_type: "EHR Note", source_n_url: "#", source_n_snippet: "Admission H&P detailing patient presentation (dyspnea, edema, weight gain, BNP 450) and initial assessment by Dr. Marcus.", source_n_retrieval_date: randomDate(), source_n_agent_source: "Ron of Ron AI" },
      { source_n_id: "S3", source_n_title: "UpToDate: Overview of Cardiac Rehabilitation", source_n_type: "Review Article", source_n_url: "https://www.uptodate.com/contents/overview-of-cardiac-rehabilitation", source_n_snippet: "Cardiac rehabilitation is recommended for patients with stable heart failure to improve functional capacity and quality of life.", source_n_retrieval_date: randomDate(), source_n_agent_source: "Ron of Ron AI" },
      { source_n_id: "S4", source_n_title: "Simulated Payer Policy: Inpatient Admission for CHF (Policy #CHF123)", source_n_type: "Payer Policy", source_n_url: "#", source_n_snippet: "Criteria for inpatient admission for CHF exacerbation include NYHA Class III/IV symptoms, evidence of fluid overload refractory to oral diuretics, or need for IV vasoactive agents.", source_n_retrieval_date: randomDate(), source_n_agent_source: "Ron of Ron AI" }
    ],
    assessment_subjective_chief_complaint: "Patient reports increased shortness of breath and leg swelling over the past 3 days. States, 'I can barely walk to the bathroom without getting winded.'",
    assessment_subjective_hpi: "Symptoms worsened with minimal exertion, unable to sleep flat (requires 3 pillows). Denies chest pain, palpitations, or syncope. Reports adherence to home medications (Lisinopril, Metformin) until 2 days ago when 'ran out of Lisinopril'. Noted 5lb weight gain on home scale.",
    assessment_subjective_goals: "Patient wishes to 'breathe easier,' 'get the swelling down,' and 'go home to my grandkids.' Expresses concern about managing condition at home.",
    assessment_subjective_other: "Patient lives with daughter who provides some support. Reports feeling anxious about current symptoms. Denies tobacco/illicit drug use, occasional alcohol (1 glass wine/week).",
    assessment_objective_vitals_summary: "T:37.0C, P:72, RR:22, BP:122/78, O2Sat:94% on RA, Pain: 2/10 (achy legs). See vital signs section for full details.",
    assessment_objective_physical_exam: "Alert and oriented x3. Mild dyspnea at rest. Cardiovascular: RRR, S1/S2 normal, no murmurs. Respiratory: Bibasilar crackles 1/2 way up. GI: Abdomen soft, non-tender, BS active. Extremities: 2+ pitting edema bilateral lower extremities to mid-calf. Skin: Warm, dry, intact.",
    assessment_objective_diagnostics: "Labs: BNP 450 pg/mL (High), K+ 3.8, Cr 1.1. CXR: Mild pulmonary congestion. ECG: NSR, LVH. (Refer to Clinical Data for full lab/imaging details)",
    assessment_objective_meds_reviewed: "Home medications verified. Lisinopril 10mg PO daily (last dose 2 days ago), Metformin 500mg PO BID. New order for Furosemide IV.",
    assessment_objective_other: "Weight on admission: 155 lbs (gain of 5 lbs from reported home weight). Patient appears fatigued.",
    
    nursingDiagnoses: diagnosisNames.slice(0, 5).map((name, index) => ({ // Generate up to 5 diagnoses
      diagnosis_nanda: name,
      diagnosis_related_to: index === 0 ? "Compromised regulatory mechanisms (CHF)" : index === 1 ? "Imbalance between oxygen supply and demand" : index === 2 ? "Excessive mucus or retained secretions" : index === 3 ? "Situational crisis and threat to health status" : "Edema, potential immobility",
      diagnosis_evidence: index === 4 ? [] : [
        `Evidence point 1 for ${name} (e.g., Edema for Fluid Excess).`,
        `Evidence point 2 for ${name} (e.g., Dyspnea on exertion for Activity Intolerance).`,
        `Evidence point 3 for ${name} (e.g., Patient report).`,
        `Evidence point 4 for ${name} (e.g., Auscultation finding).`,
        `Evidence point 5 for ${name} (e.g., Lab value if relevant).`,
      ],
      diagnosis_is_risk: index === 4,
      diagnosis_risk_factors: index === 4 ? [ "Edema", "Potential immobility due to fatigue", "Compromised circulation secondary to CHF" ] : [],
      goals: createGoals(5, name), // Generate up to 5 goals per diagnosis
    })),
    
    interdisciplinaryPlan: [
      { discipline: "Nursing", plan_item: "Administer diuretics as ordered, monitor I&O, daily weights. Educate on CHF self-management." },
      { discipline: "Cardiology", plan_item: "Evaluate response to medical therapy. Titrate medications as appropriate. Review echocardiogram results." },
      { discipline: "Dietitian", plan_item: "Provide cardiac diet education (low sodium). Assess nutritional status." },
      { discipline: "Physical Therapy", plan_item: "Evaluate for mobility assistance, develop gentle exercise plan, educate on energy conservation." },
      { discipline: "Social Work/Case Management", plan_item: "Assess discharge needs, coordinate home health, address psychosocial concerns, assist with PA for Entresto if issues arise." }
    ],

    overall_plan_summary: "Multifaceted plan focused on diuresis for CHF exacerbation, optimizing medical therapy (including PA for Entresto), managing activity intolerance and anxiety, preventing complications, and preparing for a safe discharge with robust support. Emphasis on patient education and interdisciplinary collaboration.",
    next_steps: [
      "Monitor response to Furosemide, assess need for further doses, aiming for negative fluid balance.",
      "Aggressively follow up on Entresto PA status with Authorization Agent; escalate if delays noted.",
      "Schedule dietitian and physical therapy consults today.",
      "Initiate comprehensive discharge planning: home health referral, PCP appointment within 7 days, medication reconciliation education.",
      "Ensure all documentation supports medical necessity for continued stay and planned interventions for utilization review and eventual claims submission."
    ],
    notification_title: "New Lab Result: Critical", notification_message: "Potassium level is 2.9 mEq/L (Low).", notification_detail_1: "Action Required", notification_detail_2: "Notify Provider STAT"
  };
};

// --- UI Sub-Components ---

const TabButton = ({ active, icon, label, onClick, anonClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void; anonClick?: (label: string) => void; }) => (
  <button
    className={`flex items-center px-6 py-3 text-sm font-medium tracking-wider transition-all duration-300 whitespace-nowrap group relative border-b-2 mx-2 rounded-t-md ${
      active
        ? 'text-sky-400 border-sky-500 bg-slate-800 glow-sky-500'
        : 'text-slate-400 hover:text-sky-400 border-transparent hover:border-slate-700 hover:bg-slate-800'
    }`}
    onClick={() => { onClick(); if(anonClick) anonClick(label); }}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-2.5 transition-colors duration-300 ${active ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-500'}` } as any)}
    <span className="tracking-wider">{label}</span>
  </button>
);

const SectionHeader = ({ title, icon, expanded, onToggle, actionButton }: { title: string; icon: ReactNode; expanded: boolean; onToggle: () => void; actionButton?: ReactNode }) => (
  <div
    className={`flex justify-between items-center py-6 px-8 rounded-t-lg cursor-pointer transition-all duration-300 ease-in-out ${
      expanded ? 'bg-slate-800 text-white shadow-lg border-b-2 border-sky-500 glow-sky-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-b border-slate-700'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center min-w-0 mr-3 pl-2">
      {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-3 transition-colors duration-300 ${expanded ? 'text-sky-400' : 'text-slate-400'} flex-shrink-0` } as any)}
      <h3 className="font-semibold text-xl tracking-wide leading-relaxed truncate" title={title}>{title}</h3>
    </div>
    <div className="flex items-center flex-shrink-0">
      {actionButton && <div className="mr-5">{actionButton}</div>}
      {expanded ? <ChevronUp size={22} className={expanded ? "text-sky-400" : "text-slate-300"} /> : <ChevronDown size={22} className={expanded ? "text-sky-400" : "text-slate-300"} />}
    </div>
  </div>
);

const InfoCard = ({ icon, label, value, color = "sky" }: InfoCardProps) => {
  // Electric color mapping
  const electricColorClasses = {
    sky: "text-sky-400 border-sky-500 glow-sky-500",
    lime: "text-lime-400 border-lime-500 glow-lime-500",
    amber: "text-amber-400 border-amber-500 glow-amber-500",
    fuchsia: "text-fuchsia-400 border-fuchsia-500 glow-fuchsia-500",
    teal: "text-teal-400 border-teal-500 glow-teal-500",
    purple: "text-purple-400 border-purple-500 glow-purple-500",
    red: "text-red-400 border-red-500 glow-red-500",
  };
  const safeColor = (color as keyof typeof electricColorClasses) in electricColorClasses ? (color as keyof typeof electricColorClasses) : 'sky';
  const currentElectricColor = electricColorClasses[safeColor];

  return (
    <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-700 flex items-start hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:border-slate-600">
      <div className={`rounded-lg p-3.5 mr-5 bg-slate-800 border ${currentElectricColor.split(' ')[1]} ${currentElectricColor.split(' ')[2]} flex-shrink-0`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28, className: currentElectricColor.split(' ')[0] } as any)}
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium text-slate-400 tracking-wide mb-1.5 truncate">{label}</p>
        <p className="font-bold text-slate-100 text-2xl tracking-wide leading-snug truncate" title={String(value || '')}>{value || <span className="italic text-slate-500">N/A</span>}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let textColorClass, iconElement, glowClass;
  const displayStatus = status || 'Unknown';

  switch(displayStatus.toLowerCase()) {
    case 'approved': case 'active': case 'met': case 'completed':
      textColorClass = 'text-lime-400'; iconElement = <CheckCircle size={14} className="text-lime-400 mr-1.5" />; glowClass = 'glow-lime-400'; break;
    case 'in progress': case 'pending': case 'partially met': case 'ongoing':
      textColorClass = 'text-amber-400'; iconElement = <Clock size={14} className="text-amber-400 mr-1.5 animate-pulse" />; glowClass = 'glow-amber-400'; break;
    case 'pending submission': case 'scheduled':
      textColorClass = 'text-sky-400'; iconElement = <FileText size={14} className="text-sky-400 mr-1.5" />; glowClass = 'glow-sky-400'; break;
    case 'denied': case 'not met': case 'rejected':
      textColorClass = 'text-red-500'; iconElement = <X size={14} className="text-red-500 mr-1.5" />; glowClass = 'glow-red-500'; break;
    case 'new order':
      textColorClass = 'text-fuchsia-400'; iconElement = <Plus size={14} className="text-fuchsia-400 mr-1.5" />; glowClass = 'glow-fuchsia-400'; break;
    default:
      textColorClass = 'text-slate-400'; iconElement = <Info size={14} className="text-slate-400 mr-1.5" />; glowClass = 'shadow-none';
  }
  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 ${textColorClass} ${glowClass} border border-slate-700`}>
      {iconElement}
      {displayStatus}
    </div>
  );
};

const getAgentGradient = (agentName: string) => {
  const name = (agentName || "").toLowerCase();
  // Define electric colors for agent types
  if (name.includes("clinical")) {
    return {
      accentColor: "sky", // Corresponds to electricColorClasses in InfoCard
      icon: <Activity size={24} className="text-sky-400" />,
      borderColor: "border-sky-500",
      glowClass: "glow-sky-500",
    };
  }
  if (name.includes("authorization") || name.includes("benefits")) {
    return {
      accentColor: "purple",
      icon: <Shield size={24} className="text-purple-400" />,
      borderColor: "border-purple-500",
      glowClass: "glow-purple-500",
    };
  }
  if (name.includes("discharge") || name.includes("coordination")) {
    return {
      accentColor: "teal",
      icon: <Users size={24} className="text-teal-400" />,
      borderColor: "border-teal-500",
      glowClass: "glow-teal-500",
    };
  }
  return { // Default
    accentColor: "slate", // A neutral, non-electric default
    icon: <Zap size={24} className="text-slate-400" />,
    borderColor: "border-slate-500",
    glowClass: "shadow-none",
  };
};

const AgentCard = ({ agent, isExpanded, onToggle, section }: { agent: AgentType; isExpanded: boolean; onToggle: () => void; section: ActiveTabType }) => {
  const agentName = agent?.name || 'Unknown Agent';
  const agentSpecialty = agent?.specialty || 'Unknown Specialty';
  const agentConfidence = agent?.confidenceScore || 0;
  const insights = agent?.insights || [];

  const styles = getAgentGradient(agentName);

  const getContributionText = (currentSection: ActiveTabType): string | React.ReactNode => {
    if (!agent) return <span className="italic text-slate-500">N/A</span>;
    switch (currentSection) {
      case 'overview':
        return agent.assessmentContribution || agent.planningContribution || agent.implementationContribution || agent.evaluationContribution || "Provides overall strategic insights.";
      case 'assessment':
        return agent.assessmentContribution || <span className="italic text-slate-500">No specific assessment contribution.</span>;
      case 'diagnosis': // Covers Diagnosis & Goals
        return agent.planningContribution || <span className="italic text-slate-500">No specific planning contribution.</span>;
      case 'implementation': // Covers Interventions
        return agent.implementationContribution || <span className="italic text-slate-500">No specific implementation contribution.</span>;
      case 'evaluation':
        return agent.evaluationContribution || <span className="italic text-slate-500">No specific evaluation contribution.</span>;
      case 'kanban':
         return agent.implementationContribution || "Contributes to task execution and monitoring.";
      case 'sources':
        return "Agent may cite sources; direct contribution is through evidence provided.";
      default:
        return <span className="italic text-slate-500">N/A</span>;
    }
  };
  
  return (
    <div className={`bg-slate-900 rounded-xl shadow-xl overflow-hidden border ${isExpanded ? `ring-2 ring-offset-2 ring-offset-slate-950 ${styles.borderColor.replace('border-', 'ring-')}` : styles.borderColor} ${styles.glowClass} hover:shadow-2xl transition-all duration-300 ease-in-out`}>
      <div className={`bg-slate-800 px-5 py-4 text-white flex justify-between items-center cursor-pointer border-b ${styles.borderColor}`} onClick={onToggle}>
        <div className="flex items-center min-w-0 mr-3">
          <div className={`p-2.5 bg-slate-700 rounded-lg mr-4 shadow-inner flex-shrink-0 border ${styles.borderColor} ${styles.glowClass}`}>{styles.icon}</div>
          <div className="min-w-0">
            <h4 className="font-bold text-xl text-slate-100 truncate" title={agentName}>{agentName}</h4>
            <p className="text-sm text-slate-300 truncate" title={agentSpecialty}>{agentSpecialty}</p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <div className={`bg-slate-700 border ${styles.borderColor} px-3.5 py-2 rounded-md text-sm font-semibold mr-4 shadow-sm ${styles.glowClass}`}>
            <span className={`font-bold ${styles.accentColor === 'slate' ? 'text-slate-200' : `text-${styles.accentColor}-400`}`}>{(agentConfidence * 100).toFixed(0)}%</span> Conf.
          </div>
          {isExpanded ? <ChevronUp size={20} className={styles.accentColor === 'slate' ? 'text-slate-300' : `text-${styles.accentColor}-400`} /> : <ChevronDown size={20} className={styles.accentColor === 'slate' ? 'text-slate-300' : `text-${styles.accentColor}-400`} />}
        </div>
      </div>
      {isExpanded && (
        <div className={`p-5 space-y-5 border-t ${styles.borderColor} bg-slate-900`}>
          <div className={`rounded-lg p-4 border ${styles.borderColor} bg-slate-800 shadow-md`}>
            <div className="font-semibold text-slate-100 text-lg mb-2.5 flex items-center">
              <Palette size={18} className={`mr-2.5 ${styles.accentColor === 'slate' ? 'text-slate-400' : `text-${styles.accentColor}-400`}`} /> {section.charAt(0).toUpperCase() + section.slice(1)} Contribution:
            </div>
            <p className="text-base text-slate-200 leading-relaxed">{getContributionText(section)}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-100 mb-3 flex items-center"><Zap size={18} className="mr-2 text-amber-400 glow-amber-400" /> AI Insights</h5>
            {insights.length > 0 ? (
              <ul className="space-y-2.5">
                {insights.map((insight, idx) => (
                  <li key={idx} className="text-base text-slate-200 flex items-start p-3 bg-slate-800 border border-slate-700 rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:border-slate-600">
                    <ArrowRight size={16} className="text-amber-500 mr-2.5 mt-1 flex-shrink-0" /> {insight || 'N/A'}
                  </li>
                ))}
              </ul>
            ) : <div className="text-base text-slate-500 italic p-3 bg-slate-800 border border-slate-700 rounded-md">No insights provided for this agent.</div>}
          </div>
           <div className="mt-4 pt-4 border-t border-slate-700">
             <p className="text-sm text-slate-400 italic flex items-center">
               <Zap size={16} className={`mr-2 ${styles.accentColor === 'slate' ? 'text-slate-500' : `text-${styles.accentColor}-500 animate-pulse`}`} />
               {agentName} is actively monitoring and processing information related to {section === 'overview' ? 'overall care coordination' : String(section)}...
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

const PriorAuthCard = ({ item, onUpdateStatus }: { item: PriorAuthItem; onUpdateStatus?: (id: string, newStatus: string) => void }) => {
  const paId = item?.pa_n_id || 'N/A';
  const paItemName = item?.pa_n_item_name || 'N/A';
  const paType = item?.pa_n_type || 'N/A';
  const paStatus = item?.pa_n_status || 'Unknown';
  const paCptCode = item?.pa_n_cpt_code || 'N/A';
  const paDescription = item?.pa_n_description || 'No description provided.';
  const paPosCode = item?.pa_n_pos_code || 'N/A';
  const paUnits = item?.pa_n_units || 'N/A';
  const paDatesOfService = item?.pa_n_dates_of_service || 'N/A';
  const paCriteriaMetDetails = item?.pa_n_criteria_met_details || 'No criteria details provided.';
  const paEstResponse = item?.pa_n_estimated_response || 'N/A';
  const paApprovalConfidence = parseFloat(item?.pa_n_approval_confidence || '0') * 100 || 0;

  // Simple regex to find citations like [S1] or [S1, S2]
  const renderCriteriaDetails = (details: string) => {
    const parts = details.split(/(\[[Ss]\d+(?:,\s*[Ss]\d+)*\])/g);
    return parts.map((part, index) => {
      if (/^\[[Ss]\d+(?:,\s*[Ss]\d+)*\]$/.test(part)) {
        return <strong key={index} className="text-sky-400 font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="border border-slate-700 rounded-xl shadow-xl mb-6 bg-slate-900 overflow-hidden hover:shadow-2xl transition-shadow duration-300 hover:border-slate-600">
      <div className="border-b border-slate-700 p-5 flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2.5">
            <StatusBadge status={paStatus} />
            <span className="ml-3 text-xs font-medium text-slate-500 tracking-wider">ID: {paId}</span>
          </div>
          <h4 className="font-semibold text-slate-100 text-xl">{paItemName}</h4>
          <div className="text-sm text-slate-400 mt-1">
            Type: {paType}
          </div>
        </div>
        <div className="text-center flex-shrink-0 ml-5 p-3.5 bg-slate-800 rounded-lg border border-sky-700 shadow-lg glow-sky-500">
          <div className="text-3xl font-bold text-sky-400">{paApprovalConfidence.toFixed(0)}%</div>
          <div className="text-xs text-slate-300 mt-0.5">Approval Conf.</div>
        </div>
      </div>
      
      <div className="p-5 bg-slate-900 space-y-3">
        <div>
          <strong className="text-sm text-slate-300 block">Description:</strong>
          <p className="text-slate-200 text-base">{paDescription}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><strong className="text-slate-300">CPT/HCPCS:</strong> <span className="text-slate-200">{paCptCode}</span></div>
          <div><strong className="text-slate-300">POS Code:</strong> <span className="text-slate-200">{paPosCode}</span></div>
          <div><strong className="text-slate-300">Units:</strong> <span className="text-slate-200">{paUnits}</span></div>
          <div><strong className="text-slate-300">Dates of Service:</strong> <span className="text-slate-200">{paDatesOfService}</span></div>
        </div>
        <div>
          <strong className="text-sm text-slate-300 block mb-1">Criteria Met & How:</strong>
          <div className="text-slate-200 text-base bg-slate-800 p-3 rounded-md border border-slate-700">
            {renderCriteriaDetails(paCriteriaMetDetails)}
          </div>
        </div>
      </div>

      { (paStatus.toLowerCase() === 'in progress' || paStatus.toLowerCase() === 'pending submission' || paStatus.toLowerCase() === 'requires submission') && paEstResponse && (
          <div className="p-3.5 bg-slate-800 border-t border-amber-700 flex justify-between items-center text-xs text-amber-300 font-medium glow-amber-500">
          <span><Clock size={14} className="inline mr-1.5 animate-pulse" />Est. Response: {paEstResponse}</span>
        </div>
      )}
      {onUpdateStatus && (
        <div className="p-4 bg-slate-950 border-t border-slate-700 space-x-3 text-right">
          {paStatus.toLowerCase() === 'pending submission' && (
            <button onClick={() => onUpdateStatus(paId, 'In Progress')} className="text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center float-left glow-sky-500 border border-sky-400">
              <Send size={14} className="mr-1.5"/> submit
            </button>
          )}
          {paStatus.toLowerCase() === 'in progress' && (
            <></>
          )}
          {(paStatus.toLowerCase() === 'approved' || paStatus.toLowerCase() === 'denied') && (
              <button onClick={() => onUpdateStatus(paId, 'Pending Submission')} className="text-sm bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center float-left border border-slate-400">
              <Repeat size={14} className="mr-1.5"/> Reset Simulation
            </button>
          )}
           <div className="clear-both"></div>
        </div>
      )}
    </div>
  );
};

const SourceCard = ({ source }: { source: SourceData }) => {
      const sourceId = source?.source_n_id || 'N/A';
      const sourceTitle = source?.source_n_title || 'N/A';
      const sourceType = source?.source_n_type || 'Unknown';
      const sourceUrl = source?.source_n_url;
      const sourceSnippet = source?.source_n_snippet || 'N/A';
      const sourceRetrievalDate = source?.source_n_retrieval_date || 'N/A';
      const sourceAgent = source?.source_n_agent_source || 'N/A';

      const getSourceIcon = (type: string) => {
          type = (type || '').toLowerCase();
          if (type.includes('guideline')) return <BookOpen size={20} className="text-sky-400 mr-3 flex-shrink-0" />;
          if (type.includes('article')) return <FileText size={20} className="text-purple-400 mr-3 flex-shrink-0" />;
          if (type.includes('ehr') || type.includes('note')) return <Clipboard size={20} className="text-lime-400 mr-3 flex-shrink-0" />;
          if (type.includes('patient')) return <User size={20} className="text-pink-400 mr-3 flex-shrink-0" />;
          if (type.includes('insurance')) return <Shield size={20} className="text-indigo-400 mr-3 flex-shrink-0" />;
          if (type.includes('web source')) return <Link size={20} className="text-cyan-400 mr-3 flex-shrink-0" />;
          return <Link size={20} className="text-slate-500 mr-3 flex-shrink-0" />;
      };

      return (
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:border-slate-600">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center min-w-0">
                      {getSourceIcon(sourceType)}
                      <h4 className="font-semibold text-slate-100 text-lg truncate" title={sourceTitle}>{sourceTitle}</h4>
                  </div>
                  <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md font-medium flex-shrink-0 ml-3 border border-slate-700">{sourceType}</span>
              </div>
              <p className="text-base text-slate-300 mb-4 italic leading-relaxed px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">"{sourceSnippet}"</p>
              <div className="flex flex-wrap justify-between items-center text-sm text-slate-400 border-t border-slate-700 pt-3 gap-3">
                  <span className="text-xs">Retrieved: {sourceRetrievalDate}</span>
                  {sourceUrl && sourceUrl !== "#" && (
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline font-medium flex items-center transition-colors text-xs">
                          View Source <Link size={12} className="ml-1.5" />
                      </a>
                  )}
                   <span className="font-medium text-xs">Cited by: {sourceAgent}</span>
              </div>
          </div>
      );
};

const NotificationPopup = ({ title, message, detail1, detail2, isVisible, onClose }: { title: string; message: string; detail1?: string; detail2?: string; isVisible: boolean; onClose: () => void; }) => {
   if (!isVisible) return null;

   return (
     <div className="fixed top-24 right-5 bg-slate-900/80 backdrop-blur-lg rounded-xl shadow-2xl border border-sky-500 p-5 w-96 z-50 animate-fade-in-down transition-all duration-300 glow-sky-500">
       <div className="flex items-start">
         <div className="bg-sky-600 rounded-full p-2 mr-3.5 flex-shrink-0 border border-sky-400 shadow-lg glow-sky-500">
           <AlertTriangle size={22} className="text-white" />
         </div>
         <div className="flex-grow">
           <h4 className="font-bold text-lg text-slate-100">{title}</h4>
           <p className="text-sm text-slate-300 my-1.5 leading-relaxed">{message}</p>
           <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-700">
             {detail1 && <span className="text-xs text-red-300 font-semibold bg-slate-800 border border-red-700 px-2 py-1 rounded shadow-sm glow-red-500">{detail1}</span>}
             {detail2 && (
                 <span className="text-xs text-lime-300 font-semibold bg-slate-800 border border-lime-700 px-2 py-1 rounded shadow-sm flex items-center glow-lime-500">
                   <CheckCircle size={14} className="mr-1.5 text-lime-400" /> {detail2}
                 </span>
             )}
           </div>
         </div>
         <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-700" title="Close">
           <X size={18} />
         </button>
       </div>
     </div>
   );
}

const SkeletonLoader = () => (
  <div className="min-h-screen bg-slate-950 py-8 flex items-center justify-center animate-pulse">
    <div className="max-w-7xl mx-auto px-4 w-full">
      <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-slate-800 rounded-xl mr-4"></div>
            <div>
              <div className="h-8 w-48 bg-slate-800 rounded mb-2"></div>
              <div className="h-4 w-64 bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-slate-800 rounded-lg"></div>
            <div className="h-10 w-28 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl mb-6">
          <div className="h-8 w-1/3 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
        </div>
        <div className="flex space-x-2 p-4 border-b border-slate-700 mb-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-32 bg-slate-800 rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>)}
        </div>
        <div className="mt-8">
          <div className="h-6 w-40 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-800 rounded-lg"></div>
            <div className="h-12 bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component Render ---
const CarePlanTemplate = ({
  data: initialData,
  enableSimulations = true,
  sectionReasoning,
  sectionUiStates,
  onSectionToggle,
  expandedSectionsFromParent,
  initialTab, // Destructure initialTab
  initialReasoningContent, // Destructure initialReasoningContent
  initialGrokResponse // Destructure initialGrokResponse
}: CarePlanTemplateProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Use initialTab if provided, otherwise default to 'overview'
  const [activeTab, setActiveTab] = useState<ActiveTabType>(initialTab || 'overview'); // Default to 'overview'
  const [currentData, setCurrentData] = useState<CarePlanJsonData | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [simulatedPatientInfo, setSimulatedPatientInfo] = useState<PatientData | undefined>(undefined);
  const [simulatedClinicalInfo, setSimulatedClinicalInfo] = useState<ClinicalData | undefined>(undefined);
  const [simulatedPaItems, setSimulatedPaItems] = useState<PriorAuthItem[]>([]);
  const [simulatedAdpieData, setSimulatedAdpieData] = useState<Partial<CarePlanJsonData>>({});

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [showPriorAuth, setShowPriorAuth] = useState(false);
  const [kanbanEpics, setKanbanEpics] = useState<KanbanEpic[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<KanbanTask[]>([]);
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [taskFilter, setTaskFilter] = useState<'all' | 'intervention' | 'assessment' | 'evaluation'>('all');
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({ title: "", message: "", detail1: "", detail2: "" });
  
  const [activeTabKey, setActiveTabKey] = useState(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize expandedSections
  useEffect(() => {
    if (expandedSectionsFromParent) {
      setExpandedSections(expandedSectionsFromParent);
    } else if (sectionUiStates) {
      const newExpanded: Record<string, boolean> = {};
      const currentNursingDiagnoses = currentData?.nursingDiagnoses || [];
      Object.entries(sectionUiStates).forEach(([sectionId, state]: [string, { isReady: boolean; displayName: string; }]) => {
        if (state.isReady) {
          if (sectionId === "assessment") newExpanded["assessment"] = true;
          else if (sectionId === "diagnosis_goals" && currentNursingDiagnoses.length > 0) {
            currentNursingDiagnoses.forEach((_, dxIdx) => newExpanded[`diagnosis_${dxIdx}`] = true);
          } else if (sectionId === "interventions" && currentNursingDiagnoses.length > 0) {
            currentNursingDiagnoses.forEach((_, dxIdx) => newExpanded[`impl_dx_${dxIdx}`] = true);
          } else if (sectionId === "evaluation" && currentNursingDiagnoses.length > 0) {
            currentNursingDiagnoses.forEach((_, dxIdx) => newExpanded[`evaluation_dx_${dxIdx}`] = true);
          } else if (sectionId === "summary_coordination_sources") {
            newExpanded["summary_admin_main"] = true;
            newExpanded["interdisciplinaryPlan"] = true;
            newExpanded["overall_summary_next_steps"] = true;
            newExpanded["notifications_display"] = true;
            newExpanded["sources"] = true; 
          }
          // Prior Authorizations panel is controlled by `showPriorAuth`, not this effect.
        }
      });
      setExpandedSections(prev => ({ ...prev, ...newExpanded }));
    }
  }, [sectionUiStates, expandedSectionsFromParent, currentData?.nursingDiagnoses]);

  // Handler for sending chat messages
  const handleSendChatMessage = (messageContent: string) => {
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `Ron AI received: "${messageContent}". This is a simulated response. I can help you navigate the care plan or answer questions about the patient.`,
        timestamp: new Date().toISOString(),
        context: {
          sources: [
            { title: "Patient Chart Summary", content: "Relevant summary from patient chart...", url: "#" },
            { title: "CHF Guidelines", content: "Latest CHF management guidelines...", url: "#" }
          ]
        }
      };
      setChatMessages(prevMessages => [...prevMessages, assistantResponse]);
    }, 1200);
  };

  const initializeData = useCallback((sourceData: CarePlanJsonData | null) => {
    if (sourceData) {
      setCurrentData(sourceData);
      setSimulatedPatientInfo(JSON.parse(JSON.stringify(sourceData.patientData || {})));
      setSimulatedClinicalInfo(JSON.parse(JSON.stringify(sourceData.clinicalData || {})));
      setSimulatedPaItems(JSON.parse(JSON.stringify(sourceData.priorAuthItems || [])));
      const dataToSimulate = { ...sourceData, next_steps: sourceData.next_steps || [] };
      setSimulatedAdpieData(JSON.parse(JSON.stringify(dataToSimulate)));
      setIsLoading(false);
    } else if (enableSimulations) {
      const mockData = generateMockCarePlanData();
      setCurrentData(mockData);
      setSimulatedPatientInfo(JSON.parse(JSON.stringify(mockData.patientData || {})));
      setSimulatedClinicalInfo(JSON.parse(JSON.stringify(mockData.clinicalData || {})));
      setSimulatedPaItems(JSON.parse(JSON.stringify(mockData.priorAuthItems || [])));
      setSimulatedAdpieData(JSON.parse(JSON.stringify(mockData || {})));
      setIsLoading(false);
      triggerNotification("Demo Mode Active", "Displaying mock patient data.", "Explore freely!", "All features simulated");
    } else {
      setIsLoading(false);
    }
  }, [enableSimulations]); // Removed triggerNotification from dependencies as it's stable

  useEffect(() => {
    initializeData(initialData);
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, [initialData, initializeData]);

  // Map CarePlanJsonData to CarePlanDataForKanban format
  const mapToKanbanFormat = useCallback((data: CarePlanJsonData) => {
    if (!data.nursingDiagnoses) return data as unknown as CarePlanDataForKanban;

    // Create a new object that matches CarePlanDataForKanban structure
    const mappedData: CarePlanDataForKanban = {
      assessment_subjective_chief_complaint: data.assessment_subjective_chief_complaint,
      assessment_subjective_hpi: data.assessment_subjective_hpi,
      assessment_objective_vitals_summary: data.assessment_objective_vitals_summary,
      assessment_objective_physical_exam: data.assessment_objective_physical_exam,
      assessment_objective_diagnostics: data.assessment_objective_diagnostics,
    };
    
    // Process evaluations from goals
    const evaluations: CarePlanEvaluation[] = [];
    data.nursingDiagnoses?.forEach(diagnosis => {
      diagnosis.goals.forEach(goal => {
        // Extract evaluation data if available
        if (goal.evaluation) {
          evaluations.push({
            evaluation_goal_description_ref: goal.goal_description,
            evaluation_date: goal.evaluation.evaluationTargetDate,
            evaluation_status: goal.evaluation.evaluationStatus as any,
            evaluation_evidence: goal.evaluation.evaluationText,
            evaluation_revision: '', // Default empty if not available
            evaluation_rationale: goal.evaluation.evaluationMethod
          });
        }
      });
    });
    mappedData.evaluations = evaluations;
    
    // Transform nursing diagnoses
    mappedData.nursingDiagnoses = data.nursingDiagnoses.map(diagnosis => {
      // Extract all interventions from goals
      const allInterventions: CarePlanIntervention[] = diagnosis.goals.flatMap(goal => 
        (goal.interventions || []).map(intervention => ({
          intervention_action: intervention.interventionText,
          intervention_rationale: intervention.rationale,
          intervention_is_pending: intervention.interventionType === 'general' ? false : true
        }))
      );

      // Map goals to match CarePlanGoal structure (without interventions)
      const mappedGoals: CarePlanGoal[] = diagnosis.goals.map(goal => ({
        goal_description: goal.goal_description,
        goal_target_date: goal.goal_target_date,
        goal_outcomes: goal.goal_outcomes,
        goal_rationale: goal.goal_rationale
      }));

      // Return transformed diagnosis with interventions at the diagnosis level
      return {
        diagnosis_nanda: diagnosis.diagnosis_nanda,
        diagnosis_related_to: diagnosis.diagnosis_related_to,
        diagnosis_evidence: diagnosis.diagnosis_evidence,
        diagnosis_is_risk: diagnosis.diagnosis_is_risk,
        diagnosis_risk_factors: diagnosis.diagnosis_risk_factors,
        goals: mappedGoals,
        interventions: allInterventions
      } as NursingDiagnosis;
    });

    return mappedData;
  }, []);


  // Generate Kanban tasks and epics
  useEffect(() => {
    if (currentData) {
      // Transform data to match expected format
      const kanbanData = mapToKanbanFormat(currentData);
      
      const { epics, tasks } = generateKanbanData(kanbanData);
      setKanbanEpics(epics);
      setKanbanTasks(tasks);
      setFilteredTasks(tasks);
      if (epics.length > 0) {
        setExpandedEpics({ [epics[0].id]: true });
      }
    }
  }, [currentData, mapToKanbanFormat]);

  // Filter Kanban tasks
  const filterKanbanTasks = (filterType: 'all' | 'intervention' | 'assessment' | 'evaluation') => {
    setTaskFilter(filterType);
    if (filterType === 'all') {
      setFilteredTasks(kanbanTasks);
    } else {
      setFilteredTasks(kanbanTasks.filter(task => task.type === filterType));
    }
  };

  // Handle task status updates
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!enableSimulations) return;
    setKanbanTasks(prevTasks => {
      const updatedTasks = updateTask(prevTasks, taskId, newStatus);
      setFilteredTasks(updatedTasks.filter(task => taskFilter === 'all' ? true : task.type === taskFilter));
      return updatedTasks;
    });
    const task = kanbanTasks.find(t => t.id === taskId);
    if (task) {
      triggerNotification(
        `Task ${newStatus === 'completed' ? 'Completed' : 'Updated'} (Simulated)`,
        `Task "${task.title}" is now ${newStatus}.`,
        `Type: ${task.type}`, `Priority: ${task.priority}`
      );
    }
  };

  // Assign task to an agent/provider
  const assignTaskToAgent = (taskId: string, assignee: string) => {
    if (!enableSimulations) return;
    setKanbanTasks(prevTasks => {
      const updatedTasks = assignTask(prevTasks, taskId, assignee);
      setFilteredTasks(updatedTasks.filter(task => taskFilter === 'all' ? true : task.type === taskFilter));
      return updatedTasks;
    });
    const task = kanbanTasks.find(t => t.id === taskId);
    if (task) {
      triggerNotification(
        "Task Assigned (Simulated)",
        `Task "${task.title}" assigned to ${assignee}.`,
        "Status: In Progress", `${task.type} task`
      );
    }
  };

  const handleUpdatePAStatus = (id: string, newStatus: string) => {
    if (!enableSimulations) return;
    setSimulatedPaItems(prevItems => prevItems.map(item => {
      if (item.pa_n_id === id) { // Use pa_n_id for matching
        const updatedItem = { ...item, pa_n_status: newStatus }; // Use pa_n_status
        const today = new Date().toISOString().split('T')[0];
        if (newStatus === 'In Progress') {
          updatedItem.pa_n_submitted_date = today; // Use pa_n_submitted_date
          triggerNotification("PA Submitted (Simulated)", `Prior auth for ${item.pa_n_item_name} submitted.`, "Status: In Progress", `ID: ${item.pa_n_id}`);
        } else if (newStatus === 'Approved') {
          updatedItem.pa_n_approved_date = today; // Use pa_n_approved_date
          updatedItem.pa_n_expiration_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year, use pa_n_expiration_date
          triggerNotification("PA Approved (Simulated)", `Prior auth for ${item.pa_n_item_name} approved!`, "Status: Approved", `Expires: ${updatedItem.pa_n_expiration_date}`);
        } else if (newStatus === 'Denied') {
          triggerNotification("PA Denied (Simulated)", `Prior auth for ${item.pa_n_item_name} denied.`, "Status: Denied", "Review criteria");
        } else if (newStatus === 'Pending Submission') {
          updatedItem.pa_n_submitted_date = undefined;
          updatedItem.pa_n_approved_date = undefined;
          updatedItem.pa_n_expiration_date = undefined;
          triggerNotification("PA Reset (Simulated)", `Prior auth for ${item.pa_n_item_name} reset.`, "Status: Pending Submission", `ID: ${item.pa_n_id}`);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAdministerMedication = (medName: string | undefined) => {
    if (!enableSimulations || !medName) return;
    setSimulatedClinicalInfo(prevInfo => {
      if (!prevInfo || !prevInfo.medications) return prevInfo;
      return {
        ...prevInfo,
        medications: prevInfo.medications.map(med => 
          med.med_n_name === medName && (med.med_n_status === 'New Order' || med.med_n_status === 'Pending Submission')
            ? { ...med, med_n_status: 'Active' } : med
        )
      };
    });
    triggerNotification("Medication Status Update (Simulated)", `${medName} is now 'Active'.`, "Action: Administered", "Monitor response");
  };
  
  const [isRefreshingVitals, setIsRefreshingVitals] = useState(false);
  const handleRefreshVitals = () => {
    if (!enableSimulations) return;
    setIsRefreshingVitals(true);
    setTimeout(() => {
      setSimulatedPatientInfo(prevInfo => {
        if (!prevInfo || !prevInfo.vitalSigns) return prevInfo;
        const newVitals = { ...prevInfo.vitalSigns };
        newVitals.vital_bp = `${110 + Math.floor(Math.random()*20)}/${70 + Math.floor(Math.random()*15)} mmHg`;
        newVitals.vital_pulse = `${65 + Math.floor(Math.random()*20)} bpm`;
        newVitals.vital_o2sat = `${95 + Math.floor(Math.random()*4)}%`;
        return { ...prevInfo, vitalSigns: newVitals };
      });
      setIsRefreshingVitals(false);
      triggerNotification("Vitals Updated (Simulated)", "New vital signs recorded.", "BP, Pulse, O2 Sat refreshed", "Check Overview");
    }, 1500);
  };

  const triggerNotification = (title: string, message: string, detail1: string, detail2: string) => {
    setNotificationContent({ title, message, detail1, detail2 });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 7000);
  };

  const toggleSection = (sectionKey: string) => setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  
  const toggleAgentExpansion = (agentName: string) => {
    const key = agentName || `unknown_agent_${Math.random()}`;
    setExpandedAgents(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const togglePriorAuth = () => setShowPriorAuth(!showPriorAuth);

  const patientInfo = simulatedPatientInfo || currentData?.patientData || {};
  const clinicalInfo = simulatedClinicalInfo || currentData?.clinicalData || {};
  const agents = currentData?.aiAgents || [];
  const paItems = simulatedPaItems.length > 0 ? simulatedPaItems : currentData?.priorAuthItems || [];
  const sources = currentData?.sourcesData || [];
  const adpieData = Object.keys(simulatedAdpieData).length > 1 ? simulatedAdpieData : currentData || { next_steps: [] };
  
  const nursingDiagnoses = adpieData?.nursingDiagnoses || [];
  const recommendedAssessments = adpieData?.recommendedAssessmentsList || [];
  const interdisciplinaryPlan = adpieData?.interdisciplinaryPlan || [];
  const nextSteps = adpieData?.next_steps || [];

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && currentData) {
      console.log("[CarePlanTemplate] Current data:", JSON.parse(JSON.stringify(currentData)));
    }
  }, [currentData]);

  if (isLoading) return <SkeletonLoader />;

  if (!currentData && !enableSimulations) {
      return (
        <div className="min-h-screen bg-slate-950 py-12 flex items-center justify-center">
          <div className="bg-slate-900 p-10 rounded-xl shadow-2xl border border-slate-700 text-center">
            <Archive size={48} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">No Care Plan Data</h2>
            <p className="text-slate-400">Please provide data to display the care plan.</p>
          </div>
        </div>
      );
  }
  
  const handleTabChange = (tabName: ActiveTabType, label: string) => {
    setActiveTab(tabName);
    setActiveTabKey(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    if (process.env.NODE_ENV === 'development') console.log(`Switched to tab: ${label}`);
  };

  const pendingPaCount = paItems.filter(i => i.status?.toLowerCase() === 'in progress' || i.status?.toLowerCase() === 'pending submission').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black py-8 antialiased text-slate-200">
      <NotificationPopup 
        {...notificationContent}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl text-white mb-10 border border-slate-800 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="relative flex justify-between items-center flex-wrap gap-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl shadow-xl border border-sky-500/50">
                  <Shield size={36} className="text-sky-400" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Ron AI
                </h1>
                <p className="text-slate-400 text-lg mt-1 font-medium">
                  Intelligent Care Plan Management System
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {enableSimulations && (
                <button
                  onClick={() => triggerNotification("Sample System Alert", "This is a test notification.", "Category: System", "Severity: Info")}
                  className="group relative px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-sky-500/50 transition-all duration-300 shadow-lg hover:shadow-sky-500/20"
                  title="Trigger Sample Notification"
                >
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-sky-400 group-hover:animate-pulse" />
                    <span className="text-slate-300 group-hover:text-slate-100">Test Notify</span>
                  </div>
                </button>
              )}
              
              <button
                className={`group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  showPriorAuth 
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border border-sky-500 shadow-lg shadow-sky-500/30' 
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-sky-500/50 shadow-lg hover:shadow-sky-500/20'
                }`}
                onClick={togglePriorAuth} 
                title="Toggle Prior Authorizations Panel"
              >
                <div className="flex items-center gap-2">
                  <Shield size={16} className={showPriorAuth ? 'text-white' : 'text-sky-400'} />
                  <span>Prior Auth</span>
                  {pendingPaCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse border-2 border-slate-900">
                      {pendingPaCount}
                    </span>
                  )}
                </div>
              </button>
              
              <button 
                onClick={() => console.log("Communicate action triggered")} 
                className="group relative px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-sky-500/50 transition-all duration-300 shadow-lg hover:shadow-sky-500/20"
                title="Communicate with Team"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-sky-400 group-hover:animate-pulse" />
                  <span className="text-slate-300 group-hover:text-slate-100">Communicate</span>
                </div>
              </button>
              
              <button 
                onClick={() => console.log("Export action triggered. Data:", currentData)} 
                className="group relative px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20"
                title="Export Care Plan"
              >
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-emerald-400 group-hover:animate-bounce" />
                  <span className="text-slate-300 group-hover:text-slate-100">Export</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className={`w-full ${showPriorAuth ? 'lg:w-3/5 xl:w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700 mb-6">
              {/* Patient Header */}
              <div className="bg-slate-800 px-6 py-5 text-white border-b border-slate-700">
                <div className="flex justify-between items-start flex-wrap gap-y-3">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-100">{patientInfo.patient_full_name || <span className="italic text-slate-400">N/A</span>}</h2>
                    <p className="text-slate-300 text-sm mt-1">
                      {patientInfo.patient_age || 'N/A'} y.o. {patientInfo.patient_gender || 'N/A'} • MRN: {patientInfo.patient_mrn || 'N/A'} • Admitted: {patientInfo.patient_admission_date || 'N/A'}
                    </p>
                    {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                        <span className="text-xs text-red-300 mt-2 bg-slate-900 border border-red-700 glow-red-500 px-2.5 py-1 rounded-full font-medium inline-flex items-center">
                            <AlertTriangle size={12} className="inline mr-1.5" /> Allergies: {patientInfo.allergies.join(', ')}
                        </span>
                    )}
                  </div>
                  <div className="bg-slate-900 px-4 py-3 rounded-xl text-right max-w-sm shadow-lg border border-slate-700">
                    <div className="text-sm text-slate-400 mb-1">Primary Diagnosis</div>
                    <div className="font-semibold text-xl text-slate-100">{clinicalInfo.primary_diagnosis_text || <span className="italic text-slate-400">N/A</span>}</div>
                  </div>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="p-4 border-b border-slate-700 bg-slate-900">
                  <div className="flex space-x-1 overflow-x-auto pb-1 no-scrollbar">
                    <TabButton active={activeTab === 'chat'} icon={<MessageSquare size={20} />} label="Chat with Ron AI" onClick={() => handleTabChange('chat', 'Chat with Ron AI')} />
                    <TabButton active={activeTab === 'kanban'} icon={<BarChart2 size={20} />} label="Task Board" onClick={() => handleTabChange('kanban', 'Task Board')} />
                    <TabButton active={activeTab === 'overview'} icon={<Clipboard size={20} />} label="Overview" onClick={() => handleTabChange('overview', 'Overview')} />
                    <TabButton active={activeTab === 'assessment'} icon={<FileCheck size={20} />} label="Assessment" onClick={() => handleTabChange('assessment', 'Assessment')} />
                    <TabButton active={activeTab === 'diagnosis'} icon={<AlertCircle size={20} />} label="Diagnosis & Goals" onClick={() => handleTabChange('diagnosis', 'Diagnosis & Goals')} />
                    <TabButton active={activeTab === 'implementation'} icon={<ListChecks size={20} />} label="Interventions" onClick={() => handleTabChange('implementation', 'Interventions')} />
                    <TabButton active={activeTab === 'evaluation'} icon={<Star size={20} />} label="Evaluation" onClick={() => handleTabChange('evaluation', 'Evaluation')} />
                    <TabButton active={activeTab === 'summary_coordination_sources'} icon={<FileText size={20} />} label="Summary & Admin" onClick={() => handleTabChange('summary_coordination_sources', 'Summary & Admin')} />
                    <TabButton active={activeTab === 'sources'} icon={<Link size={20} />} label="Sources" onClick={() => handleTabChange('sources', 'Sources')} />
                  </div>
              </div>

              {/* Tab Content */}
              <div className={`${activeTab === 'chat' ? 'p-0' : 'p-6 md:p-8'} bg-slate-950 min-h-[700px] tracking-wide leading-relaxed`} key={activeTabKey}>
                {activeTab === 'chat' && currentData && (
                  <div className={`${isMounted ? 'animate-fade-in-up' : 'opacity-0'} h-full`}>
                    {/* Use GrokChatHandler instead of SonarChatHandler */}
                    <GrokChatHandler 
                      carePlanData={{
                      ...currentData,
                      patientData: currentData.patientData ? {
                        ...currentData.patientData,
                        patient_age: typeof currentData.patientData.patient_age === 'number'
                          ? String(currentData.patientData.patient_age)
                          : currentData.patientData.patient_age,
                      } : undefined,
                    }}
                      initialResponse={initialGrokResponse}
                      initialReasoning={initialReasoningContent || undefined}
                    />
                  </div>
                )}
                {activeTab === 'kanban' && (
                  <div className={`${isMounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <KanbanBoard 
                      tasks={filteredTasks}
                      epics={kanbanEpics}
                      enableSimulations={enableSimulations}
                      onTaskStatusChange={updateTaskStatus}
                      onTaskAssign={assignTaskToAgent}
                    />
                  </div>
                )}
                
                {activeTab === 'overview' && (
                  <div className={`space-y-8 ${isMounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <InfoCard icon={<User size={22} />} label="Primary Provider" value={patientInfo.patient_primary_provider} color="sky" />
                      <InfoCard icon={<Shield size={22} />} label="Insurance Plan" value={patientInfo.patient_insurance_plan} color="purple" />
                      <InfoCard icon={<Activity size={22} />} label="Severity / NYHA Class" value={patientInfo.nyha_class_description} color="amber" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-slate-100">Vital Signs (Latest)</h3>
                        {enableSimulations && (
                          <button 
                            onClick={handleRefreshVitals} 
                            disabled={isRefreshingVitals}
                            className="text-sm bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center disabled:opacity-60 glow-teal-500 border border-teal-400"
                          >
                            {isRefreshingVitals ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                            {isRefreshingVitals ? 'Refreshing...' : 'Refresh Vitals'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {patientInfo.vitalSigns && Object.keys(patientInfo.vitalSigns).length > 0
                          ? Object.entries(patientInfo.vitalSigns).map(([key, value]) => (
                          <div key={key} className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-sky-600">
                            <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">{key.replace('vital_', '').replace('_', ' ') === 'o2sat' ? 'O₂ Sat' : key.replace('vital_', '').replace('_', ' ')}</div>
                            <div className="font-semibold text-slate-100 text-xl">{value || <span className="italic text-slate-500">N/A</span>}</div>
                          </div> ))
                          : <div className="col-span-full text-center text-slate-500 py-5 italic">No vital signs data available.</div>
                        }
                      </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4">Medications</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 styled-scrollbar-dark">
                                {clinicalInfo.medications && clinicalInfo.medications.length > 0 ? clinicalInfo.medications.map((med, idx) => (
                                    <div key={`med-${idx}`} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-purple-600">
                                        <div className="flex-grow min-w-0 mr-3">
                                            <div className="font-semibold text-slate-100 mb-1 text-lg">{med.med_n_name || <span className="italic text-slate-400">N/A</span>} <span className="text-base text-slate-300 font-normal">{med.med_n_dosage || ''}</span></div>
                                            <div className="text-xs text-slate-400">{med.med_n_route || 'N/A'} • {med.med_n_frequency || 'N/A'}</div>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-3 space-x-2.5">
                                            {(typeof med.med_n_pa_required === 'string' ? med.med_n_pa_required.toLowerCase() === 'true' : !!med.med_n_pa_required) && (
                                                <span className="bg-slate-800 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-700 glow-sky-500" title="Prior Authorization Required">PA</span>
                                            )}
                                            <StatusBadge status={med.med_n_status || ''} />
                                            {enableSimulations && (med.med_n_status === 'New Order' || med.med_n_status === 'Pending Submission') && 
                                                <button onClick={() => handleAdministerMedication(med.med_n_name)} className="p-1.5 bg-lime-600 hover:bg-lime-500 rounded-full text-white transition-colors shadow-md glow-lime-500 border border-lime-400" title="Simulate Administer"><PlayCircle size={16}/></button>
                                            }
                                        </div>
                                    </div>
                                )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center border border-slate-700">No medications listed.</div>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4">Treatments & Diagnostics</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 styled-scrollbar-dark">
                                {clinicalInfo.treatments && clinicalInfo.treatments.length > 0 ? clinicalInfo.treatments.map((treatment, idx) => (
                                    <div key={`treat-${idx}`} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-teal-600">
                                        <div className="min-w-0 mr-3">
                                            <div className="font-semibold text-slate-100 truncate text-lg" title={treatment.treatment_n_name}>{treatment.treatment_n_name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 truncate" title={treatment.treatment_n_details || treatment.treatment_n_date || ''}>
                                                {treatment.treatment_n_details ? `${treatment.treatment_n_details} ` : ''}
                                                {treatment.treatment_n_date ? `(${treatment.treatment_n_date})` : ''}
                                                {(!treatment.treatment_n_details && !treatment.treatment_n_date) && 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-3 space-x-2.5">
                                            {(typeof treatment.treatment_n_pa_required === 'string' ? treatment.treatment_n_pa_required.toLowerCase() === 'true' : !!treatment.treatment_n_pa_required) && (
                                                <span className="bg-slate-800 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-700 glow-sky-500" title="Prior Authorization Required">PA</span>
                                            )}
                                            <StatusBadge status={treatment.treatment_n_status || ''} />
                                        </div>
                                    </div>
                                ))
                              : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center border border-slate-700">No treatments listed.</div>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-100 mb-5">AI Agent Insights (Overview)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {agents.length > 0 ? agents.map((agent, idx) => (
                            <AgentCard key={`agent-overview-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="overview" />
                          )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center md:col-span-2 xl:col-span-3 border border-slate-700">No AI agent contributions available.</div>}
                        </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'assessment' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                      <SectionHeader 
                        title="Assessment Details" 
                        icon={<FileCheck size={20}/>}
                        expanded={!!expandedSections.assessment} 
                        onToggle={() => toggleSection('assessment')} 
                      />
                      {expandedSections.assessment && (
                        <div className="p-6 md:p-8 space-y-8 bg-slate-950">
                          {sectionReasoning?.assessment && (
                            <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                              <ReasoningDisplay
                                initialMarkdownContent={sectionReasoning.assessment.markdownContent}
                                title="Assessment & Plan Reasoning"
                              />
                            </div>
                          )}
                           <div>
                              <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-sky-500 glow-sky-500">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                  <User size={18} className="mr-2.5 text-sky-400" /> Subjective Data
                                </h3>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 shadow-md space-y-3 text-base text-slate-300">
                                <p><strong className="text-slate-100">Chief Complaint:</strong> {adpieData.assessment_subjective_chief_complaint || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">History of Present Illness:</strong> {adpieData.assessment_subjective_hpi || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Patient Goals/Concerns:</strong> {adpieData.assessment_subjective_goals || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Other Subjective Findings:</strong> {adpieData.assessment_subjective_other || <span className="italic text-slate-500">N/A</span>}</p>
                              </div>
                           </div>
                           <div>
                              <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-lime-500 glow-lime-500">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                  <Activity size={18} className="mr-2.5 text-lime-400" /> Objective Data
                                </h3>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 shadow-md space-y-3 text-base text-slate-300">
                                <p><strong className="text-slate-100">Vital Signs Summary:</strong> {adpieData.assessment_objective_vitals_summary || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Physical Exam Findings:</strong> {adpieData.assessment_objective_physical_exam || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Diagnostic Test Results:</strong> {adpieData.assessment_objective_diagnostics || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Medications Reviewed:</strong> {adpieData.assessment_objective_meds_reviewed || <span className="italic text-slate-500">N/A</span>}</p>
                                <p><strong className="text-slate-100">Other Objective Findings:</strong> {adpieData.assessment_objective_other || <span className="italic text-slate-500">N/A</span>}</p>
                              </div>
                           </div>
                           <div>
                              <div className="bg-slate-900 py-3 mb-4 mt-6 rounded-md border-l-4 border-purple-500 glow-purple-500">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                  <ListChecks size={18} className="mr-2.5 text-purple-400" /> Recommended Assessments
                                </h3>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 shadow-md space-y-3 text-base text-slate-300">
                                {recommendedAssessments.length > 0 ? recommendedAssessments.map((recAssessment: RecommendedAssessmentItem, idx: number) => (
                                  <div key={`rec-assess-${idx}`} className="border-b border-slate-700 pb-2.5 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <strong className="text-slate-100">{recAssessment.item}</strong>
                                      <StatusBadge status={recAssessment.status} />
                                    </div>
                                    <p className="text-sm text-slate-400 italic">Rationale: {recAssessment.rationale}</p>
                                  </div>
                                )) : <p className="italic text-slate-500">No recommended assessments listed.</p>}
                              </div>
                           </div>
                           <div className="pt-6 border-t border-slate-700 mt-8">
                              <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-amber-500 glow-amber-500">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                  <Zap size={18} className="mr-2.5 text-amber-400" /> AI Agent Contributions (Assessment)
                                </h3>
                              </div>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                               {agents.length > 0 ? agents.map((agent, idx) => (
                                 <AgentCard key={`agent-assess-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="assessment" />
                               )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center xl:col-span-2 border border-slate-700">No AI agent contributions available.</div>}
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'diagnosis' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`dx-${dxIndex}`} className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                        <SectionHeader 
                          title={`Nursing Diagnosis ${dxIndex + 1}: ${dx.diagnosis_nanda || 'N/A'}`}
                          icon={<AlertCircle size={20}/>} 
                          expanded={!!expandedSections[`diagnosis_${dxIndex}`]}
                          onToggle={() => toggleSection(`diagnosis_${dxIndex}`)} 
                        />
                        {expandedSections[`diagnosis_${dxIndex}`] && (
                          <div className="p-6 md:p-8 space-y-8 bg-slate-950">
                            {dxIndex === 0 && sectionReasoning?.diagnosis_goals && (
                              <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <ReasoningDisplay
                                  initialMarkdownContent={sectionReasoning.diagnosis_goals.markdownContent}
                                  title="Diagnosis Goals Reasoning"
                                />
                              </div>
                            )}
                            <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 shadow-md text-base">
                                <p className="text-slate-300 mb-2.5"><strong className="text-purple-400 glow-purple-500">Related To:</strong> {dx.diagnosis_related_to || <span className="italic text-slate-500">N/A</span>}</p>
                                {dx.diagnosis_is_risk ? (
                                    <div className="mt-2">
                                        <strong className="text-sm text-red-400 glow-red-500 block mb-1">Risk Factors:</strong>
                                        {dx.diagnosis_risk_factors && dx.diagnosis_risk_factors.length > 0 ? (
                                          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                                            {dx.diagnosis_risk_factors.map((factor, i) => <li key={`risk-${dxIndex}-${i}`}>{factor}</li>)}
                                          </ul>
                                        ) : <p className="italic text-slate-500 pl-2">No risk factors listed.</p>}
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <strong className="text-sm text-lime-400 glow-lime-500 block mb-1">As Evidenced By:</strong>
                                        {dx.diagnosis_evidence && dx.diagnosis_evidence.length > 0 ? (
                                          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                                              {dx.diagnosis_evidence.map((ev, i) => <li key={`ev-${dxIndex}-${i}`}>{ev}</li>)}
                                          </ul>
                                        ) : <p className="italic text-slate-500 pl-2">No evidence listed.</p>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-xl text-slate-100 mb-3 flex items-center"><Target size={18} className="mr-2 text-purple-400 glow-purple-500"/>Goals (SMART)</h4>
                                <div className="space-y-4">
                                    {dx.goals && dx.goals.length > 0 ? dx.goals.map((goal, goalIndex) => (
                                        <div key={`goal-${dxIndex}-${goalIndex}`} className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-md">
                                            <div className="font-semibold text-slate-100 mb-1.5 text-lg">Goal {goalIndex + 1}: {goal.goal_description || <span className="italic text-slate-400">N/A</span>}</div>
                                            {goal.goal_rationale && <p className="text-xs text-slate-400 mb-1.5 italic"><strong className="text-slate-300">Rationale:</strong> {goal.goal_rationale}</p>}
                                            <p className="text-sm text-slate-300"><strong>Target Date:</strong> {goal.goal_target_date || <span className="italic text-slate-500">N/A</span>}</p>
                                            <div className="mt-2">
                                                <strong className="text-sm text-slate-200 block mb-1">Outcomes:</strong>
                                                {goal.goal_outcomes && goal.goal_outcomes.length > 0 ? (
                                                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300 pl-2">
                                                    {goal.goal_outcomes.map((outcome, oIdx) => <li key={`outcome-${dxIndex}-${goalIndex}-${oIdx}`}>{outcome}</li>)}
                                                  </ul>
                                                ) : <p className="italic text-slate-500 pl-2 text-sm">No outcomes listed.</p>}
                                            </div>
                                        </div>
                                    )) : <div className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">No goals defined.</div>}
                                </div>
                            </div>
                             <div className="pt-6 border-t border-slate-700">
                                <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-amber-500 glow-amber-500">
                                  <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                    <Zap size={18} className="mr-2.5 text-amber-400" /> AI Agent Contributions (Diagnosis/Goals)
                                  </h3>
                                </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                 {agents.length > 0 ? agents.map((agent, idx) => (
                                   <AgentCard key={`agent-diag-${dxIndex}-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="diagnosis" />
                                 )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center xl:col-span-2 border border-slate-700">No AI agent contributions.</div>}
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-500 italic text-lg">No nursing diagnoses identified.</div>}
                  </div>
                )}

                {activeTab === 'implementation' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`impl-dx-${dxIndex}`} className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                        <SectionHeader 
                          title={`Interventions for Diagnosis: ${dx.diagnosis_nanda || `Diagnosis ${dxIndex + 1}`}`}
                          icon={<ListChecks size={20}/>} 
                          expanded={!!expandedSections[`impl_dx_${dxIndex}`]}
                          onToggle={() => toggleSection(`impl_dx_${dxIndex}`)} 
                        />
                        {expandedSections[`impl_dx_${dxIndex}`] && (
                          <div className="p-6 md:p-8 space-y-6 bg-slate-950">
                            {dxIndex === 0 && sectionReasoning?.interventions && (
                              <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <ReasoningDisplay
                                  initialMarkdownContent={sectionReasoning.interventions.markdownContent}
                                  title="Interventions Reasoning"
                                />
                              </div>
                            )}
                            {(dx.goals && dx.goals.length > 0) ? dx.goals.map((goal, goalIndex) => (
                              <div key={`impl-goal-${dxIndex}-${goalIndex}`} className="mb-5">
                                <h4 className="font-semibold text-xl text-slate-100 mb-2.5 pl-1 border-b border-slate-700 pb-1.5">
                                  Goal {goalIndex + 1}: {goal.goal_description || 'N/A'}
                                </h4>
                                <div className="space-y-3">
                                  {goal.interventions && goal.interventions.length > 0 ? goal.interventions.map((int: InterventionType, intIndex: number) => (
                                    <div key={`int-${dxIndex}-${goalIndex}-${intIndex}`} className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-md">
                                      <div className="flex justify-between items-start mb-1.5">
                                        <span className="font-semibold text-slate-100 text-lg">
                                          Intervention {intIndex + 1}: {int.interventionText || <span className="italic text-slate-400">N/A</span>}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${int.interventionType === 'health_teaching' ? 'bg-slate-800 text-sky-400 border-sky-700 glow-sky-500' : 'bg-slate-800 text-lime-400 border-lime-700 glow-lime-500'}`}>
                                          {int.interventionType ? int.interventionType.replace('_', ' ') : 'general'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-300"><strong className="text-slate-200">Rationale:</strong> {int.rationale || <span className="italic text-slate-500">N/A</span>}</p>
                                    </div>
                                  )) : <div className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">No interventions for this goal.</div>}
                                </div>
                              </div>
                            )) : <div className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">No goals for this diagnosis.</div>}
                            
                            <div className="pt-6 border-t border-slate-700">
                                <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-amber-500 glow-amber-500">
                                  <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                    <Zap size={18} className="mr-2.5 text-amber-400" /> AI Agent Contributions (Interventions)
                                  </h3>
                                </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                 {agents.length > 0 ? agents.map((agent, agentIdx) => (
                                   <AgentCard key={`agent-impl-${dxIndex}-${agentIdx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${agentIdx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${agentIdx}`)} section="implementation" />
                                 )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center xl:col-span-2 border border-slate-700">No AI agent contributions.</div>}
                               </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-500 italic text-lg">No nursing diagnoses to display interventions for.</div>}
                  </div>
                )}
                
                {activeTab === 'evaluation' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`eval-dx-${dxIndex}`} className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                        <SectionHeader 
                          title={`Evaluation for Diagnosis: ${dx.diagnosis_nanda || `Diagnosis ${dxIndex + 1}`}`}
                          icon={<Star size={20}/>}
                          expanded={!!expandedSections[`evaluation_dx_${dxIndex}`]}
                          onToggle={() => toggleSection(`evaluation_dx_${dxIndex}`)} 
                        />
                        {expandedSections[`evaluation_dx_${dxIndex}`] && (
                          <div className="p-6 md:p-8 space-y-6 bg-slate-950">
                             {dxIndex === 0 && sectionReasoning?.evaluation && (
                              <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <ReasoningDisplay
                                  initialMarkdownContent={sectionReasoning.evaluation.markdownContent}
                                  title="Evaluation Reasoning"
                                />
                              </div>
                            )}
                            {dx.goals && dx.goals.length > 0 ? dx.goals.map((goal, goalIndex) => (
                              goal.evaluation ? (
                                <div key={`eval-goal-${dxIndex}-${goalIndex}`} className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-md">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-slate-100 text-lg">Goal: {goal.goal_description || `Goal ${goalIndex + 1}`}</h5>
                                    <StatusBadge status={goal.evaluation.evaluationStatus || 'Unknown'} />
                                  </div>
                                  <div className="space-y-2 text-sm text-slate-300">
                                    <p><strong className="text-slate-100">Evaluation Method:</strong> {goal.evaluation.evaluationMethod || <span className="italic text-slate-500">N/A</span>}</p>
                                    <p><strong className="text-slate-100">Evaluation Text/Evidence:</strong> {goal.evaluation.evaluationText || <span className="italic text-slate-500">N/A</span>}</p>
                                    {goal.evaluation.evaluationTargetDate && <p className="text-xs text-slate-400 mt-1.5">Target Date: {goal.evaluation.evaluationTargetDate}</p>}
                                  </div>
                                </div>
                              ) : (
                                <div key={`eval-goal-no-data-${dxIndex}-${goalIndex}`} className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
                                  No evaluation data for: Goal {goalIndex + 1} - {goal.goal_description || 'N/A'}
                                </div>
                              )
                            )) : <div className="text-sm text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">No goals to evaluate.</div>}
                            
                            {dx.goals && dx.goals.length > 0 && (
                              <div className="pt-6 border-t border-slate-700">
                                <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-amber-500 glow-amber-500">
                                  <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                    <Zap size={18} className="mr-2.5 text-amber-400" /> AI Agent Contributions (Evaluation)
                                  </h3>
                                </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                 {agents.length > 0 ? agents.map((agent, agentIdx) => (
                                   <AgentCard key={`agent-evaluation-${dxIndex}-${agentIdx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${agentIdx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${agentIdx}`)} section="evaluation" />
                                 )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center xl:col-span-2 border border-slate-700">No AI agent contributions.</div>}
                               </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-500 italic text-lg">No nursing diagnoses to display evaluations for.</div>}
                  </div>
                )}

                {activeTab === 'summary_coordination_sources' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                      <SectionHeader 
                        title="Plan Summary, Coordination & Admin" 
                        icon={<FileText size={20}/>}
                        expanded={!!expandedSections.summary_admin_main} 
                        onToggle={() => toggleSection('summary_admin_main')} 
                      />
                      {expandedSections.summary_admin_main && (
                        <div className="p-6 md:p-8 space-y-6 bg-slate-950">
                          {sectionReasoning?.summary_coordination_sources && (
                            <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                              <ReasoningDisplay
                                initialMarkdownContent={sectionReasoning.summary_coordination_sources.markdownContent}
                                title="Summary & Coordination Reasoning"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-xl font-semibold text-slate-100 mb-2.5">Overall Plan Summary</h4>
                            <p className="text-slate-300 bg-slate-900 p-4 rounded-md border border-slate-700 shadow-md">{adpieData.overall_plan_summary || <span className="italic text-slate-500">N/A</span>}</p>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-slate-100 mb-2.5">Interdisciplinary Plan</h4>
                            <div className="space-y-2">
                            {interdisciplinaryPlan.length > 0 ? interdisciplinaryPlan.map((item, idx) => (
                              <div key={`interdisciplinary-${idx}`} className="p-3 bg-slate-900 rounded-md border border-slate-700 shadow-md">
                                <strong className="text-purple-400 glow-purple-500">{item.discipline}:</strong> <span className="text-slate-200">{item.plan_item}</span>
                              </div>
                            )) : <p className="italic text-slate-500 bg-slate-900 p-3 rounded-md border border-slate-700">N/A</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-slate-100 mb-2.5">Next Steps</h4>
                            {nextSteps.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1.5 text-slate-300 bg-slate-900 p-4 rounded-md border border-slate-700 shadow-md">
                                {nextSteps.map((step, idx) => <li key={`nextstep-${idx}`}>{step}</li>)}
                              </ul>
                            ) : <p className="italic text-slate-500 bg-slate-900 p-3 rounded-md border border-slate-700">N/A</p>}
                          </div>
                          {(adpieData.notification_title || adpieData.notification_message) && (
                            <div>
                              <h4 className="text-xl font-semibold text-slate-100 mb-2.5">Notifications</h4>
                              <div className="bg-slate-900 p-4 rounded-md border border-slate-700 shadow-md space-y-1 text-sm">
                                {adpieData.notification_title && <p><strong className="text-purple-400">Title:</strong> {adpieData.notification_title}</p>}
                                {adpieData.notification_message && <p><strong className="text-purple-400">Message:</strong> {adpieData.notification_message}</p>}
                                {adpieData.notification_detail_1 && <p><strong className="text-purple-400">Detail 1:</strong> {adpieData.notification_detail_1}</p>}
                                {adpieData.notification_detail_2 && <p><strong className="text-purple-400">Detail 2:</strong> {adpieData.notification_detail_2}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'sources' && (
                   <div className={`animate-fade-in-up space-y-6`}>
                     <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                       <SectionHeader 
                         title="References & Source Material" 
                         icon={<Link size={20}/>}
                         expanded={!!expandedSections.sources}
                         onToggle={() => toggleSection('sources')} 
                       />
                       {expandedSections.sources && (
                         <div className="p-6 md:p-8 space-y-6 bg-slate-950">
                           {sectionReasoning?.summary_coordination_sources && (
                            <div className="my-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 italic mb-2">Note: Source reasoning is part of "Summary & Admin".</p>
                                <ReasoningDisplay
                                  initialMarkdownContent={sectionReasoning.summary_coordination_sources.markdownContent}
                                  title="Summary & Coordination Reasoning"
                                />
                            </div>
                           )}
                           <div>
                            <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-cyan-500 glow-cyan-500">
                              <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4"><Link size={18} className="mr-2.5 text-cyan-400"/>Sources</h3>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                               {sources && sources.length > 0 ? sources.map((source, idx) => (
                                 <SourceCard key={`source-${idx}`} source={source} />
                               )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center md:col-span-2 xl:col-span-3 border border-slate-700">No sources cited.</div>}
                             </div>
                           </div>
                           <div className="pt-6 border-t border-slate-700">
                            <div className="bg-slate-900 py-3 mb-4 rounded-md border-l-4 border-amber-500 glow-amber-500">
                              <h3 className="text-xl font-semibold text-slate-100 flex items-center pl-4">
                                <Zap size={18} className="mr-2.5 text-amber-400"/>AI Agent Contributions (Sources)
                              </h3>
                            </div>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                               {agents.length > 0 ? agents.map((agent, idx) => (
                                 <AgentCard key={`agent-source-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="sources" />
                               )) : <div className="text-base text-slate-500 italic p-5 bg-slate-900 rounded-lg text-center xl:col-span-2 border border-slate-700">No AI agent contributions.</div>}
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Prior Auth Panel */}
          {showPriorAuth && (
            <div className="lg:w-2/5 xl:w-1/3 transition-all duration-500 ease-in-out animate-fade-in-up">
              <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-6 sticky top-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                    <Shield size={20} className="text-sky-400 mr-2.5 glow-sky-500" /> Prior Authorizations
                  </h2>
                  <button onClick={togglePriorAuth} className="text-sm text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800 rounded-full" title="Close">
                    <X size={18} />
                  </button>
                </div>
                {sectionReasoning?.prior_authorizations && (
                  <div className="mb-5 p-4 bg-slate-950 rounded-lg border border-slate-700">
                    <ReasoningDisplay
                      initialMarkdownContent={sectionReasoning.prior_authorizations.markdownContent}
                      title="Prior Authorizations Reasoning"
                    />
                  </div>
                )}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-semibold">Status</span>
                    <span className="font-semibold">Count</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-md flex justify-between items-center border border-slate-700">
                    <StatusBadge status="Pending Submission" />
                    <span className="text-amber-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'pending submission').length}</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-md flex justify-between items-center border border-slate-700">
                    <StatusBadge status="In Progress" />
                    <span className="text-amber-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'in progress').length}</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-md flex justify-between items-center border border-slate-700">
                    <StatusBadge status="Approved" />
                    <span className="text-lime-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'approved').length}</span>
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-md flex justify-between items-center border border-slate-700">
                    <StatusBadge status="Denied" />
                    <span className="text-red-500 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'denied').length}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-lg font-semibold text-slate-200 mb-2.5">Prior Auth Items</div>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto styled-scrollbar-dark pr-1.5">
                    {paItems.length > 0 ? paItems.map((item, idx) => (
                      <PriorAuthCard key={`pa-${idx}`} item={item} onUpdateStatus={handleUpdatePAStatus} />
                    )) : <div className="text-sm text-slate-500 italic p-5 bg-slate-800 rounded-lg text-center border border-slate-700">No prior authorization items.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #334155; /* slate-700 */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; /* slate-600 */ }

        .styled-scrollbar-dark::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background: #020617; /* slate-950 */ }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background: #1e293b; /* slate-800 */ border-radius: 10px; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #334155; /* slate-700 */ }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .tracking-wide { letter-spacing: 0.01em; }
        .tracking-wider { letter-spacing: 0.025em; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.4s ease-out forwards; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }

        /* Electric Glows */
        .glow-sky-500 { box-shadow: 0 0 10px 1px rgba(14, 165, 233, 0.35); }
        .glow-lime-400 { box-shadow: 0 0 10px 1px rgba(163, 230, 53, 0.35); }
        .glow-amber-400 { box-shadow: 0 0 10px 1px rgba(251, 191, 36, 0.35); }
        .glow-fuchsia-400 { box-shadow: 0 0 10px 1px rgba(236, 72, 153, 0.35); } /* fuchsia-500 is too dark for glow */
        .glow-red-500 { box-shadow: 0 0 10px 1px rgba(239, 68, 68, 0.35); }
        .glow-green-500 { box-shadow: 0 0 10px 1px rgba(34, 197, 94, 0.35); }
        .glow-purple-500 { box-shadow: 0 0 10px 1px rgba(168, 85, 247, 0.35); }
        .glow-teal-500 { box-shadow: 0 0 10px 1px rgba(20, 184, 166, 0.35); }
        .glow-cyan-500 { box-shadow: 0 0 10px 1px rgba(6, 182, 212, 0.35); }
        .glow-indigo-500 { box-shadow: 0 0 10px 1px rgba(99, 102, 241, 0.35); }


        .text-shadow-electric-blue { text-shadow: 0 0 10px rgba(14, 165, 233, 0.6); }
        /* Add more text-shadows if needed */

        /* Specific styles for Assessment section cards */
        .assessment-subjective-card { background-color: rgba(14, 165, 233, 0.05); border-left-color: #0ea5e9; /* sky-500 */ }
        .assessment-objective-card { background-color: rgba(163, 230, 53, 0.05); border-left-color: #a3e635; /* lime-500 */ }
        .assessment-recommended-card { background-color: rgba(168, 85, 247, 0.05); border-left-color: #a855f7; /* purple-500 */ }
        
        /* Styles for section content areas for specific tabs */
        .diagnosis-content-bg { background-color: rgba(168, 85, 247, 0.03); /* Subtle purple tint */ }
        .implementation-content-bg { background-color: rgba(20, 184, 166, 0.03); /* Subtle teal tint */ }
        .evaluation-content-bg { background-color: rgba(251, 191, 36, 0.03); /* Subtle amber tint */ }
        .summary-admin-content-bg { background-color: rgba(99, 102, 241, 0.03); /* Subtle indigo tint */ }
        .sources-content-bg { background-color: rgba(6, 182, 212, 0.03); /* Subtle cyan tint */ }

      `}</style>
    </div>
  );
};

export default CarePlanTemplate;
