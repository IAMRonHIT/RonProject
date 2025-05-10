import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import {
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, TrendingUp, ListChecks, Edit3, Repeat,
  Link, BookOpen, ImageIcon, PlayCircle, Send, ThumbsUp, ThumbsDown, Archive, AlertTriangle, Loader2, Palette, Users
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import {
  generateKanbanData,
  updateTaskStatus as updateTask,
  assignTaskToAgent as assignTask,
  TaskStatus,
  KanbanEpic,
  KanbanTask
} from './kanban-helpers';

// --- Data Types ---
type SectionType = 'assessment' | 'diagnosis' | 'implementation' | 'evaluation' | 'sources' | 'kanban';
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';
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
  [key: string]: any;
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
    }[];
    interventions: {
      intervention_action: string;
      intervention_rationale: string;
      intervention_is_pending?: boolean;
    }[];
  }[];

  evaluations?: {
    evaluation_goal_description_ref: string;
    evaluation_date?: string;
    evaluation_status?: string;
    evaluation_evidence: string;
    evaluation_revision?: string;
    evaluation_rationale?: string;
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

interface CarePlanTemplateProps {
  data: CarePlanJsonData | null;
  enableSimulations?: boolean;
  topLevelCitations?: string[];
}

interface KanbanEpic {
  id: string;
  title: string;
  description: string;
  goalTargetDate?: string;
  diagnosisId: string;
  diagnosisName: string;
  tasks: KanbanTask[];
}

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'intervention' | 'assessment' | 'evaluation';
  epicId?: string;
  epicName?: string;
  dueDate?: string;
  createdAt: string;
  details?: any;
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
  const createInterventions = (count: number, diagnosisName: string) => {
    const interventions = [];
    const commonActions = [
      "Monitor vital signs q4h and PRN", "Assess pain level using 0-10 scale", "Educate patient on medication purpose, dosage, side effects",
      "Provide emotional support and active listening", "Encourage deep breathing and coughing exercises", "Maintain strict intake and output records",
      "Administer prescribed medications as ordered", "Turn and reposition patient q2h", "Assess for signs of infection",
      "Collaborate with physical therapy for mobility plan", "Consult dietitian for nutritional needs", "Reinforce adherence to treatment plan",
      "Provide comfort measures", "Document patient response to interventions", "Prepare patient for discharge (education, follow-up)"
    ];
    for (let i = 0; i < count; i++) {
      interventions.push({
        intervention_action: `${commonActions[i % commonActions.length]} (related to ${diagnosisName})`,
        intervention_rationale: `To address ${diagnosisName} by promoting comfort, safety, and optimal physiological function. Rationale snippet ${i+1}.`,
        intervention_is_pending: Math.random() < 0.1,
      });
    }
    return interventions;
  };

  const createGoals = (count: number, diagnosisName: string) => {
    const goals = [];
    for (let i = 0; i < count; i++) {
      goals.push({
        goal_description: `Patient will demonstrate understanding of ${diagnosisName.toLowerCase()} management by ${randomDate(new Date(Date.now() + 86400000 * (i+1)))}. Goal ${i+1}.`,
        goal_target_date: randomDate(new Date(Date.now() + 86400000 * (i+2)), new Date(Date.now() + 86400000 * (i+7))),
        goal_outcomes: [
          `Outcome 1 for goal ${i+1} (e.g., verbalizes 3 key self-care strategies).`,
          `Outcome 2 for goal ${i+1} (e.g., demonstrates correct technique for X).`,
          `Outcome 3 for goal ${i+1} (e.g., identifies 2 reportable symptoms).`,
        ],
        goal_rationale: `This goal is crucial for ${diagnosisName.toLowerCase()} because it empowers the patient towards self-management and reduces risk of readmission. Rationale ${i+1}.`
      });
    }
    return goals;
  };
  
  const diagnosisNames = [
    "Fluid Volume Excess", "Activity Intolerance", "Ineffective Airway Clearance", "Anxiety", "Risk for Impaired Skin Integrity"
  ];

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
      { name: "Clinical Insight Agent", specialty: "Cardiology Focus", agent_1_confidence_score: "0.92", agent_1_assessmentContribution: "Suggests monitoring fluid balance closely due to CHF exacerbation and potential impact of comorbidities. Review NYHA classification.", agent_1_diagnosisContribution: "Confirms CHF as primary, highlights risk of renal impairment with diuretics. Suggests NANDA diagnoses related to fluid balance and activity.", agent_1_planningContribution: "Recommends daily weights, strict I/O monitoring, and specific parameters for diuretic titration. Considers patient's social support for discharge.", agent_1_implementationContribution: "Flags potential Lisinopril-Furosemide interaction (monitor potassium). Suggests specific patient education points for CHF self-management.", agent_1_evaluationContribution: "Advises reassessment of NYHA class post-diuresis and evaluation of patient's understanding of discharge medications.", agent_1_insight_1: "BNP trend indicates response to initial therapy may be slow.", agent_1_insight_2: "Consider echocardiogram if symptoms worsen despite treatment." },
      { name: "Authorization & Benefits Agent", specialty: "Prior Auth & Formulary Compliance", agent_2_confidence_score: "0.85", agent_2_planningContribution: "Identified Entresto as requiring PA; initiated process. Verified formulary status and co-pay estimation.", agent_2_implementationContribution: "Prepared documentation packet for Entresto PA submission, including relevant clinical notes and lab values.", agent_2_insight_1: "Entresto PA typically requires documentation of Lisinopril trial/failure or intolerance. Expedited review possible with peer-to-peer.", agent_2_insight_2: "Alternative ARNI, Sacubitril/Valsartan, may have similar PA requirements. Estimated approval timeline for Entresto is 3-5 days." },
      { name: "Discharge Coordination Agent", specialty: "Continuity of Care & Readmission Prevention", agent_3_confidence_score: "0.78", agent_3_planningContribution: "Suggests home health referral for medication management and CHF education post-discharge. Identifies need for follow-up PCP appointment within 7 days.", agent_3_evaluationContribution: "Recommends assessing patient's ability to obtain medications and transportation for follow-up. Confirms DME needs (e.g., walker, scale).", agent_3_insight_1: "Patient has strong family support, which is beneficial for home care. Identified local pharmacy for medication synchronization.", agent_3_insight_2: "Flagged patient for telephonic follow-up 48 hours post-discharge by care manager to address any early issues." }
    ],
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
    
    nursingDiagnoses: diagnosisNames.map((name, index) => ({
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
      goals: createGoals(5, name),
      interventions: createInterventions(15, name),
    })),

    evaluations: [
      { evaluation_goal_description_ref: "Fluid Volume Excess - Goal 1 (Patient will achieve improved fluid balance...)", evaluation_date: randomDate(), evaluation_status: "Partially Met", evaluation_evidence: "Edema decreased from 2+ to 1+ in RLE, LLE unchanged. Lung sounds show slight improvement (crackles to 1/3 up). Urine output 800mL in last 8hrs post-Furosemide.", evaluation_revision: "Continue current plan, consider additional PRN diuretic if no further improvement by next shift. Reinforce fluid restriction education.", evaluation_rationale: "Partial progress indicates effectiveness of diuretic, but further intervention may be needed to achieve target outcomes. Ongoing monitoring is key." },
      { evaluation_goal_description_ref: "Activity Intolerance - Goal 1 (Patient will report improved activity tolerance...)", evaluation_date: randomDate(), evaluation_status: "In Progress", evaluation_evidence: "Patient reports slight improvement in dyspnea with minimal activity (ambulated 20ft with standby assist). States 'feeling a bit stronger'.", evaluation_revision: "Encourage gradual increase in activity as tolerated. Cluster care to allow for rest periods. Consult PT.", evaluation_rationale: "Positive subjective report, but objective measures still limited. Phased approach to activity essential." },
      { evaluation_goal_description_ref: "Ineffective Airway Clearance - Goal 1 (Patient will maintain clear, open airways...)", evaluation_date: randomDate(), evaluation_status: "Met", evaluation_evidence: "Lungs clear to auscultation bilaterally. Patient effectively coughing. O2 sat >95% on RA. Denies SOB.", evaluation_revision: "Continue monitoring, encourage incentive spirometry.", evaluation_rationale: "Interventions successful in mobilizing secretions and improving oxygenation." },
      { evaluation_goal_description_ref: "Anxiety - Goal 1 (Patient will report reduced anxiety...)", evaluation_date: randomDate(), evaluation_status: "Ongoing", evaluation_evidence: "Patient verbalized understanding of treatment plan. Appears calmer but still expresses some worry about discharge.", evaluation_revision: "Provide further reassurance. Explore specific discharge concerns. Offer relaxation techniques.", evaluation_rationale: "Addressing anxiety is crucial for patient cooperation and overall well-being. Focus on coping mechanisms." },
      { evaluation_goal_description_ref: "Risk for Impaired Skin Integrity - Goal 1 (Patient's skin will remain intact...)", evaluation_date: randomDate(), evaluation_status: "Met", evaluation_evidence: "Skin remains intact, no redness or breakdown noted over pressure points. Edema slightly reduced.", evaluation_revision: "Continue preventative measures (q2h turns, skin assessment).", evaluation_rationale: "Proactive interventions successfully mitigated risk factors. Vigilance required due to ongoing edema." }
    ],
    
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
    className={`flex items-center px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 whitespace-nowrap group ${
      active
        ? 'bg-gradient-to-r from-blue-500 to-teal-600 text-white shadow-lg ring-2 ring-offset-2 ring-offset-slate-700 ring-blue-400' // Dark mode active tab
        : 'bg-slate-600 text-slate-300 hover:bg-slate-500 hover:border-slate-400 border border-slate-500' // Dark mode inactive tab
    }`}
    onClick={() => { onClick(); if(anonClick) anonClick(label); }}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-2.5 transition-colors duration-300 ${active ? 'text-white' : 'text-blue-400 group-hover:text-teal-400'}` } as any)}
    {label}
  </button>
);

const SectionHeader = ({ title, icon, expanded, onToggle, actionButton }: { title: string; icon: ReactNode; expanded: boolean; onToggle: () => void; actionButton?: ReactNode }) => (
  <div
    className={`flex justify-between items-center p-5 rounded-t-lg cursor-pointer transition-all duration-300 ease-in-out ${
      expanded ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-b border-slate-600' // Dark mode collapsed header
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center min-w-0 mr-3">
      {React.cloneElement(icon as React.ReactElement<any>, { className: `mr-3 transition-colors duration-300 ${expanded ? 'text-white' : 'text-blue-400'} flex-shrink-0` } as any)}
      <h3 className="font-semibold text-xl truncate" title={title}>{title}</h3>
    </div>
    <div className="flex items-center flex-shrink-0">
      {actionButton && <div className="mr-3">{actionButton}</div>}
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
    <div className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600 flex items-start hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"> {/* Dark mode InfoCard */}
      <div className={`rounded-lg p-3.5 mr-5 ${colorClasses[safeColor]} flex-shrink-0`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 } as any)}
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium text-slate-400 truncate">{label}</p>
        <p className="font-semibold text-slate-100 text-xl truncate" title={String(value || '')}>{value || <span className="italic text-slate-500">N/A</span>}</p>
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

