import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import {
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, TrendingUp, ListChecks, Edit3, Repeat,
  Link, BookOpen, ImageIcon, PlayCircle, Send, ThumbsUp, ThumbsDown, Archive, AlertTriangle, Loader2, Palette, Users, MessageSquare
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import ChatInterface, { ChatMessage } from './ChatInterface'; // Added ChatInterface import
import {
  generateKanbanData,
  updateTaskStatus as updateTask,
  assignTaskToAgent as assignTask,
  TaskStatus,
  KanbanEpic,
  KanbanTask
} from './kanban-helpers';

// --- Data Types ---
type SectionType = 'assessment' | 'diagnosis' | 'implementation' | 'evaluation' | 'sources' | 'kanban' | 'chat'; // Added 'chat'
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

// New type for Recommended Assessment Item
interface RecommendedAssessmentItem {
  item: string;
  rationale: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
}

// New type for Intervention (within a Goal)
interface InterventionType {
  interventionText: string;
  interventionType: 'general' | 'health_teaching' | 'monitoring' | 'psychosocial';
  rationale: string;
}

// New type for Evaluation (within a Goal)
interface EvaluationType {
  evaluationText: string;
  evaluationMethod: string;
  evaluationTargetDate?: string;
  evaluationStatus: 'met' | 'partially_met' | 'not_met' | 'ongoing';
}

interface PriorAuthCriterion {
  name?: string;
  met?: boolean | string;
  notes?: string;
}

interface PriorAuthItem {
  id?: string;
  item?: string;
  type?: string;
  status?: string;
  submittedDate?: string;
  approvedDate?: string;
  expirationDate?: string;
  estimatedResponse?: string;
  estimatedSubmission?: string;
  confidence?: string;
  criteria?: PriorAuthCriterion[];
  [key: string]: any;
}

interface SourceData {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  snippet?: string;
  retrieval_date?: string;
  agent_source?: string;
  [key: string]: any;
}

export interface CarePlanJsonData {
  patientData?: PatientData;
  clinicalData?: ClinicalData;
  aiAgents?: AgentType[];
  priorAuthItems?: PriorAuthItem[];
  sourcesData?: SourceData[];

  assessment_subjective_chief_complaint?: string;
  assessment_subjective_hpi?: string;
  assessment_subjective_goals?: string;
  assessment_subjective_other?: string;

  assessment_objective_vitals_summary?: string;
  assessment_objective_physical_exam?: string;
  assessment_objective_diagnostics?: string;
  assessment_objective_meds_reviewed?: string;
  assessment_objective_other?: string;

  recommendedAssessmentsList?: RecommendedAssessmentItem[]; // ADDED

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
      interventions: InterventionType[]; // MOVED HERE
      evaluation: EvaluationType;      // MOVED HERE & singular
    }[];
    // Interventions array removed from here
  }[];

  // Top-level evaluations array removed

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