const AgentCard = ({ agent, isExpanded, onToggle, section }: { agent: AgentType; isExpanded: boolean; onToggle: () => void; section: ActiveTabType }) => {
  const agentName = agent?.name || 'Unknown Agent';
  const agentSpecialty = agent?.specialty || 'Unknown Specialty';
  const confidenceKey = Object.keys(agent || {}).find(k => k.includes('confidence') || k.endsWith('_confidence_score')) || 'confidence';
  const agentConfidence = agent && confidenceKey && agent[confidenceKey] ? (typeof agent[confidenceKey] === 'string' ? parseFloat(agent[confidenceKey] as string) || 0 : typeof agent[confidenceKey] === 'number' ? agent[confidenceKey] as number : 0) : 0;

  // Agent card styling is mostly gradient based which works well in dark mode, expanded content bg needs adjustment
  const getAgentStyling = (name: string) => {
    name = (name || '').toLowerCase();
    // Dark mode background for expanded content, keeping headers similar
    if (name.includes('clinical')) return { border: 'border-blue-500', bg: 'bg-blue-900 bg-opacity-30', header: 'from-blue-500 to-blue-600', iconColor: 'text-blue-300', icon: <Activity className="text-white" size={24}/> };
    if (name.includes('authorization') || name.includes('benefits')) return { border: 'border-purple-500', bg: 'bg-purple-900 bg-opacity-30', header: 'from-purple-500 to-purple-600', iconColor: 'text-purple-300', icon: <Shield className="text-white" size={24}/> };
    if (name.includes('discharge') || name.includes('coordination')) return { border: 'border-green-500', bg: 'bg-green-900 bg-opacity-30', header: 'from-green-500 to-green-600', iconColor: 'text-green-300', icon: <Users className="text-white" size={24}/> };
    return { border: 'border-slate-500', bg: 'bg-slate-800', header: 'from-slate-500 to-slate-600', iconColor: 'text-slate-300', icon: <Zap className="text-white" size={24}/> };
  };
  const styles = getAgentStyling(agentName);

  const getContributionField = (agentData: AgentType, currentSection: ActiveTabType): string | React.ReactNode => {
      if (currentSection === 'overview') {
        return "Provides overall strategic insights and flags critical path items across the care continuum.";
      }
      if (currentSection === 'sources') {
        return "Agent may cite sources; direct contribution to this tab is through evidence provided.";
      }
      const fieldMap: Record<Exclude<SectionType, 'sources'>, string> = {
        assessment: 'assessmentContribution', diagnosis: 'diagnosisContribution', implementation: 'implementationContribution', evaluation: 'evaluationContribution',
      };
      const suffix = fieldMap[currentSection as Exclude<SectionType, 'sources'>];
      const contributionKey = Object.keys(agentData).find(k => k.endsWith(suffix));
      return contributionKey
        ? (agentData[contributionKey] as string || <span className="italic text-slate-400">No specific contribution for this section.</span>)
        : <span className="italic text-slate-400">N/A</span>;
    };

  const insightKeys = Object.keys(agent).filter(k => k.includes('_insight_'));
  const insights = insightKeys.map(key => agent[key]).filter(Boolean);

  return (
    <div className={`bg-slate-700 rounded-xl shadow-lg overflow-hidden border ${isExpanded ? `ring-2 ring-offset-2 ring-offset-slate-800 ${styles.border.replace('border-', 'ring-')}` : styles.border} hover:shadow-xl transition-all duration-300 ease-in-out`}> {/* Dark mode base */}
      <div className={`bg-gradient-to-r ${styles.header} px-5 py-4 text-white flex justify-between items-center cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center min-w-0 mr-3">
          <div className="p-2.5 bg-white bg-opacity-25 rounded-lg mr-4 shadow-inner flex-shrink-0">{styles.icon}</div>
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
        <div className={`p-5 space-y-5 border-t-2 ${styles.border} ${styles.bg}`}> {/* Expanded content bg from styles */}
          <div className={`rounded-lg p-4 border ${styles.border} bg-slate-600 shadow-sm`}> {/* Dark mode inner box */}
            <div className="font-semibold text-slate-100 text-lg mb-2.5 flex items-center">
              <Palette size={18} className="mr-2.5 text-slate-300" /> {section.charAt(0).toUpperCase() + section.slice(1)} Contribution:
            </div>
            <p className="text-base text-slate-200 leading-relaxed">{getContributionField(agent, section)}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-slate-100 mb-3 flex items-center"><Zap size={18} className="mr-2 text-amber-400" /> AI Insights</h5>
            {insights.length > 0 ? (
              <ul className="space-y-2.5">
                {insights.map((insight, idx) => (
                  <li key={idx} className="text-base text-slate-200 flex items-start p-3 bg-slate-600 border border-slate-500 rounded-md shadow-xs hover:shadow-sm">
                    <ArrowRight size={16} className="text-amber-500 mr-2.5 mt-1 flex-shrink-0" /> {insight || 'N/A'}
                  </li>
                ))}
              </ul>
            ) : <div className="text-base text-slate-400 italic p-3 bg-slate-600 border border-slate-500 rounded-md">No insights provided for this agent.</div>}
          </div>
           <div className="mt-4 pt-4 border-t border-slate-500">
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
    <div className="border border-slate-600 rounded-xl shadow-lg mb-6 bg-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"> {/* Dark mode base */}
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
          <div className="text-center flex-shrink-0 ml-5 p-3 bg-blue-800 bg-opacity-50 rounded-lg border border-blue-700"> {/* Dark mode confidence box */}
            <div className="text-4xl font-bold text-blue-300">{(paConfidence * 100).toFixed(0)}%</div>
            <div className="text-sm text-slate-200">Approval Conf.</div>
          </div>
      </div>
      <div className="p-5 bg-slate-700"> {/* Dark mode criteria section */}
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
        <div className="p-4 bg-green-800 border-t border-green-700 flex justify-between items-center text-sm text-green-200 font-medium">
          <span><CheckCircle size={16} className="inline mr-1.5" />Approved: {paApprovedDate}</span> <span><Calendar size={16} className="inline mr-1.5" />Expires: {paExpirationDate}</span>
        </div>
      )}
      { (paStatus.toLowerCase() === 'in progress' || paStatus.toLowerCase() === 'pending submission') && paEstResponse && (
          <div className="p-4 bg-amber-800 border-t border-amber-700 flex justify-between items-center text-sm text-amber-200 font-medium">
          <span><Clock size={16} className="inline mr-1.5 animate-spin" />Est. Response: {paEstResponse}</span>
        </div>
      )}
      {onUpdateStatus && ( // Buttons generally keep their high contrast style
        <div className="p-4 bg-slate-600 border-t border-slate-500 space-x-3 text-right clear-both">
          {paStatus.toLowerCase() === 'pending submission' && (
            <button onClick={() => onUpdateStatus(paId, 'In Progress')} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center float-left">
              <Send size={14} className="mr-1.5"/> Simulate Submit
            </button>
          )}
          {paStatus.toLowerCase() === 'in progress' && (
            <>
              <button onClick={() => onUpdateStatus(paId, 'Approved')} className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center inline-flex">
                <ThumbsUp size={14} className="mr-1.5"/> Simulate Approve
              </button>
              <button onClick={() => onUpdateStatus(paId, 'Denied')} className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center inline-flex">
                <ThumbsDown size={14} className="mr-1.5"/> Simulate Deny
              </button>
            </>
          )}
          {(paStatus.toLowerCase() === 'approved' || paStatus.toLowerCase() === 'denied') && (
              <button onClick={() => onUpdateStatus(paId, 'Pending Submission')} className="text-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center float-left">
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
          <div className="bg-slate-700 rounded-xl p-5 border border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"> {/* Dark mode base */}
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center min-w-0">
                      {getSourceIcon(sourceType)}
                      <h4 className="font-semibold text-slate-100 text-lg truncate" title={sourceTitle}>{sourceTitle}</h4>
                  </div>
                  <span className="text-sm text-slate-300 bg-slate-600 px-3 py-1.5 rounded-md font-medium flex-shrink-0 ml-3">{sourceType}</span>
              </div>
              <p className="text-base text-slate-300 mb-4 italic leading-relaxed">"{sourceSnippet}"</p>
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
     <div className="fixed top-24 right-5 bg-slate-800 rounded-xl shadow-2xl border border-blue-500 p-5 w-96 z-50 animate-fade-in-down transition-all duration-300"> {/* Dark mode base */}
       <div className="flex items-start">
         <div className="bg-blue-700 rounded-full p-2.5 mr-3.5 flex-shrink-0 border-2 border-blue-600"> {/* Dark mode icon container */}
           <AlertTriangle size={24} className="text-blue-200" /> {/* Dark mode icon color */}
         </div>
         <div className="flex-grow">
           <h4 className="font-bold text-lg text-slate-100">{title}</h4>
           <p className="text-sm text-slate-300 my-2 leading-relaxed">{message}</p>
           <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600"> {/* Dark mode border */}
             {detail1 && <span className="text-xs text-red-200 font-semibold bg-red-700 bg-opacity-50 px-2 py-1 rounded">{detail1}</span>} {/* Dark mode detail badge */}
             {detail2 && (
                 <span className="text-xs text-green-200 font-semibold bg-green-700 bg-opacity-50 px-2 py-1 rounded flex items-center"> {/* Dark mode detail badge */}
                   <CheckCircle size={14} className="mr-1.5 text-green-300" /> {detail2}
                 </span>
             )}
           </div>
         </div>
         <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-700"> {/* Dark mode close button */}
           <X size={20} />
         </button>
       </div>
     </div>
   );
}

const SkeletonLoader = () => ( // Skeleton colors also need adjustment for dark mode context if any
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
  const [activeTab, setActiveTab] = useState<ActiveTabType>('kanban');
  const [currentData, setCurrentData] = useState<CarePlanJsonData | null>(null);
  
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

  // Generate Kanban epics and tasks from diagnoses, goals, interventions, and evaluations
  useEffect(() => {
    if (!currentData) return;

    const newEpics: KanbanEpic[] = [];
    const newTasks: KanbanTask[] = [];
    const initialExpandedState: Record<string, boolean> = {};

    // Create epics from nursing diagnoses and goals
    if (currentData.nursingDiagnoses && currentData.nursingDiagnoses.length > 0) {
      currentData.nursingDiagnoses.forEach((diagnosis, dIndex) => {
        // For each diagnosis, create one epic per goal
        if (diagnosis.goals && diagnosis.goals.length > 0) {
          diagnosis.goals.forEach((goal, gIndex) => {
            const epicId = `epic-${dIndex}-${gIndex}`;

            // Set initial expanded state for first epic to true
            initialExpandedState[epicId] = dIndex === 0 && gIndex === 0;

            newEpics.push({
              id: epicId,
              title: goal.goal_description || `Goal for ${diagnosis.diagnosis_nanda}`,
              description: goal.goal_rationale || `Related to ${diagnosis.diagnosis_related_to || 'diagnosis'}`,
              goalTargetDate: goal.goal_target_date,
              diagnosisId: `diagnosis-${dIndex}`,
              diagnosisName: diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`,
              tasks: [] // Will populate after creating all tasks
            });

            // Create tasks for this goal from interventions
            if (diagnosis.interventions && diagnosis.interventions.length > 0) {
              diagnosis.interventions.forEach((intervention, iIndex) => {
                const taskId = `intervention-${dIndex}-${gIndex}-${iIndex}`;
                const task: KanbanTask = {
                  id: taskId,
                  title: intervention.intervention_action?.substring(0, 50) + (intervention.intervention_action && intervention.intervention_action.length > 50 ? '...' : '') || 'Unnamed intervention',
                  description: `${intervention.intervention_action || ''} - ${intervention.intervention_rationale || ''}`,
                  status: intervention.intervention_is_pending ? 'todo' : 'in-progress',
                  priority: iIndex % 3 === 0 ? 'high' : iIndex % 3 === 1 ? 'medium' : 'low',
                  type: 'intervention',
                  epicId: epicId,
                  epicName: goal.goal_description?.substring(0, 30) || `Goal for ${diagnosis.diagnosis_nanda}`,
                  dueDate: goal.goal_target_date || new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 86400000).toISOString().split('T')[0],
                  createdAt: new Date().toISOString(),
                  details: { intervention, diagnosisIndex: dIndex, goalIndex: gIndex, interventionIndex: iIndex }
                };
                newTasks.push(task);
              });
            }

            // Create evaluation tasks for this goal
            if (currentData.evaluations) {
              const matchingEvaluations = currentData.evaluations.filter(
                ev => ev.evaluation_goal_description_ref &&
                      ev.evaluation_goal_description_ref.includes(goal.goal_description || '')
              );

              matchingEvaluations.forEach((evaluation, eIndex) => {
                const taskId = `evaluation-${dIndex}-${gIndex}-${eIndex}`;
                const task: KanbanTask = {
                  id: taskId,
                  title: `Evaluate: ${goal.goal_description?.substring(0, 40) || 'Goal progress'}`,
                  description: `${evaluation.evaluation_evidence || 'Evaluate progress towards goal'} - ${evaluation.evaluation_revision || 'Determine if revisions needed'}`,
                  status: evaluation.evaluation_status?.toLowerCase() === 'met' ? 'completed' :
                          evaluation.evaluation_status?.toLowerCase() === 'in progress' ||
                          evaluation.evaluation_status?.toLowerCase() === 'ongoing' ? 'in-progress' :
                          evaluation.evaluation_status?.toLowerCase() === 'partially met' ? 'review' : 'todo',
                  priority: 'high',
                  type: 'evaluation',
                  epicId: epicId,
                  epicName: goal.goal_description?.substring(0, 30) || `Goal for ${diagnosis.diagnosis_nanda}`,
                  dueDate: goal.goal_target_date || new Date(Date.now() + (Math.floor(Math.random() * 3) + 1) * 86400000).toISOString().split('T')[0],
                  createdAt: new Date().toISOString(),
                  details: { evaluation, diagnosisIndex: dIndex, goalIndex: gIndex }
                };
                newTasks.push(task);
              });
            }
          });
        } else {
          // If no goals, create one epic for the diagnosis
          const epicId = `epic-diagnosis-${dIndex}`;
          initialExpandedState[epicId] = dIndex === 0;

          newEpics.push({
            id: epicId,
            title: `${diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`}`,
            description: diagnosis.diagnosis_related_to || 'No related factors specified',
            diagnosisId: `diagnosis-${dIndex}`,
            diagnosisName: diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`,
            tasks: [] // Will populate after creating all tasks
          });

          // Create tasks for this diagnosis from interventions
          if (diagnosis.interventions && diagnosis.interventions.length > 0) {
            diagnosis.interventions.forEach((intervention, iIndex) => {
              const taskId = `intervention-no-goal-${dIndex}-${iIndex}`;
              const task: KanbanTask = {
                id: taskId,
                title: intervention.intervention_action?.substring(0, 50) + (intervention.intervention_action && intervention.intervention_action.length > 50 ? '...' : '') || 'Unnamed intervention',
                description: `${intervention.intervention_action || ''} - ${intervention.intervention_rationale || ''}`,
                status: intervention.intervention_is_pending ? 'todo' : 'in-progress',
                priority: iIndex % 3 === 0 ? 'high' : iIndex % 3 === 1 ? 'medium' : 'low',
                type: 'intervention',
                epicId: epicId,
                epicName: diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`,
                dueDate: new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                details: { intervention, diagnosisIndex: dIndex, interventionIndex: iIndex }
              };
              newTasks.push(task);
            });
          }
        }
      });
    }

    // Create assessment tasks
    if (currentData.assessment_objective_vitals_summary || currentData.assessment_objective_physical_exam) {
      // Create an assessment epic
      const assessmentEpicId = 'epic-assessment';
      initialExpandedState[assessmentEpicId] = true;

      newEpics.push({
        id: assessmentEpicId,
        title: 'Patient Assessment',
        description: 'Tasks related to ongoing patient assessment and monitoring',
        diagnosisId: 'assessment-general',
        diagnosisName: 'Assessment',
        tasks: [] // Will populate after creating all tasks
      });

      // Create vital signs assessment task
      if (currentData.assessment_objective_vitals_summary) {
        newTasks.push({
          id: 'assessment-vitals',
          title: 'Monitor and reassess vital signs',
          description: 'Regular monitoring of patient vital signs including BP, HR, RR, O2sat and pain level',
          status: 'todo',
          priority: 'high',
          type: 'assessment',
          epicId: assessmentEpicId,
          epicName: 'Patient Assessment',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }

      // Create physical exam assessment task
      if (currentData.assessment_objective_physical_exam) {
        newTasks.push({
          id: 'assessment-physical',
          title: 'Complete follow-up physical assessment',
          description: 'Perform comprehensive physical assessment to track changes in patient condition',
          status: 'todo',
          priority: 'medium',
          type: 'assessment',
          epicId: assessmentEpicId,
          epicName: 'Patient Assessment',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }
    }

    // Add some completed tasks for visual variety
    if (newTasks.length > 4) {
      const randomIndex = Math.floor(Math.random() * newTasks.length);
      newTasks[randomIndex].status = 'completed';

      if (newTasks.length > 8) {
        const anotherRandomIndex = Math.floor(Math.random() * newTasks.length);
        if (anotherRandomIndex !== randomIndex) {
          newTasks[anotherRandomIndex].status = 'review';
        }
      }
    }

    // Populate epic tasks arrays
    newEpics.forEach(epic => {
      epic.tasks = newTasks.filter(task => task.epicId === epic.id);
    });

    setKanbanEpics(newEpics);
    setKanbanTasks(newTasks);
    setFilteredTasks(newTasks);
    setExpandedEpics(initialExpandedState);

    // Set default selected epic to the first one
    if (newEpics.length > 0) {
      setSelectedEpic(newEpics[0].id);
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
  const evaluations = adpieData?.evaluations || [];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 py-6 antialiased text-slate-200"> {/* Base dark background and text color */}
      <NotificationPopup 
        {...notificationContent}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-teal-600 p-6 rounded-xl shadow-xl text-white mb-8 flex justify-between items-center flex-wrap gap-y-4"> {/* Darker gradient for header */}
          <div className="flex items-center">
            <div className="bg-white bg-opacity-10 p-3 rounded-lg text-white mr-4 shadow-md">
              <Shield size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Ron AI</h1>
              <p className="text-white text-opacity-90 text-md">AI-Powered Comprehensive Plan of Care</p>
            </div>
          </div>
          <div className="flex space-x-3 items-center">
            {enableSimulations && (
                <button
                    onClick={() => triggerNotification("Sample System Alert", "This is a test notification to demonstrate the popup feature.", "Category: System", "Severity: Info")}
                    className="bg-white bg-opacity-10 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-white border-opacity-20 hover:bg-opacity-20 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
                    title="Trigger Sample Notification"
                >
                    <Bell size={16} className="mr-2 text-white opacity-80" /> Test Notify
                </button>
            )}
            <button
              className={`relative bg-white bg-opacity-10 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-white border-opacity-20 hover:bg-opacity-20 flex items-center shadow-md hover:shadow-lg transition-all duration-200 ${showPriorAuth ? 'ring-2 ring-white ring-opacity-40' : ''}`}
              onClick={togglePriorAuth} title="Toggle Prior Authorizations Panel" >
              <Shield size={16} className="mr-2 text-white opacity-80" /> Prior Auth
              {pendingPaCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md animate-bounce">{pendingPaCount}</span>
              )}
            </button>
            <button onClick={() => console.log("Communicate action triggered")} className="bg-white bg-opacity-10 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-white border-opacity-20 hover:bg-opacity-20 flex items-center shadow-md hover:shadow-lg transition-all duration-200" title="Communicate with Team">
              <MessageCircle size={16} className="mr-2 text-white opacity-80" /> Communicate
            </button>
            <button onClick={() => console.log("Export action triggered. Data:", currentData)} className="bg-white bg-opacity-10 text-white px-4 py-2.5 rounded-lg text-sm font-medium border border-white border-opacity-20 hover:bg-opacity-20 flex items-center shadow-md hover:shadow-lg transition-all duration-200" title="Export Care Plan">
              <Download size={16} className="mr-2 text-white opacity-80" /> Export
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`w-full ${showPriorAuth ? 'lg:w-3/5 xl:w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 mb-6"> {/* Main content card dark bg */}
              <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 px-6 py-5 text-white"> {/* Patient header gradient, can stay similar */}
                <div className="flex justify-between items-start flex-wrap gap-y-3">
                  <div>
                    <h2 className="text-3xl font-bold">{patientInfo.patient_full_name || <span className="italic text-slate-300">N/A</span>}</h2>
                    <p className="text-white text-opacity-90 text-sm mt-1">
                      {patientInfo.patient_age || 'N/A'} y.o. {patientInfo.patient_gender || 'N/A'} • MRN: {patientInfo.patient_mrn || 'N/A'} • Admitted: {patientInfo.patient_admission_date || 'N/A'}
                    </p>
                    {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                        <span className="text-xs text-red-200 mt-1.5 bg-red-700 bg-opacity-40 ring-1 ring-red-500 px-2.5 py-1 rounded-full font-medium inline-flex items-center"> {/* Dark mode allergy badge */}
                            <AlertTriangle size={12} className="inline mr-1.5" /> Allergies: {patientInfo.allergies.join(', ')}
                        </span>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-10 px-4 py-2.5 rounded-xl backdrop-blur-sm text-right max-w-sm shadow-md"> {/* Darker diagnosis box */}
                    <div className="text-sm opacity-70 mb-1">Primary Diagnosis</div>
                    <div className="font-semibold text-lg">{clinicalInfo.primary_diagnosis_text || <span className="italic text-slate-300">N/A</span>}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-b border-slate-700 bg-slate-700"> {/* Tab bar dark bg */}
                  <div className="flex space-x-3 overflow-x-auto pb-3 no-scrollbar">
                    <TabButton active={activeTab === 'kanban'} icon={<BarChart2 size={18} />} label="Task Board" onClick={() => handleTabChange('kanban', 'Task Board')} />
                    <TabButton active={activeTab === 'overview'} icon={<Clipboard size={18} />} label="Overview" onClick={() => handleTabChange('overview', 'Overview')} />
                    <TabButton active={activeTab === 'assessment'} icon={<FileCheck size={18} />} label="Assessment" onClick={() => handleTabChange('assessment', 'Assessment')} />
                    <TabButton active={activeTab === 'diagnosis'} icon={<AlertCircle size={18} />} label="Diagnosis & Goals" onClick={() => handleTabChange('diagnosis', 'Diagnosis & Goals')} />
                    <TabButton active={activeTab === 'implementation'} icon={<ListChecks size={18} />} label="Interventions" onClick={() => handleTabChange('implementation', 'Interventions')} />
                    <TabButton active={activeTab === 'evaluation'} icon={<Star size={18} />} label="Evaluation" onClick={() => handleTabChange('evaluation', 'Evaluation')} />
                    <TabButton active={activeTab === 'sources'} icon={<Link size={18} />} label="Sources" onClick={() => handleTabChange('sources', 'Sources')} />
                  </div>
              </div>

              <div className="p-8 bg-slate-800 min-h-[450px]" key={activeTabKey}> {/* Tab content area dark bg */}
                {activeTab === 'overview' && (
                  <div className={`space-y-10 ${isMounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InfoCard icon={<User size={22} />} label="Primary Provider" value={patientInfo.patient_primary_provider} color="blue" />
                      <InfoCard icon={<Shield size={22} />} label="Insurance Plan" value={patientInfo.patient_insurance_plan} color="indigo" />
                      <InfoCard icon={<Activity size={22} />} label="Severity / NYHA Class" value={patientInfo.nyha_class_description} color="purple" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-slate-100">Vital Signs (Latest)</h3>
                        {enableSimulations && (
                          <button 
                            onClick={handleRefreshVitals} 
                            disabled={isRefreshingVitals}
                            className="text-sm bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center disabled:opacity-50"
                          >
                            {isRefreshingVitals ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                            {isRefreshingVitals ? 'Refreshing...' : 'Refresh Vitals'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                        {patientInfo.vitalSigns && Object.keys(patientInfo.vitalSigns).length > 0
                          ? Object.entries(patientInfo.vitalSigns).map(([key, value]) => (
                          <div key={key} className="bg-slate-700 p-4 rounded-xl border border-slate-600 text-center shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-blue-500"> {/* Dark mode vital card */}
                            <div className="text-sm text-slate-400 mb-1.5 uppercase tracking-wider">{key.replace('vital_', '').replace('_', ' ') === 'o2sat' ? 'O₂ Sat' : key.replace('vital_', '').replace('_', ' ')}</div>
                            <div className="font-semibold text-slate-100 text-xl">{value || <span className="italic text-slate-500">N/A</span>}</div>
                          </div> ))
                          : <div className="col-span-full text-center text-slate-400 py-5 italic">No vital signs data available.</div>
                        }
                      </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4">Medications</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-3 styled-scrollbar">
                                {clinicalInfo.medications && clinicalInfo.medications.length > 0 ? clinicalInfo.medications.map((med, idx) => (
                                    <div key={`med-${idx}`} className="flex justify-between items-center bg-slate-700 p-4 rounded-xl border border-slate-600 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-purple-500"> {/* Dark mode med card */}
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
                                                <button onClick={() => handleAdministerMedication(med.med_n_name)} className="p-2 bg-green-700 hover:bg-green-600 rounded-full text-green-100 transition-colors" title="Simulate Administer"><PlayCircle size={18}/></button>
                                            }
                                        </div>
                                    </div>
                                )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center">No medications listed.</div>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-slate-100 mb-4">Treatments & Diagnostics</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-3 styled-scrollbar">
                                {clinicalInfo.treatments && clinicalInfo.treatments.length > 0 ? clinicalInfo.treatments.map((treatment, idx) => (
                                    <div key={`treat-${idx}`} className="flex justify-between items-center bg-slate-700 p-4 rounded-xl border border-slate-600 shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-teal-500"> {/* Dark mode treatment card */}
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
                        <h3 className="text-2xl font-semibold text-slate-100 mb-5">AI Agent Insights (Overview)</h3>
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
                        <div className="p-8 space-y-8 bg-slate-700"> {/* Dark mode content area */}
                           <div>
                             <h4 className="font-semibold text-xl text-slate-100 mb-4 flex items-center"><User size={20} className="mr-2.5 text-blue-400"/>Subjective Data</h4>
                             <div className="bg-blue-900 bg-opacity-30 rounded-lg p-5 border border-blue-700 shadow-sm space-y-3 text-base text-slate-200"> {/* Dark mode subjective box */}
                                <p><strong className="text-slate-100">Chief Complaint:</strong> {adpieData.assessment_subjective_chief_complaint || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">History of Present Illness:</strong> {adpieData.assessment_subjective_hpi || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Patient Goals/Concerns:</strong> {adpieData.assessment_subjective_goals || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Other Subjective Findings:</strong> {adpieData.assessment_subjective_other || <span className="italic text-slate-400">N/A</span>}</p>
                             </div>
                           </div>
                           <div>
                             <h4 className="font-semibold text-xl text-slate-100 mb-4 flex items-center"><Activity size={20} className="mr-2.5 text-green-400"/>Objective Data</h4>
                             <div className="bg-green-900 bg-opacity-30 rounded-lg p-5 border border-green-700 shadow-sm space-y-3 text-base text-slate-200"> {/* Dark mode objective box */}
                                <p><strong className="text-slate-100">Vital Signs Summary:</strong> {adpieData.assessment_objective_vitals_summary || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Physical Exam Findings:</strong> {adpieData.assessment_objective_physical_exam || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Diagnostic Test Results:</strong> {adpieData.assessment_objective_diagnostics || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Medications Reviewed:</strong> {adpieData.assessment_objective_meds_reviewed || <span className="italic text-slate-400">N/A</span>}</p>
                                <p><strong className="text-slate-100">Other Objective Findings:</strong> {adpieData.assessment_objective_other || <span className="italic text-slate-400">N/A</span>}</p>
                             </div>
                           </div>
                           <div className="pt-6 border-t border-slate-600">
                             <h4 className="font-semibold text-xl text-slate-100 mb-5">AI Agent Contributions & Insights (Assessment)</h4>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                          <div className="p-8 space-y-8 bg-purple-900 bg-opacity-20"> {/* Dark mode content area */}
                            <div className="bg-slate-600 p-5 rounded-lg border border-purple-500 shadow-sm text-base">
                                <p className="text-slate-200 mb-2"><strong className="text-purple-300">Related To:</strong> {dx.diagnosis_related_to || <span className="italic text-slate-400">N/A</span>}</p>
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
                                        <div key={`goal-${dxIndex}-${goalIndex}`} className="bg-slate-600 rounded-lg p-5 border border-purple-500 shadow-sm">
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
                               <h4 className="font-semibold text-xl text-slate-100 mb-5">AI Agent Contributions & Insights (Diagnosis/Goals)</h4>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                       <div key={`impl-${dxIndex}`} className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-teal-600"> {/* Dark mode section base */}
                         <SectionHeader 
                           title={`Interventions for: ${dx.diagnosis_nanda || `Diagnosis ${dxIndex + 1}`}`}
                           icon={<ListChecks size={22}/>} 
                           expanded={!!expandedSections[`implementation_${dxIndex}`]}
                           onToggle={() => toggleSection(`implementation_${dxIndex}`)} 
                         />
                         {expandedSections[`implementation_${dxIndex}`] && (
                           <div className="p-8 space-y-5 bg-teal-900 bg-opacity-20"> {/* Dark mode content area */}
                             <h4 className="font-semibold text-xl text-slate-100 mb-4 flex items-center"><Settings size={20} className="mr-2.5 text-teal-400"/>Nursing Interventions</h4>
                             <div className="space-y-4">
                               {dx.interventions && dx.interventions.length > 0 ? dx.interventions.map((int, intIndex) => (
                                 <div key={`int-${dxIndex}-${intIndex}`} className="bg-slate-600 rounded-lg p-5 border border-teal-500 shadow-sm"> {/* Dark mode intervention item */}
                                   <div className="flex justify-between items-start mb-2">
                                     <span className="font-semibold text-slate-100 text-lg">Intervention {intIndex + 1}: {int.intervention_action || <span className="italic text-slate-400">N/A</span>}</span>
                                     {int.intervention_is_pending && <StatusBadge status="Pending" />}
                                   </div>
                                   <p className="text-base text-slate-300"><strong className="text-slate-200">Rationale:</strong> {int.intervention_rationale || <span className="italic text-slate-400">N/A</span>}</p>
                                 </div>
                               )) : <div className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-teal-500 text-center">No interventions defined for this diagnosis.</div>}
                               {dx.interventions && dx.interventions.length > 0 && dx.interventions.length < 15 && <div className="text-base text-amber-400 italic p-3 text-center"></div>}
                             </div>
                             <div className="pt-6 border-t border-teal-500">
                               <h4 className="font-semibold text-xl text-slate-100 mb-5">AI Agent Contributions & Insights (Interventions)</h4>
                               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                 {agents.length > 0 ? agents.map((agent, idx) => (
                                   <AgentCard key={`agent-impl-${dxIndex}-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="implementation" />
                                 )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     )) : <div className="text-center p-10 text-slate-400 italic text-lg">No nursing diagnoses identified to display interventions for.</div>}
                     
                     <div className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-slate-600"> {/* Dark mode section base */}
                        <SectionHeader 
                          title="Interdisciplinary Plan Items" 
                          icon={<Users size={22}/>}
                          expanded={!!expandedSections.interdisciplinaryPlan}
                          onToggle={() => toggleSection('interdisciplinaryPlan')} 
                        />
                        {expandedSections.interdisciplinaryPlan && (
                            <div className="p-8 space-y-4 bg-slate-800"> {/* Dark mode content area */}
                                {interdisciplinaryPlan.length > 0 ? interdisciplinaryPlan.map((item, idx) => (
                                    <div key={`interdisc-${idx}`} className="text-base text-slate-200 bg-slate-700 p-4 rounded-md border border-slate-600 shadow-sm">
                                        <strong className="text-slate-100">{item.discipline}:</strong> {item.plan_item}
                                    </div>
                                )) : <div className="text-base text-slate-400 italic text-center p-5">No interdisciplinary items listed.</div>}
                            </div>
                        )}
                     </div>
                   </div>
                )}

                {activeTab === 'evaluation' && (
                  <div className={`animate-fade-in-up space-y-8`}>
                    <div className="bg-slate-700 rounded-xl shadow-lg overflow-hidden border border-amber-600"> {/* Dark mode section base */}
                      <SectionHeader 
                        title="Evaluation of Goals & Plan Summary" 
                        icon={<Star size={22}/>} 
                        expanded={!!expandedSections.evaluation} 
                        onToggle={() => toggleSection('evaluation')} 
                      />
                      {expandedSections.evaluation && (
                        <div className="p-8 space-y-6 bg-amber-900 bg-opacity-20"> {/* Dark mode content area */}
                          <h4 className="font-semibold text-xl text-slate-100 mb-4">Goal Evaluations</h4>
                          {evaluations.length > 0 ? evaluations.map((ev, evIndex) => (
                            <div key={`eval-${evIndex}`} className="bg-slate-600 rounded-lg p-5 border border-amber-500 shadow-sm"> {/* Dark mode evaluation item */}
                              <div className="font-semibold text-slate-100 mb-2.5 text-lg">Evaluation for Goal: {ev.evaluation_goal_description_ref || <span className="italic text-slate-400">N/A</span>}</div>
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-base text-slate-300">Date: {ev.evaluation_date || 'N/A'}</span>
                                <StatusBadge status={ev.evaluation_status || 'Unknown'} />
                              </div>
                              <p className="text-base text-slate-200 mb-1.5"><strong className="text-slate-100">Evidence:</strong> {ev.evaluation_evidence || <span className="italic text-slate-400">N/A</span>}</p>
                              {ev.evaluation_rationale && <p className="text-sm text-slate-300 mb-2 italic"><strong className="text-slate-200">Rationale:</strong> {ev.evaluation_rationale}</p>}
                              <p className="text-base text-slate-200"><strong className="text-slate-100">Plan Revision:</strong> {ev.evaluation_revision || <span className="italic text-slate-400">None</span>}</p>
                            </div>
                          )) : <div className="text-base text-slate-400 italic p-5 bg-slate-600 rounded-lg border border-amber-500 text-center"></div>}
                          {evaluations.length > 0 && evaluations.length < 5 && <div className="text-base text-amber-400 italic p-3 text-center"></div>}
                          
                          <div className="pt-6 mt-6 border-t border-amber-500">
                             <h4 className="font-semibold text-xl text-slate-100 mb-4">Overall Plan Summary</h4>
                             <p className="text-base text-slate-200 bg-slate-600 p-5 rounded-md border border-slate-500 shadow-sm mb-5 leading-relaxed">{adpieData.overall_plan_summary || <span className="italic text-slate-400">N/A</span>}</p>
                             
                             <h4 className="font-semibold text-xl text-slate-100 mb-4">Next Steps for Discharge & Claims</h4>
                             {nextSteps.length > 0 ? (
                                <ul className="list-decimal list-inside space-y-2 text-base text-slate-200 bg-slate-600 p-5 rounded-md border border-slate-500 shadow-sm">
                                  {nextSteps.map((step, i) => <li key={`next-${i}`}>{step}</li>)}
                                </ul>
                              ) : <p className="text-base italic text-slate-400 p-5 bg-slate-600 rounded-md border border-slate-500 shadow-sm">No next steps defined.</p>}
                          </div>

                          <div className="pt-6 border-t border-amber-500">
                            <h4 className="font-semibold text-xl text-slate-100 mb-5">AI Agent Contributions & Insights (Evaluation & Discharge)</h4>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              {agents.length > 0 ? agents.map((agent, idx) => (
                                <AgentCard key={`agent-eval-${idx}`} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="evaluation" />
                              )) : <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center xl:col-span-2">No AI agent contributions available.</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'kanban' && (
                  <div className={`animate-fade-in-up space-y-6`}>
                    <div className="bg-slate-700 rounded-xl shadow-lg mb-6 border border-slate-600">
                      <SectionHeader
                        title="Care Plan Task Board"
                        icon={<BarChart2 size={22} />}
                        expanded={!!expandedSections.kanban}
                        onToggle={() => toggleSection('kanban')}
                      />

                      {expandedSections.kanban && (
                        <div className="bg-slate-800">
                          <KanbanBoard
                            tasks={kanbanTasks}
                            epics={kanbanEpics}
                            enableSimulations={enableSimulations}
                            onTaskStatusChange={updateTaskStatus}
                            onTaskAssign={assignTaskToAgent}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'sources' && (
                    <div className={`animate-fade-in-up`}>
                      <div className="bg-slate-700 rounded-xl shadow-lg mb-6 border border-slate-600"> {/* Dark mode section base */}
                        <SectionHeader
                          title="Sources & Evidence Base"
                          icon={<Link size={22} />}
                          expanded={!!expandedSections.sources}
                          onToggle={() => toggleSection('sources')}
                        />
                        {expandedSections.sources && (
                          <div className="p-8 space-y-5 bg-slate-800 overflow-y-auto max-h-[650px] styled-scrollbar"> {/* Dark mode content area */}
                            {(() => {
                                const combinedSources: SourceData[] = [
                                  ...(topLevelCitations || []).map((url, index) => ({
                                    id: `web-${index + 1}`,
                                    title: url.length > 100 ? url.substring(0, 97) + "..." : url,
                                    type: 'Web Source',
                                    url: url,
                                    snippet: 'Retrieved during initial AI-powered web search for contextual information.',
                                    retrieval_date: new Date().toISOString().split('T')[0],
                                    agent_source: 'Contextual AI Search',
                                  })),
                                  ...(sources || [])
                                ];

                                if (process.env.NODE_ENV === 'development') console.log(`[CarePlanTemplate] Rendering Sources Tab. Combined sources count: ${combinedSources.length}`);

                                return combinedSources.length > 0 ? combinedSources.map((source, idx) => (
                                  <SourceCard key={source.id || `source-${idx}`} source={source} />
                                )) : (
                                  <div className="text-base text-slate-400 italic p-5 bg-slate-700 rounded-lg text-center border border-slate-600">
                                    No sources available for this care plan.
                                  </div>
                                );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {showPriorAuth && (
            <div className={`w-full lg:w-2/5 xl:w-1/3 bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700 transition-all duration-500 ease-in-out ${isMounted ? 'animate-slide-in-right' : 'opacity-0 translate-x-12'}`}> {/* Dark mode PA panel */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-slate-100 flex items-center">
                  <Shield size={24} className="mr-3 text-blue-400" /> Prior Authorizations
                </h3>
                <button onClick={togglePriorAuth} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-700 transition-colors"> <X size={22} /> </button>
              </div>
              <div className="space-y-6 max-h-[calc(100vh-230px)] overflow-y-auto pr-3 styled-scrollbar">
                {paItems.length > 0 ? paItems.map((item, idx) => (
                    <PriorAuthCard key={item.id || `pa-${idx}`} item={item} onUpdateStatus={enableSimulations ? handleUpdatePAStatus : undefined} />
                )) : <div className="text-base text-slate-400 text-center py-8 italic">No prior authorization items found.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; } /* slate-800 */
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; } /* slate-600 */
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; } /* slate-500 */

        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }

        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }

        @keyframes slide-in-right { 0% { opacity: 0; transform: translateX(30px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>
    </div>
  );
};

export default CarePlanTemplate;