interface CarePlanTemplateProps {
  data: CarePlanJsonData | null;
  enableSimulations?: boolean;
  topLevelCitations?: string[];
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
      { id: "PA001", item: "Entresto 49/51mg", type: "Medication", status: "Pending Submission", estimatedResponse: "3-5 business days", estimatedSubmission: randomDate(new Date(Date.now() + 86400000)), confidence: "0.75", criteria: [{ name: "Documented CHF Diagnosis", met: true, notes: "Diagnosis confirmed in chart." },{ name: "Trial of ACEi/ARB", met: "partially met", notes: "Currently on Lisinopril, efficacy to be evaluated." },{ name: "EF < 40%", met: "pending", notes: "Awaiting recent Echocardiogram results." }] },
      { id: "PA002", item: "Echocardiogram", type: "Diagnostic Procedure", status: "Pending Submission", estimatedResponse: "1-2 business days", estimatedSubmission: randomDate(new Date(Date.now() + 86400000*2)), confidence: "0.90", criteria: [{ name: "Symptomatic CHF", met: true, notes: "Patient presenting with dyspnea and edema." },{ name: "Relevant to treatment plan", met: true, notes: "Results will guide medication adjustments." }] }
    ],
    sourcesData: [
      { id: "SRC001", title: "AHA/ACC CHF Guidelines 2023", type: "Clinical Guideline", url: "#", snippet: "Guideline for management of heart failure, including pharmacologic and non-pharmacologic interventions.", retrieval_date: randomDate(), agent_source: "Clinical Insight Agent" },
      { id: "SRC002", title: "Patient EHR Record - Admission Note", type: "EHR Note", url: "#", snippet: "Admission H&P detailing patient presentation and initial assessment by Dr. Marcus.", retrieval_date: randomDate(), agent_source: "All Agents" },
      { id: "SRC003", title: "United HealthCare Formulary Tier List Q1 2024", type: "Insurance Document", url: "#", snippet: "Entresto listed as Tier 3, PA required. Copay assistance programs available.", retrieval_date: randomDate(), agent_source: "Authorization & Benefits Agent" }
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
    className={`flex items-center px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300 whitespace-nowrap group relative border-b-2 mx-4 ${
      active
        ? 'text-white border-blue-500 bg-gradient-to-r from-blue-600 to-teal-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-teal-500' // Active tab with solid gradient background and underline
        : 'text-slate-300 hover:text-white border-transparent hover:border-slate-500' // Inactive tab
    }`}
    onClick={() => { onClick(); if(anonClick) anonClick(label); }}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-2 transition-colors duration-300 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}` } as any)}
    <span className="tracking-wide">{label}</span>
  </button>
);

const SectionHeader = ({ title, icon, expanded, onToggle, actionButton }: { title: string; icon: ReactNode; expanded: boolean; onToggle: () => void; actionButton?: ReactNode }) => (
  <div
    className={`flex justify-between items-center py-8 px-10 rounded-t-lg cursor-pointer transition-all duration-300 ease-in-out ${
      expanded ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-b border-slate-600' // Enhanced header
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center min-w-0 mr-3 pl-2">
      {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-2 transition-colors duration-300 ${expanded ? 'text-white' : 'text-blue-400'} flex-shrink-0` } as any)}
      <h3 className="font-semibold text-xl tracking-wide leading-relaxed truncate" title={title}>{title}</h3>
    </div>
    <div className="flex items-center flex-shrink-0">
      {actionButton && <div className="mr-5">{actionButton}</div>}
      {expanded ? <ChevronUp size={20} className={expanded ? "text-white" : "text-slate-300"} /> : <ChevronDown size={20} className={expanded ? "text-white" : "text-slate-300"} />}
    </div>
  </div>
);

const InfoCard = ({ icon, label, value, color = "blue" }: InfoCardProps) => {
  // Dark mode color adjustments - text will be light, backgrounds darker shades of the color
  const colorClasses = {
    blue: "bg-blue-800 border-blue-700 text-blue-200", green: "bg-green-800 border-green-700 text-green-200",
    purple: "bg-purple-800 border-purple-700 text-purple-200", amber: "bg-amber-800 border-amber-700 text-amber-200",
    indigo: "bg-indigo-800 border-indigo-700 text-indigo-200", teal: "bg-teal-800 border-teal-700 text-teal-200",
    red: "bg-red-800 border-red-700 text-red-200", pink: "bg-pink-800 border-pink-700 text-pink-200",
    cyan: "bg-cyan-800 border-cyan-700 text-cyan-200",
  };
  const safeColor = (color as keyof typeof colorClasses) in colorClasses ? (color as keyof typeof colorClasses) : 'blue';
  
  return (
    <div className="bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-600 flex items-start hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"> {/* Dark mode InfoCard */}
      <div className={`rounded-lg p-4 mr-6 ${colorClasses[safeColor]} flex-shrink-0`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28 } as any)}
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium text-slate-400 tracking-wide mb-2 truncate">{label}</p>
        <p className="font-semibold text-slate-100 text-xl tracking-wide leading-snug truncate" title={String(value || '')}>{value || <span className="italic text-slate-500">N/A</span>}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let bgColor, textColor, icon, ringColor;
  const displayStatus = status || 'Unknown';

  // Dark mode status badge colors
  switch(displayStatus.toLowerCase()) {
    case 'approved': case 'active': case 'met': case 'completed':
      bgColor = 'bg-green-700'; textColor = 'text-green-100'; icon = <CheckCircle size={14} className="text-green-300 mr-1.5" />; ringColor = 'ring-green-500'; break;
    case 'in progress': case 'pending': case 'partially met': case 'ongoing':
      bgColor = 'bg-amber-700'; textColor = 'text-amber-100'; icon = <Clock size={14} className="text-amber-300 mr-1.5 animate-pulse" />; ringColor = 'ring-amber-500'; break;
    case 'pending submission': case 'scheduled':
      bgColor = 'bg-blue-700'; textColor = 'text-blue-100'; icon = <FileText size={14} className="text-blue-300 mr-1.5" />; ringColor = 'ring-blue-500'; break;
    case 'denied': case 'not met': case 'rejected':
      bgColor = 'bg-red-700'; textColor = 'text-red-100'; icon = <X size={14} className="text-red-300 mr-1.5" />; ringColor = 'ring-red-500'; break;
    case 'new order':
      bgColor = 'bg-orange-700'; textColor = 'text-orange-100'; icon = <Plus size={14} className="text-orange-300 mr-1.5" />; ringColor = 'ring-orange-500'; break;
    default:
      bgColor = 'bg-slate-600'; textColor = 'text-slate-100'; icon = <Info size={14} className="text-slate-300 mr-1.5" />; ringColor = 'ring-slate-500';
  }
  return (
    <div className={`inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold ${bgColor} ${textColor} ring-1 ring-opacity-70 ${ringColor} shadow-sm`}>
      {icon}
      {displayStatus}
    </div>
  );
};

const getAgentGradient = (agentName: string) => {
  const name = (agentName || '').toLowerCase();
  if (name.includes('clinical')) {
    return {
      header: 'from-blue-500 via-blue-600 to-indigo-600', 
      bg: 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30',
      border: 'border-blue-500',
      icon: <Activity size={24} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    };
  }
  if (name.includes('authorization') || name.includes('benefits')) {
    return {
      header: 'from-purple-500 via-purple-600 to-indigo-600', 
      bg: 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30',
      border: 'border-purple-500',
      icon: <Shield size={24} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    };
  }
  if (name.includes('discharge') || name.includes('coordination')) {
    return {
      header: 'from-green-500 via-green-600 to-teal-600', 
      bg: 'bg-gradient-to-br from-green-900/30 to-teal-900/30',
      border: 'border-green-500',
      icon: <Users size={24} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600'
    };
  }
  return {
    header: 'from-blue-500 via-indigo-600 to-purple-600', 
    bg: 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30',
    border: 'border-indigo-500',
    icon: <Zap size={24} className="text-white" />,
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  };
};

const AgentCard = ({ agent, isExpanded, onToggle, section }: { agent: AgentType; isExpanded: boolean; onToggle: () => void; section: ActiveTabType }) => {
  const agentName = agent?.name || 'Unknown Agent';
  const agentSpecialty = agent?.specialty || 'Unknown Specialty';
  const agentConfidence = agent?.confidenceScore || 0;
  const insights = agent?.insights || [];

  // Enhanced styling with gradients
  const styles = getAgentGradient(agentName);

  const getContributionText = (currentSection: ActiveTabType): string | React.ReactNode => {
    if (!agent) return <span className="italic text-slate-400">N/A</span>;
    switch (currentSection) {
      case 'overview':
        return agent.assessmentContribution || agent.planningContribution || agent.implementationContribution || agent.evaluationContribution || "Provides overall strategic insights.";
      case 'assessment':
        return agent.assessmentContribution || <span className="italic text-slate-400">No specific assessment contribution.</span>;
      case 'diagnosis': // Covers Diagnosis & Goals
        return agent.planningContribution || <span className="italic text-slate-400">No specific planning contribution.</span>;
      case 'implementation': // Covers Interventions
        return agent.implementationContribution || <span className="italic text-slate-400">No specific implementation contribution.</span>;
      case 'evaluation':
        return agent.evaluationContribution || <span className="italic text-slate-400">No specific evaluation contribution.</span>;
      case 'kanban':
         return agent.implementationContribution || "Contributes to task execution and monitoring.";
      case 'sources':
        return "Agent may cite sources; direct contribution is through evidence provided.";
      default:
        return <span className="italic text-slate-400">N/A</span>;
    }
  };
  
  return (
    <div className={`bg-slate-700 rounded-xl shadow-lg overflow-hidden border ${isExpanded ? `ring-2 ring-offset-2 ring-offset-slate-800 ${styles.border.replace('border-', 'ring-')}` : styles.border} hover:shadow-xl transition-all duration-300 ease-in-out`}>
      <div className={`bg-gradient-to-r ${styles.header} px-5 py-4 text-white flex justify-between items-center cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center min-w-0 mr-3">
          <div className={`p-2.5 ${styles.iconBg} rounded-lg mr-4 shadow-inner flex-shrink-0`}>{styles.icon}</div>
          <div className="min-w-0">
            <h4 className="font-bold text-xl text-white truncate" title={agentName}>{agentName}</h4>
            <p className="text-sm text-white text-opacity-90 truncate" title={agentSpecialty}>{agentSpecialty}</p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <div className="bg-white bg-opacity-20 px-3.5 py-2 rounded-md text-sm font-semibold mr-4 shadow-sm">
            {(agentConfidence * 100).toFixed(0)}% Conf.
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isExpanded && (
        <div className={`p-5 space-y-5 border-t-2 ${styles.border} ${styles.bg}`}>
          <div className={`rounded-lg p-4 border ${styles.border} bg-slate-700/80 backdrop-blur-sm shadow-sm`}>
            <div className="font-semibold text-slate-100 text-lg mb-2.5 flex items-center">
              <Palette size={18} className="mr-2.5 text-slate-300" /> {section.charAt(0).toUpperCase() + section.slice(1)} Contribution:
            </div>
            <p className="text-base text-slate-200 leading-relaxed">{getContributionText(section)}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-100 mb-3 flex items-center"><Zap size={18} className="mr-2 text-amber-400" /> AI Insights</h5>
            {insights.length > 0 ? (
              <ul className="space-y-2.5">
                {insights.map((insight, idx) => (
                  <li key={idx} className="text-base text-slate-200 flex items-start p-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-md shadow-sm hover:shadow-md transition-all duration-300">
                    <ArrowRight size={16} className="text-amber-500 mr-2.5 mt-1 flex-shrink-0" /> {insight || 'N/A'}
                  </li>
                ))}
              </ul>
            ) : <div className="text-base text-slate-400 italic p-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-md">No insights provided for this agent.</div>}
          </div>
           <div className="mt-4 pt-4 border-t border-slate-500/50">
             <p className="text-sm text-slate-300 italic flex items-center">
               <Zap size={16} className="mr-2 text-teal-400 animate-pulse" />
               {agentName} is actively monitoring and processing information related to {section === 'overview' ? 'overall care coordination' : String(section)}...
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

const PriorAuthCard = ({ item, onUpdateStatus }: { item: PriorAuthItem; onUpdateStatus?: (id: string, newStatus: string) => void }) => {
  const paId = item?.id || item?.pa_n_id || 'N/A';
  const paItemName = item?.item || item?.pa_n_item_name || 'N/A';
  const paType = item?.type || item?.pa_n_type || 'N/A';
  const paStatus = item?.status || item?.pa_n_status || 'Unknown';
  const paSubmittedDate = item?.submittedDate || item?.pa_n_submitted_date || null;
  const paEstSubmission = item?.estimatedSubmission || item?.pa_n_estimated_submission || 'N/A';
  const paApprovedDate = item?.approvedDate || item?.pa_n_approved_date || null;
  const paExpirationDate = item?.expirationDate || item?.pa_n_expiration_date || null;
  const paEstResponse = item?.estimatedResponse || item?.pa_n_estimated_response || 'N/A';
  const paConfidence = item?.confidence || item?.pa_n_approval_confidence ? (parseFloat(item.confidence || item.pa_n_approval_confidence || '0') || 0) : 0;
  const paCriteria = Array.isArray(item?.criteria) ? item.criteria : [];

  return (
    <div className="border border-slate-600 rounded-xl shadow-lg mb-6 bg-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="border-b border-slate-600 p-5 flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <StatusBadge status={paStatus} />
              <span className="ml-3 text-sm font-medium text-slate-400 tracking-wider">ID: {paId}</span>
            </div>
            <h4 className="font-semibold text-slate-100 text-xl">{paItemName}</h4>
            <div className="text-sm text-slate-300 mt-1.5">
              {paType} • {paSubmittedDate ? `Submitted: ${paSubmittedDate}` : `Est. Submission: ${paEstSubmission}`}
            </div>
          </div>
          <div className="text-center flex-shrink-0 ml-5 p-3 bg-gradient-to-br from-blue-800/70 to-indigo-800/70 rounded-lg border border-blue-600 shadow-lg">
            <div className="text-4xl font-bold text-blue-200">{(paConfidence * 100).toFixed(0)}%</div>
            <div className="text-sm text-slate-200">Approval Conf.</div>
          </div>
      </div>
      <div className="p-5 bg-slate-700">
        <h5 className="text-base font-semibold text-slate-200 mb-4">Criteria Assessment</h5>
        <div className="space-y-3">
          {paCriteria.length > 0 ? paCriteria.map((criterion, i) => (
            <div key={`criterion-${i}`} className="border-t border-slate-600 pt-3 mt-3 first:mt-0 first:border-t-0 first:pt-0">
              <div className="text-base flex justify-between items-center">
                <span className="font-medium text-slate-100">{criterion.name}</span>
                <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${criterion.met === true || String(criterion.met).toLowerCase() === 'true' || String(criterion.met).toLowerCase() === 'yes' ? 'bg-green-700 text-green-100 ring-1 ring-green-500' : String(criterion.met).toLowerCase() === 'pending' ? 'bg-amber-700 text-amber-100 ring-1 ring-amber-500' : 'bg-red-700 text-red-100 ring-1 ring-red-500'}`}>
                  {criterion.met === true || String(criterion.met).toLowerCase() === 'true' || String(criterion.met).toLowerCase() === 'yes' ? 'Met' : String(criterion.met).toLowerCase() === 'pending' ? 'Pending' : 'Not Met'}
                </span>
              </div>
              {criterion.notes && <p className="text-sm text-slate-400 mt-2 italic">Notes: {criterion.notes}</p>}
            </div>
          )) : <p className="text-sm text-slate-400 italic text-center py-3">No criteria specified.</p>}
        </div>
      </div>
        {paStatus.toLowerCase() === 'approved' && paApprovedDate && paExpirationDate && (
        <div className="p-4 bg-gradient-to-r from-green-800 to-green-700 border-t border-green-600 flex justify-between items-center text-sm text-green-200 font-medium">
          <span><CheckCircle size={16} className="inline mr-1.5" />Approved: {paApprovedDate}</span> <span><Calendar size={16} className="inline mr-1.5" />Expires: {paExpirationDate}</span>
        </div>
      )}
      { (paStatus.toLowerCase() === 'in progress' || paStatus.toLowerCase() === 'pending submission') && paEstResponse && (
          <div className="p-4 bg-gradient-to-r from-amber-800 to-amber-700 border-t border-amber-600 flex justify-between items-center text-sm text-amber-200 font-medium">
          <span><Clock size={16} className="inline mr-1.5 animate-spin" />Est. Response: {paEstResponse}</span>
        </div>
      )}
      {onUpdateStatus && (
        <div className="p-4 bg-slate-800 border-t border-slate-600 space-x-3 text-right">
          {paStatus.toLowerCase() === 'pending submission' && (
            <button onClick={() => onUpdateStatus(paId, 'In Progress')} className="text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center float-left">
              <Send size={14} className="mr-1.5"/> Simulate Submit
            </button>
          )}
          {paStatus.toLowerCase() === 'in progress' && (
            <>
              <button onClick={() => onUpdateStatus(paId, 'Approved')} className="text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center inline-flex">
                <ThumbsUp size={14} className="mr-1.5"/> Simulate Approve
              </button>
              <button onClick={() => onUpdateStatus(paId, 'Denied')} className="text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center inline-flex">
                <ThumbsDown size={14} className="mr-1.5"/> Simulate Deny
              </button>
            </>
          )}
          {(paStatus.toLowerCase() === 'approved' || paStatus.toLowerCase() === 'denied') && (
              <button onClick={() => onUpdateStatus(paId, 'Pending Submission')} className="text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center float-left">
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
      const sourceId = source?.id || source?.source_n_id || 'N/A';
      const sourceTitle = source?.title || source?.source_n_title || 'N/A';
      const sourceType = source?.type || source?.source_n_type || 'Unknown';
      const sourceUrl = source?.url || source?.source_n_url;
      const sourceSnippet = source?.snippet || source?.source_n_snippet || 'N/A';
      const sourceRetrievalDate = source?.retrieval_date || source?.source_n_retrieval_date || 'N/A';
      const sourceAgent = source?.agent_source || source?.source_n_agent_source || 'N/A';

      // Dark mode icon colors
      const getSourceIcon = (type: string) => {
          type = (type || '').toLowerCase();
          if (type.includes('guideline')) return <BookOpen size={20} className="text-blue-400 mr-3 flex-shrink-0" />;
          if (type.includes('article')) return <FileText size={20} className="text-purple-400 mr-3 flex-shrink-0" />;
          if (type.includes('ehr') || type.includes('note')) return <Clipboard size={20} className="text-green-400 mr-3 flex-shrink-0" />;
          if (type.includes('patient')) return <User size={20} className="text-pink-400 mr-3 flex-shrink-0" />;
          if (type.includes('insurance')) return <Shield size={20} className="text-indigo-400 mr-3 flex-shrink-0" />;
          if (type.includes('web source')) return <Link size={20} className="text-cyan-400 mr-3 flex-shrink-0" />;
          return <Link size={20} className="text-slate-400 mr-3 flex-shrink-0" />;
      };

      return (
          <div className="bg-slate-700 rounded-xl p-5 border border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center min-w-0">
                      {getSourceIcon(sourceType)}
                      <h4 className="font-semibold text-slate-100 text-lg truncate" title={sourceTitle}>{sourceTitle}</h4>
                  </div>
                  <span className="text-sm text-slate-300 bg-slate-600 px-3 py-1.5 rounded-md font-medium flex-shrink-0 ml-3">{sourceType}</span>
              </div>
              <p className="text-base text-slate-300 mb-4 italic leading-relaxed px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg">"{sourceSnippet}"</p>
              <div className="flex flex-wrap justify-between items-center text-sm text-slate-400 border-t border-slate-600 pt-3 gap-3">
                  <span>Retrieved: {sourceRetrievalDate}</span>
                  {sourceUrl && sourceUrl !== "#" && (
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline font-medium flex items-center transition-colors">
                          View Source <Link size={14} className="ml-2" />
                      </a>
                  )}
                   <span className="font-medium">Cited by: {sourceAgent}</span>
              </div>
          </div>
      );
};

const NotificationPopup = ({ title, message, detail1, detail2, isVisible, onClose }: { title: string; message: string; detail1?: string; detail2?: string; isVisible: boolean; onClose: () => void; }) => {
   if (!isVisible) return null;

   return (
     <div className="fixed top-24 right-5 bg-slate-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-blue-500 p-5 w-96 z-50 animate-fade-in-down transition-all duration-300">
       <div className="flex items-start">
         <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-2.5 mr-3.5 flex-shrink-0 border border-blue-500 shadow-lg">
           <AlertTriangle size={24} className="text-blue-100" />
         </div>
         <div className="flex-grow">
           <h4 className="font-bold text-lg text-slate-100">{title}</h4>
           <p className="text-sm text-slate-300 my-2 leading-relaxed">{message}</p>
           <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600">
             {detail1 && <span className="text-xs text-red-200 font-semibold bg-red-900/60 backdrop-blur-sm px-2 py-1 rounded shadow-sm">{detail1}</span>}
             {detail2 && (
                 <span className="text-xs text-green-200 font-semibold bg-green-900/60 backdrop-blur-sm px-2 py-1 rounded shadow-sm flex items-center">
                   <CheckCircle size={14} className="mr-1.5 text-green-300" /> {detail2}
                 </span>
             )}
           </div>
         </div>
         <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-700" title="Close">
           <X size={20} />
         </button>
       </div>
     </div>
   );
}

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 py-8 flex items-center justify-center animate-pulse">
    <div className="max-w-7xl mx-auto px-4 w-full">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-slate-700 rounded-xl mr-4"></div>
            <div>
              <div className="h-8 w-48 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-64 bg-slate-600 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-slate-700 rounded-lg"></div>
            <div className="h-10 w-28 bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-slate-700 p-6 rounded-xl mb-6">
          <div className="h-8 w-1/3 bg-slate-600 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-slate-600 rounded"></div>
        </div>
        <div className="flex space-x-2 p-4 border-b border-slate-700 mb-6">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-32 bg-slate-700 rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-700 rounded-xl"></div>)}
        </div>
        <div className="mt-8">
          <div className="h-6 w-40 bg-slate-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-700 rounded-lg"></div>
            <div className="h-12 bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component Render ---
const CarePlanTemplate = ({ data: initialData, enableSimulations = true, topLevelCitations = [] }: CarePlanTemplateProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('chat'); // Changed default to 'chat'
  const [currentData, setCurrentData] = useState<CarePlanJsonData | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // Added chat messages state
  const [simulatedPatientInfo, setSimulatedPatientInfo] = useState<PatientData | undefined>(undefined);
  const [simulatedClinicalInfo, setSimulatedClinicalInfo] = useState<ClinicalData | undefined>(undefined);
  const [simulatedPaItems, setSimulatedPaItems] = useState<PriorAuthItem[]>([]);
  const [simulatedAdpieData, setSimulatedAdpieData] = useState<Partial<CarePlanJsonData>>({});

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assessment: true, diagnosis_0: true,
    evaluation: true, sources: true, interdisciplinaryPlan: true,
    kanban: true
  });

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
  
  const [activeTabKey, setActiveTabKey] = useState(Date.now());

  // Handler for sending chat messages
  const handleSendChatMessage = (messageContent: string) => {
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

    // Simulate an assistant response for demonstration
    // In a real app, you'd call an API here
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Ron AI received: "${messageContent}". This is a simulated response. I can help you navigate the care plan or answer questions about the patient.`,
        timestamp: new Date().toISOString(),
        context: { // Example context
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
      triggerNotification("Demo Mode Active", "Displaying mock patient data for demonstration purposes.", "Explore freely!", "All features simulated");
    } else {
      setIsLoading(false);
    }
  }, [enableSimulations]);

  useEffect(() => {
    initializeData(initialData);
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, [initialData, initializeData]);

  // Generate Kanban tasks and epics from care plan data
  useEffect(() => {
    if (currentData) {
      // @ts-ignore TODO: Update kanban-helpers.ts for new CarePlanJsonData structure
      const { epics, tasks } = generateKanbanData(currentData);
      setKanbanEpics(epics);
      setKanbanTasks(tasks);
      setFilteredTasks(tasks);

      // Set first epic as expanded by default
      if (epics.length > 0) {
        setExpandedEpics({ [epics[0].id]: true });
      }
    }
  }, [currentData]);

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
      setFilteredTasks(updatedTasks.filter(task =>
        taskFilter === 'all' ? true : task.type === taskFilter
      ));
      return updatedTasks;
    });

    const task = kanbanTasks.find(t => t.id === taskId);
    if (task) {
      triggerNotification(
        `Task ${newStatus === 'completed' ? 'Completed' : 'Updated'} (Simulated)`,
        `Task "${task.title}" is now in ${newStatus} status.`,
        `Type: ${task.type.charAt(0).toUpperCase() + task.type.slice(1)}`,
        `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
      );
    }
  };

  // Assign task to an agent/provider
  const assignTaskToAgent = (taskId: string, assignee: string) => {
    if (!enableSimulations) return;

    setKanbanTasks(prevTasks => {
      const updatedTasks = assignTask(prevTasks, taskId, assignee);
      setFilteredTasks(updatedTasks.filter(task =>
        taskFilter === 'all' ? true : task.type === taskFilter
      ));
      return updatedTasks;
    });

    const task = kanbanTasks.find(t => t.id === taskId);
    if (task) {
      triggerNotification(
        "Task Assigned (Simulated)",
        `Task "${task.title}" assigned to ${assignee}.`,
        "Status: In Progress",
        `${task.type.charAt(0).toUpperCase() + task.type.slice(1)} task`
      );
    }
  };

  const handleUpdatePAStatus = (id: string, newStatus: string) => {
    if (!enableSimulations) return;
    setSimulatedPaItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, status: newStatus };
        const today = new Date().toISOString().split('T')[0];
        if (newStatus === 'In Progress') {
          updatedItem.submittedDate = today;
          triggerNotification("PA Submitted (Simulated)", `Prior auth for ${item.item} has been marked as submitted.`, "Status: In Progress", `ID: ${item.id}`);
        } else if (newStatus === 'Approved') {
          updatedItem.approvedDate = today;
          updatedItem.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          triggerNotification("PA Approved (Simulated)", `Prior auth for ${item.item} is now approved!`, "Status: Approved", `Expires: ${updatedItem.expirationDate}`);
        } else if (newStatus === 'Denied') {
          triggerNotification("PA Denied (Simulated)", `Prior auth for ${item.item} was denied.`, "Status: Denied", "Review criteria/appeal");
        } else if (newStatus === 'Pending Submission') {
          updatedItem.submittedDate = undefined;
          updatedItem.approvedDate = undefined;
          updatedItem.expirationDate = undefined;
          triggerNotification("PA Reset (Simulated)", `Prior auth for ${item.item} status reset.`, "Status: Pending Submission", `ID: ${item.id}`);
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
            ? { ...med, med_n_status: 'Active' }
            : med
        )
      };
    });
    triggerNotification("Medication Status Update (Simulated)", `${medName} is now 'Active'.`, "Action: Administered", "Monitor patient response.");
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
      triggerNotification("Vitals Updated (Simulated)", "New vital signs have been recorded.", "BP, Pulse, O2 Sat refreshed", "Check Overview tab");
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
  // const evaluations = adpieData?.evaluations || []; // Old top-level evaluations
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
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-800 py-12 flex items-center justify-center">
          <div className="bg-slate-800 p-10 rounded-xl shadow-xl border border-slate-700 text-center">
            <Archive size={48} className="mx-auto text-slate-500 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">No Care Plan Data</h2>
            <p className="text-slate-400">Please provide data to display the care plan.</p>
          </div>
        </div>
      );
  }
  
  const handleTabChange = (tabName: ActiveTabType, label: string) => {
    setActiveTab(tabName);
    setActiveTabKey(Date.now());
    if (process.env.NODE_ENV === 'development') console.log(`Switched to tab: ${label}`);
  };

  const pendingPaCount = paItems.filter(i => i.status?.toLowerCase() === 'in progress' || i.status?.toLowerCase() === 'pending submission').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 py-6 antialiased text-slate-200">
      <NotificationPopup 
        {...notificationContent}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 rounded-xl shadow-xl text-white mb-8 flex justify-between items-center flex-wrap gap-y-4">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-10 p-3 rounded-lg text-white mr-4 shadow-md">
              <Shield size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Ron AI</h1>
              <p className="text-white text-opacity-90 text-md">AI-Powered Comprehensive Plan of Care</p>
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            {enableSimulations && (
                <button
                    onClick={() => triggerNotification("Sample System Alert", "This is a test notification to demonstrate the popup feature.", "Category: System", "Severity: Info")}
                    className="bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-500 hover:bg-slate-600 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
                    title="Trigger Sample Notification"
                >
                    <Bell size={16} className="mr-2 text-blue-300" /> Test Notify
                </button>
            )}
            <button
              className={`relative bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-500 hover:bg-slate-600 flex items-center shadow-md hover:shadow-lg transition-all duration-200 ${showPriorAuth ? 'ring-2 ring-blue-400 ring-opacity-70' : ''}`}
              onClick={togglePriorAuth} title="Toggle Prior Authorizations Panel" >
              <Shield size={16} className="mr-2 text-blue-300" /> Prior Auth
              {pendingPaCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md animate-bounce">{pendingPaCount}</span>
              )}
            </button>
            <button onClick={() => console.log("Communicate action triggered")} className="bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-500 hover:bg-slate-600 flex items-center shadow-md hover:shadow-lg transition-all duration-200" title="Communicate with Team">
              <MessageCircle size={16} className="mr-2 text-blue-300" /> Communicate
            </button>
            <button onClick={() => console.log("Export action triggered. Data:", currentData)} className="bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-500 hover:bg-slate-600 flex items-center shadow-md hover:shadow-lg transition-all duration-200" title="Export Care Plan">
              <Download size={16} className="mr-2 text-blue-300" /> Export
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`w-full ${showPriorAuth ? 'lg:w-3/5 xl:w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 mb-6">
              <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 px-6 py-5 text-white">
                <div className="flex justify-between items-start flex-wrap gap-y-3">
                  <div>
                    <h2 className="text-3xl font-bold">{patientInfo.patient_full_name || <span className="italic text-slate-300">N/A</span>}</h2>
                    <p className="text-white text-opacity-90 text-sm mt-1">
                      {patientInfo.patient_age || 'N/A'} y.o. {patientInfo.patient_gender || 'N/A'} • MRN: {patientInfo.patient_mrn || 'N/A'} • Admitted: {patientInfo.patient_admission_date || 'N/A'}
                    </p>
                    {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                        <span className="text-xs text-red-200 mt-1.5 bg-red-700 bg-opacity-40 ring-1 ring-red-500 px-2.5 py-1 rounded-full font-medium inline-flex items-center">
                            <AlertTriangle size={12} className="inline mr-1.5" /> Allergies: {patientInfo.allergies.join(', ')}
                        </span>
                    )}
                  </div>
                  <div className="bg-slate-700 px-4 py-3 rounded-xl backdrop-blur-sm text-right max-w-sm shadow-md border border-slate-600">
                    <div className="text-sm text-slate-300 mb-1.5">Primary Diagnosis</div>
                    <div className="font-semibold text-xl text-white">{clinicalInfo.primary_diagnosis_text || <span className="italic text-slate-300">N/A</span>}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-slate-700 bg-slate-700">
                  <div className="flex space-x-7 overflow-x-auto pb-4 no-scrollbar">
                    <TabButton active={activeTab === 'kanban'} icon={<BarChart2 size={22} />} label="Task Board" onClick={() => handleTabChange('kanban', 'Task Board')} />
                    <TabButton active={activeTab === 'overview'} icon={<Clipboard size={22} />} label="Overview" onClick={() => handleTabChange('overview', 'Overview')} />
                    <TabButton active={activeTab === 'assessment'} icon={<FileCheck size={22} />} label="Assessment" onClick={() => handleTabChange('assessment', 'Assessment')} />
                    <TabButton active={activeTab === 'diagnosis'} icon={<AlertCircle size={22} />} label="Diagnosis & Goals" onClick={() => handleTabChange('diagnosis', 'Diagnosis & Goals')} />
                    <TabButton active={activeTab === 'implementation'} icon={<ListChecks size={22} />} label="Interventions" onClick={() => handleTabChange('implementation', 'Interventions')} />
                    <TabButton active={activeTab === 'evaluation'} icon={<Star size={22} />} label="Evaluation" onClick={() => handleTabChange('evaluation', 'Evaluation')} />
                    <TabButton active={activeTab === 'sources'} icon={<Link size={22} />} label="Sources" onClick={() => handleTabChange('sources', 'Sources')} />
                    <TabButton active={activeTab === 'chat'} icon={<MessageSquare size={22} />} label="Chat with Ron AI" onClick={() => handleTabChange('chat', 'Chat with Ron AI')} />
                  </div>
              </div>

              <div className={`${activeTab === 'chat' ? '' : 'p-10'} bg-slate-800 min-h-[700px] tracking-wide leading-relaxed`} key={activeTabKey}>
                {activeTab === 'chat' && (
                  <div className={`${isMounted ? 'animate-fade-in-up' : 'opacity-0'} h-full`}>
                    <ChatInterface
                      messages={chatMessages}
                      onSendMessage={handleSendChatMessage}
                      isGenerating={false} // Placeholder
                      placeholderText="Ask Ron AI about this patient's care plan..."
                      userName="Provider"
                      assistantName="Ron AI (Care Plan Assistant)"
                      isCarePlanMode={true}
                      predefinedPrompts={[
                        "What are the key risks for this patient?",
                        "Summarize the patient's current medications.",
                        "What are the priority nursing diagnoses?",
                        "Explain the rationale for Entresto.",
                        "What follow-up appointments are needed?"
                      ]}
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
                  <div className={`space-y-10 ${isMounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InfoCard icon={<User size={22} />} label="Primary Provider" value={patientInfo.patient_primary_provider} color="blue" />
                      <InfoCard icon={<Shield size={22} />} label="Insurance Plan" value={patientInfo.patient_insurance_plan} color="indigo" />
                      <InfoCard icon={<Activity size={22} />} label="Severity / NYHA Class" value={patientInfo.nyha_class_description} color="purple" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-slate-100 pl-4">Vital Signs (Latest)</h3>
                        {enableSimulations && (
                          <button 
                            onClick={handleRefreshVitals} 
                            disabled={isRefreshingVitals}
                            className="text-sm bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                          >
                            {isRefreshingVitals ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                            {isRefreshingVitals ? 'Refreshing...' : 'Refresh Vitals'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                        {patientInfo.vitalSigns && Object.keys(patientInfo.vitalSigns).length > 0
                          ? Object.entries(patientInfo.vitalSigns).map(([key, value]) => (
                          <div key={key} className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600 text-center shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-blue-500">
                            <div className="text-sm text-slate-400 mb-1.5 uppercase tracking-wider">{key.replace('vital_', '').replace('_', ' ') === 'o2sat' ? 'O₂ Sat' : key.replace('vital_', '').replace('_', ' ')}</div>
                            <div className="font-semibold text-slate-100 text-xl">{value || <span className="italic text-slate-500">N/A</span>}</div>
                          </div> ))
                          : <div className="col-span-full text-center text-slate-400 py-5 italic">No vital signs data available.</div>
                        }
                      </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4 pl-4">Medications</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-3 styled-scrollbar">
                                {clinicalInfo.medications && clinicalInfo.medications.length > 0 ? clinicalInfo.medications.map((med, idx) => (
                                    <div key={`med-${idx}`} className="flex justify-between items-center bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-purple-500">
                                        <div className="flex-grow min-w-0 mr-3">
                                            <div className="font-semibold text-slate-100 mb-2 text-lg">{med.med_n_name || <span className="italic text-slate-400">N/A</span>} <span className="text-base text-slate-300 font-normal">{med.med_n_dosage || ''}</span></div>
                                            <div className="text-sm text-slate-400">{med.med_n_route || 'N/A'} • {med.med_n_frequency || 'N/A'}</div>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-4 space-x-3">
                                            {(typeof med.med_n_pa_required === 'string' ? med.med_n_pa_required.toLowerCase() === 'true' : !!med.med_n_pa_required) && (
                                                <span className="bg-blue-700 text-blue-100 text-sm font-bold px-3 py-1 rounded-full ring-1 ring-blue-500" title="Prior Authorization Required">PA</span>
                                            )}
                                            <StatusBadge status={med.med_n_status || ''} />
                                            {enableSimulations && (med.med_n_status === 'New Order' || med.med_n_status === 'Pending Submission') && 
                                                <button onClick={() => handleAdministerMedication(med.med_n_name)} className="p-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 rounded-full text-green-100 transition-colors shadow-md" title="Simulate Administer"><PlayCircle size={18}/></button>
                                            }
                                        </div>
                                    </div>
                                )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center">No medications listed.</div>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4 pl-4">Treatments & Diagnostics</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-3 styled-scrollbar">
                                {clinicalInfo.treatments && clinicalInfo.treatments.length > 0 ? clinicalInfo.treatments.map((treatment, idx) => (
                                    <div key={`treat-${idx}`} className="flex justify-between items-center bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-teal-500">
                                        <div className="min-w-0 mr-3">
                                            <div className="font-semibold text-slate-100 truncate text-lg" title={treatment.treatment_n_name}>{treatment.treatment_n_name || 'N/A'}</div>
                                            <div className="text-sm text-slate-400 truncate" title={treatment.treatment_n_details || treatment.treatment_n_date || ''}>
                                                {treatment.treatment_n_details ? `${treatment.treatment_n_details} ` : ''}
                                                {treatment.treatment_n_date ? `(${treatment.treatment_n_date})` : ''}
                                                {(!treatment.treatment_n_details && !treatment.treatment_n_date) && 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-4 space-x-3">
                                            {(typeof treatment.treatment_n_pa_required === 'string' ? treatment.treatment_n_pa_required.toLowerCase() === 'true' : !!treatment.treatment_n_pa_required) && (
                                                <span className="bg-blue-700 text-blue-100 text-sm font-bold px-3 py-1 rounded-full ring-1 ring-blue-500" title="Prior Authorization Required">PA</span>
                                            )}
                                            <StatusBadge status={treatment.treatment_n_status || ''} />
                                        </div>
                                    </div>
                                ))
                              : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center">No treatments listed.</div>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-100 mb-5 pl-4">AI Agent Insights (Overview)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {agents.length > 0 ? agents.map((agent, idx) => (
                            <AgentCard key={`agent-overview-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="overview" />
                          )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center md:col-span-2 xl:col-span-3">No AI agent contributions available.</div>
                        }
                        </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'assessment' && (
                  <div className={`animate-fade-in-up space-y-8`}>
                    <div className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-slate-600"> {/* Dark mode section base */}
                      <SectionHeader 
                        title="Assessment Details" 
                        icon={<FileCheck size={22}/>}
                        expanded={!!expandedSections.assessment} 
                        onToggle={() => toggleSection('assessment')} 
                      />
                      {expandedSections.assessment && (
                        <div className="p-10 space-y-10 bg-slate-700">
                           <div>
                              <div className="pl-10 bg-slate-800 py-3 mb-6">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center">
                                  <User size={20} className="mr-2" />
                                  <span className="ml-4">Subjective Data</span>
                                </h3>
                              </div>
                              <div className="bg-blue-900 bg-opacity-30 rounded-lg p-6 border border-blue-700 shadow-sm space-y-4 text-base text-slate-200 mx-2">
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Chief Complaint:</strong> {adpieData.assessment_subjective_chief_complaint || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">History of Present Illness:</strong> {adpieData.assessment_subjective_hpi || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Patient Goals/Concerns:</strong> {adpieData.assessment_subjective_goals || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Other Subjective Findings:</strong> {adpieData.assessment_subjective_other || <span className="italic text-slate-400">N/A</span>}</p>
                              </div>
                           </div>
                           <div>
                              <div className="pl-10 bg-slate-800 py-3 mb-6">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center">
                                  <Activity size={20} className="mr-2" />
                                  <span className="ml-4">Objective Data</span>
                                </h3>
                              </div>
                              <div className="bg-green-900 bg-opacity-30 rounded-lg p-6 border border-green-700 shadow-sm space-y-4 text-base text-slate-200 mx-2">
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Vital Signs Summary:</strong> {adpieData.assessment_objective_vitals_summary || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Physical Exam Findings:</strong> {adpieData.assessment_objective_physical_exam || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Diagnostic Test Results:</strong> {adpieData.assessment_objective_diagnostics || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Medications Reviewed:</strong> {adpieData.assessment_objective_meds_reviewed || <span className="italic text-slate-400">N/A</span>}</p>
                                <p className="leading-relaxed tracking-wide"><strong className="text-slate-100">Other Objective Findings:</strong> {adpieData.assessment_objective_other || <span className="italic text-slate-400">N/A</span>}</p>
                              </div>
                           </div>
                           {/* Recommended Assessments Section */}
                           <div>
                              <div className="pl-10 bg-slate-800 py-3 mb-6 mt-10">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center">
                                  <ListChecks size={20} className="mr-2 text-indigo-400" />
                                  <span className="ml-4">Recommended Assessments</span>
                                </h3>
                              </div>
                              <div className="bg-indigo-900 bg-opacity-25 rounded-lg p-6 border border-indigo-700 shadow-sm space-y-4 text-base text-slate-200 mx-2">
                                {recommendedAssessments.length > 0 ? recommendedAssessments.map((recAssessment: RecommendedAssessmentItem, idx: number) => (
                                  <div key={`rec-assess-${idx}`} className="border-b border-indigo-600 pb-3 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-1">
                                      <strong className="text-slate-100">{recAssessment.item}</strong>
                                      <StatusBadge status={recAssessment.status} />
                                    </div>
                                    <p className="text-sm text-slate-300 italic">Rationale: {recAssessment.rationale}</p>
                                  </div>
                                )) : <p className="italic text-slate-400">No recommended assessments listed.</p>}
                              </div>
                           </div>
                           <div className="pt-6 border-t border-slate-600 mt-10">
                              <div className="pl-10 bg-slate-800 py-3 mb-6">
                                <h3 className="text-xl font-semibold text-slate-100 flex items-center">
                                  <Zap size={20} className="mr-2" />
                    <span className="ml-4">AI Agent Contributions & Insights (Assessment)</span>
                  </h3>
                </div>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-2">
                               {agents.length > 0 ? agents.map((agent, idx) => (
                                 <AgentCard key={`agent-assess-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="assessment" />
                               )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'diagnosis' && (
                  <div className={`animate-fade-in-up space-y-8`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`dx-${dxIndex}`} className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-purple-600"> {/* Dark mode section base */}
                        <SectionHeader 
                          title={`Nursing Diagnosis ${dxIndex + 1}: ${dx.diagnosis_nanda || 'N/A'}`}
                          icon={<AlertCircle size={22}/>} 
                          expanded={!!expandedSections[`diagnosis_${dxIndex}`]}
                          onToggle={() => toggleSection(`diagnosis_${dxIndex}`)} 
                        />
                        {expandedSections[`diagnosis_${dxIndex}`] && (
                          <div className="p-10 space-y-10 bg-purple-900 bg-opacity-20"> {/* Dark mode content area */}
                            <div className="bg-slate-700 p-6 rounded-lg border border-purple-500 shadow-sm text-base mx-2">
                                <p className="text-slate-200 mb-3 leading-relaxed tracking-wide"><strong className="text-purple-300">Related To:</strong> {dx.diagnosis_related_to || <span className="italic text-slate-400">N/A</span>}</p>
                                {dx.diagnosis_is_risk ? (
                                    <div className="mt-3">
                                        <strong className="text-sm text-red-300 block mb-1.5">Risk Factors:</strong>
                                        {dx.diagnosis_risk_factors && dx.diagnosis_risk_factors.length > 0 ? (
                                          <ul className="list-disc list-inside space-y-1.5 text-slate-200 pl-2">
                                            {dx.diagnosis_risk_factors.map((factor, i) => <li key={`risk-${dxIndex}-${i}`}>{factor}</li>)}
                                          </ul>
                                        ) : <p className="italic text-slate-400 pl-2">No risk factors listed.</p>}
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <strong className="text-sm text-green-300 block mb-1.5">As Evidenced By (Assessment Findings):</strong>
                                        {dx.diagnosis_evidence && dx.diagnosis_evidence.length > 0 ? (
                                          <ul className="list-disc list-inside space-y-1.5 text-slate-200 pl-2">
                                              {dx.diagnosis_evidence.map((ev, i) => <li key={`ev-${dxIndex}-${i}`}>{ev}</li>)}
                                              {dx.diagnosis_evidence.length < 5 && <li className="italic text-amber-300"></li>}
                                          </ul>
                                        ) : <p className="italic text-slate-400 pl-2">No evidence listed.</p>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-xl text-slate-100 mb-4 flex items-center"><Target size={20} className="mr-2.5 text-purple-400"/>Goals (SMART)</h4>
                                <div className="space-y-5">
                                    {dx.goals && dx.goals.length > 0 ? dx.goals.map((goal, goalIndex) => (
                                        <div key={`goal-${dxIndex}-${goalIndex}`} className="bg-slate-700 rounded-lg p-5 border border-purple-500 shadow-sm">
                                            <div className="font-semibold text-slate-100 mb-2 text-lg">Goal {goalIndex + 1}: {goal.goal_description || <span className="italic text-slate-400">N/A</span>}</div>
                                            {goal.goal_rationale && <p className="text-sm text-slate-300 mb-2 italic"><strong className="text-slate-200">Rationale:</strong> {goal.goal_rationale}</p>}
                                            <p className="text-base text-slate-200"><strong>Target Date:</strong> {goal.goal_target_date || <span className="italic text-slate-400">N/A</span>}</p>
                                            <div className="mt-2.5">
                                                <strong className="text-base text-slate-200 block mb-1.5">Outcomes:</strong>
                                                {goal.goal_outcomes && goal.goal_outcomes.length > 0 ? (
                                                  <ul className="list-disc list-inside space-y-1.5 text-base text-slate-200 pl-2">
                                                    {goal.goal_outcomes.map((outcome, oIdx) => <li key={`outcome-${dxIndex}-${goalIndex}-${oIdx}`}>{outcome}</li>)}
                                                  </ul>
                                                ) : <p className="italic text-slate-400 pl-2 text-base">No outcomes listed.</p>}
                                            </div>
                                        </div>
                                    )) : <div className="text-base text-slate-400italic p-5 bg-slate-600 rounded-lg border border-purple-500 text-center"></div>}
                                    {dx.goals && dx.goals.length > 0 && dx.goals.length < 5 && <div className="text-base text-amber-400 italic p-3 text-center"></div>}
                                </div>
                            </div>
                             <div className="pt-6 border-t border-purple-500">
                  <div className="pl-10 bg-slate-800 py-3 mb-6">
                    <h3 className="text-xl font-semibold text-slate-100 flex items-center">
                      <Zap size={20} className="mr-2" />
                      <span className="ml-4">AI Agent Contributions & Insights (Diagnosis/Goals)</span>
                    </h3>
                  </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-2">
                                 {agents.length > 0 ? agents.map((agent, idx) => (
                                   <AgentCard key={`agent-diag-${dxIndex}-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="diagnosis" />
                                 )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-400 italic text-lg">No nursing diagnoses identified in the care plan.</div>}
                  </div>
                )}

                {activeTab === 'implementation' && (
                  <div className={`animate-fade-in-up space-y-8`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`impl-dx-${dxIndex}`} className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-teal-600">
                        <SectionHeader 
                          title={`Interventions for Diagnosis: ${dx.diagnosis_nanda || `Diagnosis ${dxIndex + 1}`}`}
                          icon={<ListChecks size={22}/>} 
                          expanded={!!expandedSections[`impl_dx_${dxIndex}`]}
                          onToggle={() => toggleSection(`impl_dx_${dxIndex}`)} 
                        />
                        {expandedSections[`impl_dx_${dxIndex}`] && (
                          <div className="p-10 space-y-8 bg-teal-900 bg-opacity-20">
                            {(dx.goals && dx.goals.length > 0) ? dx.goals.map((goal, goalIndex) => (
                              <div key={`impl-goal-${dxIndex}-${goalIndex}`} className="mb-6">
                                <h4 className="font-semibold text-xl text-slate-100 mb-3 pl-2 border-b border-teal-700 pb-2">
                                  Goal {goalIndex + 1}: {goal.goal_description || 'N/A'}
                                </h4>
                                <div className="space-y-4 mx-2">
                                  {goal.interventions && goal.interventions.length > 0 ? goal.interventions.map((int: InterventionType, intIndex: number) => (
                                    <div key={`int-${dxIndex}-${goalIndex}-${intIndex}`} className="bg-slate-700 rounded-lg p-5 border border-teal-500 shadow-sm">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-slate-100 text-lg">
                                          Intervention {intIndex + 1}: {int.interventionText || <span className="italic text-slate-400">N/A</span>}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${int.interventionType === 'health_teaching' ? 'bg-sky-700 text-sky-100' : 'bg-emerald-700 text-emerald-100'}`}>
                                          {int.interventionType ? int.interventionType.replace('_', ' ') : 'general'}
                                        </span>
                                      </div>
                                      <p className="text-base text-slate-300 leading-relaxed tracking-wide"><strong className="text-slate-200">Rationale:</strong> {int.rationale || <span className="italic text-slate-400">N/A</span>}</p>
                                    </div>
                                  )) : <div className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-teal-500 text-center">No interventions defined for this goal.</div>}
                                  {(goal.interventions?.length || 0) < 20 && <div className="text-base text-amber-400 italic p-3 text-center">Expected up to 20 interventions for this goal.</div>}
                                </div>
                              </div>
                            )) : <div className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-teal-500 text-center">No goals defined for this diagnosis.</div>}
                            
                            <div className="pt-6 border-t border-teal-500">
                              <div className="bg-slate-800 pl-3 mb-6">
                                <h3 className="text-xl font-semibold text-slate-100 py-3 pl-2 flex items-center"><Zap size={20} className="mr-2 text-blue-400 flex-shrink-0"/>AI Agent Contributions & Insights (Interventions for this Diagnosis)</h3>
                              </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-2">
                                 {agents.length > 0 ? agents.map((agent, agentIdx) => (
                                   <AgentCard key={`agent-impl-${dxIndex}-${agentIdx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${agentIdx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${agentIdx}`)} section="implementation" />
                                 )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                               </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-400 italic text-lg">No nursing diagnoses identified to display interventions for.</div>}
                  </div>
                )}
                
                {activeTab === 'evaluation' && (
                  <div className={`animate-fade-in-up space-y-8`}>
                    {nursingDiagnoses.length > 0 ? nursingDiagnoses.map((dx, dxIndex) => (
                      <div key={`eval-dx-${dxIndex}`} className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-amber-600">
                        <SectionHeader 
                          title={`Evaluation for Diagnosis: ${dx.diagnosis_nanda || `Diagnosis ${dxIndex + 1}`}`}
                          icon={<Star size={22}/>}
                          expanded={!!expandedSections[`evaluation_dx_${dxIndex}`]}
                          onToggle={() => toggleSection(`evaluation_dx_${dxIndex}`)} 
                        />
                        {expandedSections[`evaluation_dx_${dxIndex}`] && (
                          <div className="p-10 space-y-8 bg-amber-900 bg-opacity-20">
                            {dx.goals && dx.goals.length > 0 ? dx.goals.map((goal, goalIndex) => (
                              goal.evaluation ? (
                                <div key={`eval-goal-${dxIndex}-${goalIndex}`} className="bg-slate-700 rounded-lg p-5 border border-amber-500 shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-semibold text-slate-100 text-lg">Goal: {goal.goal_description || `Goal ${goalIndex + 1}`}</h5>
                                    <StatusBadge status={goal.evaluation.evaluationStatus || 'Unknown'} />
                                  </div>
                                  <div className="space-y-3 text-slate-300">
                                    <p><strong className="text-slate-100">Evaluation Method:</strong> {goal.evaluation.evaluationMethod || <span className="italic text-slate-400">N/A</span>}</p>
                                    <p><strong className="text-slate-100">Evaluation Text/Evidence:</strong> {goal.evaluation.evaluationText || <span className="italic text-slate-400">N/A</span>}</p>
                                    {goal.evaluation.evaluationTargetDate && <p className="text-sm text-slate-400 mt-2">Target Date: {goal.evaluation.evaluationTargetDate}</p>}
                                  </div>
                                </div>
                              ) : (
                                <div key={`eval-goal-no-data-${dxIndex}-${goalIndex}`} className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-amber-500 text-center">
                                  No evaluation data for: Goal {goalIndex + 1} - {goal.goal_description || 'N/A'}
                                </div>
                              )
                            )) : <div className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-amber-500 text-center">No goals to evaluate for this diagnosis.</div>}
                            
                            {dx.goals && dx.goals.length > 0 && (
                              <div className="pt-6 border-t border-amber-500">
                                <div className="bg-slate-800 pl-3 mb-6">
                                  <h3 className="text-xl font-semibold text-slate-100 py-3 pl-2 flex items-center"><Zap size={20} className="mr-2 text-blue-400 flex-shrink-0"/>AI Agent Contributions & Insights (Evaluation for this Diagnosis)</h3>
                                </div>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-2">
                                 {agents.length > 0 ? agents.map((agent, agentIdx) => (
                                   <AgentCard key={`agent-evaluation-${dxIndex}-${agentIdx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${agentIdx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${agentIdx}`)} section="evaluation" />
                                 )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                               </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) : <div className="text-center p-10 text-slate-400 italic text-lg">No nursing diagnoses identified to display evaluations for.</div>}
                  </div>
                )}

                {activeTab === 'sources' && (
                   <div className={`animate-fade-in-up space-y-8`}>
                     <div className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-cyan-600">
                       <SectionHeader 
                         title="References & Source Material" 
                         icon={<Link size={22}/>}
                         expanded={!!expandedSections.sources}
                         onToggle={() => toggleSection('sources')} 
                       />
                       {expandedSections.sources && (
                         <div className="p-10 space-y-8 bg-cyan-900 bg-opacity-20">
                           <div>
                  <div className="bg-slate-800 pl-3 mb-6">
                    <h3 className="text-xl font-semibold text-slate-100 py-3 pl-2 flex items-center"><Link size={20} className="mr-2 text-cyan-400 flex-shrink-0"/>Sources</h3>
                  </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mx-2">
                               {sources && sources.length > 0 ? sources.map((source, idx) => (
                                 <SourceCard key={`source-${idx}`} source={source} />
                               )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center md:col-span-2 xl:col-span-3">No sources have been cited in this care plan.</div>}
                             </div>
                           </div>
                           <div className="pt-6 border-t border-cyan-500">
                  <div className="bg-slate-800 pl-3 mb-6">
                    <h3 className="text-xl font-semibold text-slate-100 py-3 pl-2 flex items-center"><Zap size={20} className="mr-2 text-blue-400 flex-shrink-0"/>AI Agent Contributions & Insights (Sources)</h3>
                  </div>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mx-2">
                               {agents.length > 0 ? agents.map((agent, idx) => (
                                 <AgentCard key={`agent-source-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="sources" />
                               )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
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

          {showPriorAuth && (
            <div className="lg:w-2/5 xl:w-1/3 transition-all duration-500 ease-in-out">
              <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                    <Shield size={22} className="text-blue-500 mr-2.5" /> Prior Authorizations
                  </h2>
                  <button onClick={togglePriorAuth} className="text-sm text-slate-400 hover:text-slate-300 p-1 hover:bg-slate-700 rounded" title="Close">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-center text-sm text-slate-300 mb-3">
                    <span className="font-semibold">Status</span>
                    <span className="font-semibold">Summary</span>
                  </div>
                  <div className="bg-slate-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <StatusBadge status="Pending Submission" />
                    <span className="text-amber-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'pending submission').length}</span>
                  </div>
                  <div className="bg-slate-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <StatusBadge status="In Progress" />
                    <span className="text-amber-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'in progress').length}</span>
                  </div>
                  <div className="bg-slate-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <StatusBadge status="Approved" />
                    <span className="text-green-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'approved').length}</span>
                  </div>
                  <div className="bg-slate-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <StatusBadge status="Denied" />
                    <span className="text-red-400 font-semibold">{paItems.filter(i => i.status?.toLowerCase() === 'denied').length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-slate-200 mb-3">Prior Auth Items</div>
                  <div className="max-h-[600px] overflow-y-auto styled-scrollbar pr-2">
                    {paItems.length > 0 ? paItems.map((item, idx) => (
                      <PriorAuthCard key={`pa-${idx}`} item={item} onUpdateStatus={handleUpdatePAStatus} />
                    )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center">No prior authorization items found.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Typography enhancements */
        .letter-spacing-0.03em {
          letter-spacing: 0.03em;
        }
        
        .letter-spacing-0.02em {
          letter-spacing: 0.02em;
        }
        
        .leading-relaxed {
          line-height: 1.6;
        }
        
        .tracking-wide {
          letter-spacing: 0.015em;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CarePlanTemplate;
