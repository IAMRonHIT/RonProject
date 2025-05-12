/*
  Scenario Library
  Organized by Care Environment, each with specific Patient Scenarios.
  Each PatientScenario object follows the FormState schema and includes focusAreas.
*/
import {
  Hospital, Briefcase, Home, Brain, Activity, Stethoscope, UserPlus, HeartPulse, Users, HelpCircle
} from 'lucide-react'; // Assuming lucide-react for icons

export interface VitalSigns {
  vital_bp: string;
  vital_pulse: string;
  vital_resp_rate: string;
  vital_temp: string;
  vital_o2sat: string;
  vital_pain_score: string;
}

export interface FormState {
  patient_full_name: string;
  patient_age: string;
  patient_gender: string;
  patient_mrn: string;
  patient_dob: string;
  patient_insurance_plan: string;
  patient_policy_number: string;
  patient_primary_provider: string;
  patient_admission_date: string;
  allergies: string[];
  vitalSigns: VitalSigns;
  nyha_class_description: string;
  primary_diagnosis_text: string;
  secondaryDiagnoses: string[];
  labs: any[]; // Consider defining specific types for labs, meds, treatments
  medications: any[];
  treatments: any[];
  last_imaging_summary: string;
  last_ecg_summary: string;
}

export interface PatientScenario {
  name: string;
  description: string;
  data: FormState;
  focusAreas: string[]; // e.g., ["Discharge Planning", "Prior Auth"]
}

export interface CareEnvironment {
  id: string;
  name: string;
  icon: React.ElementType; // Lucide icon component
  scenarios: PatientScenario[];
}

// Helper to generate blank vitals
const blankVitals: VitalSigns = {
  vital_bp: "120/80 mmHg",
  vital_pulse: "80 bpm",
  vital_resp_rate: "16/min",
  vital_temp: "98.6°F", // 37°C
  vital_o2sat: "98%",
  vital_pain_score: "0/10",
};

const commonFocusAreas = ["Care Coordination", "Patient Education", "Medication Reconciliation"];
const complexCareFocusAreas = ["Prior Authorization", "Denial Prevention", "SDOH Assessment", "HEDIS Measures"];
const dischargeFocusAreas = ["Discharge Planning", "Readmission Prevention", "Continuity of Care"];
const wellnessFocusAreas = ["Preventative Wellness", "Health Promotion"];


// ---------- SCENARIOS BY ENVIRONMENT ----------
export const SCENARIOS_BY_ENVIRONMENT: CareEnvironment[] = [
  {
    id: "hospital",
    name: "Hospital (Inpatient)",
    icon: Hospital,
    scenarios: [
      {
        name: "CHF Exacerbation – NYHA III",
        description: "68-year-old male with systolic heart failure, dyspnea, and 3+ pitting edema.",
        data: {
          patient_full_name: "Larry Baker", patient_age: "68", patient_gender: "Male", patient_mrn: "MED001",
          patient_dob: "1957-05-08", patient_insurance_plan: "Medicare Advantage Plan B", patient_policy_number: "MED-001-AB",
          patient_primary_provider: "Dr. Clark Kent", patient_admission_date: "2025-05-02", allergies: ["Aspirin (GI upset)"],
          vitalSigns: { ...blankVitals, vital_bp: "150/90 mmHg", vital_pulse: "95 bpm", vital_resp_rate: "24/min", vital_o2sat: "92% on RA", vital_pain_score: "2/10 (chest discomfort)" },
          nyha_class_description: "NYHA Class III", primary_diagnosis_text: "Congestive Heart Failure Exacerbation",
          secondaryDiagnoses: ["Hypertension", "Type 2 Diabetes Mellitus"],
          labs: [{ lab_n_name: "BNP", lab_n_value: "1200 pg/mL", lab_n_flag: "HIGH", lab_n_trend: "increasing" }],
          medications: [{ med_n_name: "Furosemide", med_n_dosage: "40mg IV BID", med_n_route: "IV", med_n_frequency: "BID", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Oxygen Therapy", treatment_n_status: "Active", treatment_n_details: "2L via Nasal Cannula" }],
          last_imaging_summary: "CXR: Bilateral pleural effusions, cardiomegaly.", last_ecg_summary: "Sinus Tachycardia, LVH.",
        },
        focusAreas: [...commonFocusAreas, ...complexCareFocusAreas, ...dischargeFocusAreas, "Fluid Management"],
      },
      {
        name: "Sepsis – Pneumonia Source",
        description: "75-year-old female febrile, hypotensive with bilateral infiltrates, altered mental status.",
        data: {
          patient_full_name: "Paula Young", patient_age: "75", patient_gender: "Female", patient_mrn: "MED005",
          patient_dob: "1949-02-02", patient_insurance_plan: "Aetna Medicare PPO", patient_policy_number: "AET-MED-005",
          patient_primary_provider: "Dr. Alice Allen", patient_admission_date: "2025-05-01", allergies: ["Penicillin (rash)"],
          vitalSigns: { ...blankVitals, vital_bp: "85/50 mmHg", vital_pulse: "110 bpm", vital_resp_rate: "28/min", vital_temp: "102.5°F", vital_o2sat: "88% on 4L NC", vital_pain_score: "N/A (confused)" },
          nyha_class_description: "", primary_diagnosis_text: "Sepsis secondary to Community-Acquired Pneumonia",
          secondaryDiagnoses: ["Acute Respiratory Distress Syndrome (ARDS)", "Hypertension"],
          labs: [{ lab_n_name: "WBC", lab_n_value: "18.5 K/uL", lab_n_flag: "HIGH" }, { lab_n_name: "Lactate", lab_n_value: "4.2 mmol/L", lab_n_flag: "HIGH" }],
          medications: [{ med_n_name: "Piperacillin-Tazobactam", med_n_dosage: "3.375g IV q6h", med_n_status: "Active" }, { med_n_name: "Norepinephrine", med_n_dosage: "5 mcg/min IV infusion", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Mechanical Ventilation", treatment_n_status: "Active", treatment_n_details: "AC mode, FiO2 60%, PEEP 8" }],
          last_imaging_summary: "CXR: Dense bilateral consolidations.", last_ecg_summary: "Sinus Tachycardia.",
        },
        focusAreas: [...commonFocusAreas, ...complexCareFocusAreas, "Infection Control", "Hemodynamic Stability", "Ventilator Management"],
      },
      {
        name: "STEMI – Post PCI",
        description: "60-year-old male day 1 post LAD stent, managing anticoagulation and cardiac rehab planning.",
        data: {
          patient_full_name: "Oscar Diaz", patient_age: "60", patient_gender: "Male", patient_mrn: "MED004",
          patient_dob: "1965-11-12", patient_insurance_plan: "Humana Gold Plus HMO", patient_policy_number: "HUM-MED-004",
          patient_primary_provider: "Dr. Robert Roberts", patient_admission_date: "2025-05-02", allergies: ["Iodine (hives)"],
          vitalSigns: { ...blankVitals, vital_bp: "110/70 mmHg", vital_pulse: "65 bpm", vital_o2sat: "97% on RA", vital_pain_score: "1/10 (groin site)" },
          nyha_class_description: "", primary_diagnosis_text: "Acute ST-Elevation Myocardial Infarction (STEMI) - Post Percutaneous Coronary Intervention (PCI) to LAD",
          secondaryDiagnoses: ["Hyperlipidemia", "Essential Hypertension"],
          labs: [{ lab_n_name: "Troponin I", lab_n_value: "0.5 ng/mL", lab_n_flag: "HIGH", lab_n_trend: "decreasing" }],
          medications: [{ med_n_name: "Aspirin", med_n_dosage: "81mg PO Daily", med_n_status: "Active" }, { med_n_name: "Clopidogrel", med_n_dosage: "75mg PO Daily", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Cardiac Rehabilitation Referral", treatment_n_status: "Pending" }],
          last_imaging_summary: "Angiogram: Successful PCI with DES to mid LAD.", last_ecg_summary: "Normal Sinus Rhythm, Q waves in V1-V3.",
        },
        focusAreas: [...commonFocusAreas, ...complexCareFocusAreas, ...dischargeFocusAreas, "Cardiac Rehabilitation", "Anticoagulation Management"],
      },
    ],
  },
  {
    id: "asc",
    name: "Ambulatory Surgery Center (ASC)",
    icon: Briefcase,
    scenarios: [
      {
        name: "Knee Arthroscopy – Post-Op",
        description: "45-year-old patient, 2 hours post-op knee arthroscopy for meniscal tear.",
        data: {
          patient_full_name: "Alice Wonderland", patient_age: "45", patient_gender: "Female", patient_mrn: "ASC001",
          patient_dob: "1980-03-15", patient_insurance_plan: "Blue Cross Blue Shield PPO", patient_policy_number: "BCBS-ASC001",
          patient_primary_provider: "Dr. Cheshire", patient_admission_date: "2025-05-09", allergies: ["Codeine (nausea)"],
          vitalSigns: { ...blankVitals, vital_bp: "130/80 mmHg", vital_pulse: "70 bpm", vital_pain_score: "4/10 (knee)" },
          nyha_class_description: "", primary_diagnosis_text: "Post-operative care, knee arthroscopy",
          secondaryDiagnoses: ["Meniscal tear, right knee"],
          labs: [], medications: [{ med_n_name: "Oxycodone/Acetaminophen", med_n_dosage: "5/325mg PO q4-6h PRN pain", med_n_status: "Prescribed" }],
          treatments: [{ treatment_n_name: "Ice pack to right knee", treatment_n_status: "Active" }],
          last_imaging_summary: "Pre-op MRI: Complex tear of medial meniscus.", last_ecg_summary: "N/A",
        },
        focusAreas: ["Post-operative Pain Management", "Discharge Instructions", "Surgical Site Care", "Follow-up Appointment Scheduling"],
      },
    ],
  },
  {
    id: "homecare",
    name: "Home Health Care",
    icon: Home,
    scenarios: [
      {
        name: "Post-Stroke Rehab at Home",
        description: "70-year-old female, 2 weeks post-ischemic stroke, receiving home health services.",
        data: {
          patient_full_name: "Rosa Delgado", patient_age: "70", patient_gender: "Female", patient_mrn: "MED007",
          patient_dob: "1954-10-15", patient_insurance_plan: "Medicare Part A & B", patient_policy_number: "MED-007-AB",
          patient_primary_provider: "Dr. Olivia O'Neil", patient_admission_date: "2025-05-04", // Hospital admission
          allergies: [],
          vitalSigns: { ...blankVitals, vital_bp: "140/85 mmHg", vital_pulse: "78 bpm", vital_pain_score: "1/10 (shoulder)" },
          nyha_class_description: "", primary_diagnosis_text: "Home rehabilitation post Left MCA ischemic stroke",
          secondaryDiagnoses: ["Expressive Aphasia", "Right Hemiparesis", "Hypertension"],
          labs: [], medications: [{ med_n_name: "Atorvastatin", med_n_dosage: "40mg PO Daily", med_n_status: "Active" }, { med_n_name: "Lisinopril", med_n_dosage: "10mg PO Daily", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Physical Therapy", treatment_n_status: "Active", treatment_n_details: "3x/week" }, { treatment_n_name: "Speech Therapy", treatment_n_status: "Active", treatment_n_details: "2x/week" }],
          last_imaging_summary: "CT Head (2 weeks ago): Established left MCA infarct.", last_ecg_summary: "Normal Sinus Rhythm.",
        },
        focusAreas: [...commonFocusAreas, ...wellnessFocusAreas, "Fall Prevention", "ADL Assistance", "Caregiver Support", "SDOH Assessment (Home Safety)"],
      },
    ],
  },
  {
    id: "mental_health_inpatient",
    name: "Mental Health (Inpatient)",
    icon: Brain,
    scenarios: [
      {
        name: "Bipolar I – Acute Mania",
        description: "30-year-old male in acute manic episode requiring stabilization, safety planning.",
        data: {
          patient_full_name: "Brian Lee", patient_age: "30", patient_gender: "Male", patient_mrn: "MH001",
          patient_dob: "1995-06-12", patient_insurance_plan: "Aetna Behavioral Health", patient_policy_number: "AET-MH001",
          patient_primary_provider: "Dr. Priya Patel", patient_admission_date: "2025-05-08", allergies: [],
          vitalSigns: { ...blankVitals, vital_pulse: "100 bpm", vital_resp_rate: "20/min" },
          nyha_class_description: "", primary_diagnosis_text: "Bipolar I Disorder, current episode manic, severe with psychotic features",
          secondaryDiagnoses: ["Sleep Disturbance"],
          labs: [{ lab_n_name: "Lithium Level", lab_n_value: "0.3 mEq/L", lab_n_flag: "LOW (subtherapeutic)" }],
          medications: [{ med_n_name: "Olanzapine", med_n_dosage: "10mg IM stat, then 10mg PO BID", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Seclusion Protocol", treatment_n_status: "PRN", treatment_n_details: "For agitation/aggression" }],
          last_imaging_summary: "N/A", last_ecg_summary: "Sinus Tachycardia.",
        },
        focusAreas: ["Crisis Stabilization", "Safety Planning", "Medication Adherence", "Psychosocial Support", "Discharge Planning (Mental Health)"],
      },
      {
        name: "Schizophrenia – Acute Psychosis",
        description: "22-year-old female with acute exacerbation of hallucinations and delusions.",
        data: {
          patient_full_name: "Clara Jones", patient_age: "22", patient_gender: "Female", patient_mrn: "MH002",
          patient_dob: "2003-01-17", patient_insurance_plan: "Medicaid Managed Care", patient_policy_number: "MED-MH002-MC",
          patient_primary_provider: "Dr. David Yang", patient_admission_date: "2025-05-07", allergies: ["Penicillin (anaphylaxis)"],
          vitalSigns: blankVitals, nyha_class_description: "",
          primary_diagnosis_text: "Schizophrenia, paranoid type – acute exacerbation",
          secondaryDiagnoses: ["Social Isolation"],
          labs: [], medications: [{ med_n_name: "Risperidone Consta", med_n_dosage: "25mg IM q2weeks", med_n_status: "Due" }],
          treatments: [{ treatment_n_name: "Group Therapy", treatment_n_status: "Encouraged" }],
          last_imaging_summary: "N/A", last_ecg_summary: "N/A",
        },
        focusAreas: ["Reality Testing", "Symptom Management", "Medication Management (Long-acting injectable)", "Coping Skills Development", "Family Psychoeducation"],
      },
    ],
  },
  {
    id: "telehealth",
    name: "Telehealth",
    icon: Activity, // Placeholder, consider a more specific telehealth icon if available
    scenarios: [
      {
        name: "Hypertension Follow-up",
        description: "55-year-old patient for routine hypertension management via telehealth.",
        data: {
          patient_full_name: "John Smith", patient_age: "55", patient_gender: "Male", patient_mrn: "TELE001",
          patient_dob: "1970-01-01", patient_insurance_plan: "Anthem Blue Cross", patient_policy_number: "ANT-TELE001",
          patient_primary_provider: "Dr. Emily Carter", patient_admission_date: "N/A (Telehealth Visit)", allergies: ["None known"],
          vitalSigns: { ...blankVitals, vital_bp: "135/85 mmHg (patient reported)", vital_pulse: "72 bpm (patient reported)" },
          nyha_class_description: "", primary_diagnosis_text: "Essential Hypertension",
          secondaryDiagnoses: ["Hyperlipidemia"],
          labs: [{ lab_n_name: "Potassium", lab_n_value: "4.0 mEq/L (last month)" }],
          medications: [{ med_n_name: "Lisinopril", med_n_dosage: "20mg PO Daily", med_n_status: "Active" }, { med_n_name: "Amlodipine", med_n_dosage: "5mg PO Daily", med_n_status: "Active" }],
          treatments: [],
          last_imaging_summary: "N/A", last_ecg_summary: "N/A",
        },
        focusAreas: [...commonFocusAreas, ...wellnessFocusAreas, "Remote Patient Monitoring", "Lifestyle Modification Counseling", "Medication Adherence (Telehealth)"],
      },
    ],
  },
  {
    id: "hospice",
    name: "Hospice Care",
    icon: HeartPulse, // Placeholder, consider a more specific hospice icon
    scenarios: [
      {
        name: "End-Stage Pancreatic Cancer",
        description: "78-year-old patient with metastatic pancreatic cancer, focus on comfort care.",
        data: {
          patient_full_name: "Eleanor Vance", patient_age: "78", patient_gender: "Female", patient_mrn: "HOSP001",
          patient_dob: "1947-08-20", patient_insurance_plan: "Medicare Hospice Benefit", patient_policy_number: "MED-HOSP001",
          patient_primary_provider: "Dr. Michael Grey", patient_admission_date: "2025-04-15 (Hospice Admission)", allergies: ["Morphine (itching)"],
          vitalSigns: { ...blankVitals, vital_bp: "100/60 mmHg", vital_pulse: "90 bpm (weak)", vital_pain_score: "7/10 (abdominal)" },
          nyha_class_description: "", primary_diagnosis_text: "Metastatic Pancreatic Cancer - Hospice Care",
          secondaryDiagnoses: ["Cachexia", "Anxiety"],
          labs: [], medications: [{ med_n_name: "Fentanyl Patch", med_n_dosage: "50mcg/hr q72h", med_n_status: "Active" }, { med_n_name: "Lorazepam", med_n_dosage: "0.5mg SL PRN anxiety", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Spiritual Counseling", treatment_n_status: "Offered" }],
          last_imaging_summary: "CT Abdomen (1 month ago): Extensive liver metastases.", last_ecg_summary: "N/A",
        },
        focusAreas: ["Symptom Management (Pain, Nausea, Dyspnea)", "Psychosocial and Spiritual Support", "Family Bereavement Planning", "Advance Care Planning"],
      },
    ],
  },
  {
    id: "clinic",
    name: "Outpatient Clinic",
    icon: Stethoscope,
    scenarios: [
      {
        name: "Type 2 Diabetes Annual Check-up",
        description: "62-year-old patient for routine Type 2 Diabetes management and HEDIS measure review.",
        data: {
          patient_full_name: "George Miller", patient_age: "62", patient_gender: "Male", patient_mrn: "CLIN001",
          patient_dob: "1963-07-10", patient_insurance_plan: "UnitedHealthcare Navigate", patient_policy_number: "UHC-CLIN001",
          patient_primary_provider: "Dr. Susan Wright", patient_admission_date: "N/A (Clinic Visit)", allergies: ["Sulfa (rash)"],
          vitalSigns: { ...blankVitals, vital_bp: "138/88 mmHg" },
          nyha_class_description: "", primary_diagnosis_text: "Type 2 Diabetes Mellitus with neuropathy",
          secondaryDiagnoses: ["Hypertension", "Obesity"],
          labs: [{ lab_n_name: "HbA1c", lab_n_value: "7.8%", lab_n_flag: "HIGH" }, { lab_n_name: "eGFR", lab_n_value: "55 mL/min/1.73m²", lab_n_flag: "LOW" }],
          medications: [{ med_n_name: "Metformin", med_n_dosage: "1000mg PO BID", med_n_status: "Active" }, { med_n_name: "Gabapentin", med_n_dosage: "300mg PO TID", med_n_status: "Active" }],
          treatments: [{ treatment_n_name: "Diabetic foot exam", treatment_n_status: "Due" }, { treatment_n_name: "Retinal eye exam referral", treatment_n_status: "Pending" }],
          last_imaging_summary: "N/A", last_ecg_summary: "N/A",
        },
        focusAreas: [...commonFocusAreas, ...wellnessFocusAreas, "HEDIS Measure Compliance (Diabetes)", "Chronic Disease Self-Management", "Nutrition Counseling", "Preventative Screenings"],
      },
    ],
  },
  {
    id: "custom",
    name: "Custom Scenario",
    icon: UserPlus, // Or Edit3, Settings
    scenarios: [
      {
        name: "Build Your Own Scenario",
        description: "A blank template to create a custom patient scenario for care plan generation.",
        data: {
          patient_full_name: "", patient_age: "", patient_gender: "", patient_mrn: "",
          patient_dob: "", patient_insurance_plan: "", patient_policy_number: "",
          patient_primary_provider: "", patient_admission_date: "", allergies: [],
          vitalSigns: { vital_bp: "", vital_pulse: "", vital_resp_rate: "", vital_temp: "", vital_o2sat: "", vital_pain_score: "" },
          nyha_class_description: "", primary_diagnosis_text: "", secondaryDiagnoses: [],
          labs: [], medications: [], treatments: [],
          last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["User-Defined Focus 1", "User-Defined Focus 2"],
      },
    ],
  },
  {
    id: "pediatrics",
    name: "Pediatric Care",
    icon: Users, // Placeholder, consider a more specific pediatric icon
    scenarios: [
      {
        name: "Asthma Exacerbation - Child",
        description: "8-year-old child with acute asthma exacerbation, wheezing and dyspnea.",
        data: {
          patient_full_name: "Leo Chen", patient_age: "8", patient_gender: "Male", patient_mrn: "PED001",
          patient_dob: "2017-03-25", patient_insurance_plan: "Kaiser Permanente HMO", patient_policy_number: "KP-PED001",
          patient_primary_provider: "Dr. Emily Davis", patient_admission_date: "2025-05-09 (ED Visit)", allergies: ["Peanuts (anaphylaxis)"],
          vitalSigns: { ...blankVitals, vital_resp_rate: "30/min", vital_o2sat: "93% on RA", vital_pulse: "110 bpm" },
          nyha_class_description: "", primary_diagnosis_text: "Acute Asthma Exacerbation",
          secondaryDiagnoses: ["Allergic Rhinitis"],
          labs: [], medications: [{ med_n_name: "Albuterol Nebulizer", med_n_dosage: "2.5mg", med_n_status: "Administered in ED" }],
          treatments: [{ treatment_n_name: "Peak Flow Monitoring", treatment_n_status: "Initiated" }],
          last_imaging_summary: "N/A", last_ecg_summary: "N/A",
        },
        focusAreas: ["Pediatric Asthma Management", "Parental Education", "Allergen Avoidance", "School Action Plan"],
      },
    ],
  },
   {
    id: "other",
    name: "Other Scenarios",
    icon: HelpCircle,
    scenarios: [
      // Medical-Surgical Scenarios (remaining)
      {
        name: "COPD Exacerbation – Moderate",
        description: "72-year-old female with increased dyspnea and sputum.",
        data: {
          patient_full_name: "Mary Johnson", patient_age: "72", patient_gender: "Female", patient_mrn: "MED002",
          patient_dob: "1953-03-22", patient_insurance_plan: "Medicare", patient_policy_number: "MED-002",
          patient_primary_provider: "Dr. Chen", patient_admission_date: "2025-05-01", allergies: ["Codeine"],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "COPD exacerbation",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: [...commonFocusAreas, "Pulmonary Rehabilitation", "Smoking Cessation"],
      },
      {
        name: "Diabetic Ketoacidosis – Type 1",
        description: "22-year-old female with polyuria and abdominal pain.",
        data: {
          patient_full_name: "Natalie Price", patient_age: "22", patient_gender: "Female", patient_mrn: "MED003",
          patient_dob: "2003-09-01", patient_insurance_plan: "Cigna", patient_policy_number: "MED-003",
          patient_primary_provider: "Dr. Ahmed", patient_admission_date: "2025-05-03", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Diabetic Ketoacidosis",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: [...commonFocusAreas, "Insulin Management", "Electrolyte Correction"],
      },
      {
        name: "CKD Stage 4 – Anemia",
        description: "63-year-old male with CKD4 and symptomatic anemia.",
        data: {
          patient_full_name: "Quentin Brooks", patient_age: "63", patient_gender: "Male", patient_mrn: "MED006",
          patient_dob: "1962-08-21", patient_insurance_plan: "UHC", patient_policy_number: "MED-006",
          patient_primary_provider: "Dr. Malik", patient_admission_date: "2025-05-06", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "CKD4 with anemia",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: [...commonFocusAreas, "Anemia Management (ESA)", "Renal Diet Education"],
      },
      {
        name: "Upper GI Bleed – Peptic Ulcer",
        description: "57-year-old male with hematemesis and melena.",
        data: {
          patient_full_name: "Steven White", patient_age: "57", patient_gender: "Male", patient_mrn: "MED008",
          patient_dob: "1967-01-09", patient_insurance_plan: "Cigna", patient_policy_number: "MED-008",
          patient_primary_provider: "Dr. Ford", patient_admission_date: "2025-05-06", allergies: ["NSAIDs"],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Upper GI bleed – PUD",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: [...commonFocusAreas, "Hemodynamic Monitoring", "Endoscopy Preparation"],
      },
      {
        name: "Appendectomy – Post-Op Day 1",
        description: "18-year-old male POD#1 after laparoscopic appendectomy.",
        data: {
          patient_full_name: "Victor Wu", patient_age: "18", patient_gender: "Male", patient_mrn: "MED010",
          patient_dob: "2007-07-18", patient_insurance_plan: "Parents BCBS", patient_policy_number: "MED-010",
          patient_primary_provider: "Dr. Taylor", patient_admission_date: "2025-05-07", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Post-op care – appendectomy",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Post-operative Pain Management", "Surgical Site Care", "Activity Progression"],
      },
      // Mental Health Scenarios (remaining)
      {
        name: "PTSD – Combat Veteran",
        description: "34-year-old male veteran with intrusive memories and hypervigilance.",
        data: {
          patient_full_name: "Evan Rivera", patient_age: "34", patient_gender: "Male", patient_mrn: "MH003",
          patient_dob: "1991-04-11", patient_insurance_plan: "VA", patient_policy_number: "VA-MH003",
          patient_primary_provider: "Dr. Lopez", patient_admission_date: "2025-05-06", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Chronic PTSD",
          secondaryDiagnoses: ["Alcohol Use Disorder"], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Trauma-Informed Care", "Coping Mechanisms", "Substance Use Comorbidity"],
      },
      {
        name: "OCD – Contamination Type",
        description: "26-year-old female with severe compulsive hand-washing.",
        data: {
          patient_full_name: "Grace Hall", patient_age: "26", patient_gender: "Female", patient_mrn: "MH004",
          patient_dob: "1999-12-05", patient_insurance_plan: "Cigna", patient_policy_number: "CIG-MH004",
          patient_primary_provider: "Dr. Brown", patient_admission_date: "2025-05-05", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Obsessive-Compulsive Disorder, severe",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Exposure and Response Prevention (ERP)", "Anxiety Management"],
      },
      {
        name: "Generalized Anxiety Disorder – Moderate",
        description: "28-year-old male with excessive worry and insomnia.",
        data: {
          patient_full_name: "David Kim", patient_age: "28", patient_gender: "Male", patient_mrn: "MH005",
          patient_dob: "1997-09-20", patient_insurance_plan: "UHC", patient_policy_number: "UHC-MH005",
          patient_primary_provider: "Dr. Singh", patient_admission_date: "2025-05-04", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Generalized Anxiety Disorder",
          secondaryDiagnoses: ["Insomnia"], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Cognitive Behavioral Therapy (CBT)", "Sleep Hygiene"],
      },
      {
        name: "Panic Disorder – Acute",
        description: "29-year-old female with sudden chest tightness and fear of dying.",
        data: {
          patient_full_name: "Hannah Moore", patient_age: "29", patient_gender: "Female", patient_mrn: "MH006",
          patient_dob: "1996-03-14", patient_insurance_plan: "BCBS", patient_policy_number: "BCBS-MH006",
          patient_primary_provider: "Dr. Green", patient_admission_date: "2025-05-09", allergies: ["Sulfa"],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Panic Disorder",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Panic Attack Management", "Relaxation Techniques"],
      },
      {
        name: "Borderline Personality Disorder – Crisis",
        description: "24-year-old female with self-injurious behavior post conflict.",
        data: {
          patient_full_name: "Isabella Nguyen", patient_age: "24", patient_gender: "Female", patient_mrn: "MH007",
          patient_dob: "2001-07-01", patient_insurance_plan: "Medicaid", patient_policy_number: "MED-MH007",
          patient_primary_provider: "Dr. Patel", patient_admission_date: "2025-05-03", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Borderline Personality Disorder",
          secondaryDiagnoses: ["Depressive Disorder"], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Dialectical Behavior Therapy (DBT) Skills", "Emotional Regulation"],
      },
      {
        name: "Alcohol Withdrawal – Moderate",
        description: "48-year-old male with tremors and anxiety after cessation.",
        data: {
          patient_full_name: "Jacob Scott", patient_age: "48", patient_gender: "Male", patient_mrn: "MH008",
          patient_dob: "1977-01-30", patient_insurance_plan: "Humana", patient_policy_number: "HUM-MH008",
          patient_primary_provider: "Dr. Stone", patient_admission_date: "2025-05-04", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "Alcohol Withdrawal",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["CIWA Protocol Management", "Relapse Prevention"],
      },
      {
        name: "ADHD – Predominantly Inattentive",
        description: "35-year-old male with chronic inattentiveness at work.",
        data: {
          patient_full_name: "Kyle Turner", patient_age: "35", patient_gender: "Male", patient_mrn: "MH009",
          patient_dob: "1990-10-10", patient_insurance_plan: "BCBS", patient_policy_number: "BCBS-MH009",
          patient_primary_provider: "Dr. Young", patient_admission_date: "2025-05-05", allergies: [],
          vitalSigns: blankVitals, nyha_class_description: "", primary_diagnosis_text: "ADHD – inattentive type",
          secondaryDiagnoses: [], labs: [], medications: [], treatments: [], last_imaging_summary: "", last_ecg_summary: "",
        },
        focusAreas: ["Organizational Skills Training", "Medication Management (Stimulant/Non-stimulant)"],
      },
      {
        name: "Anorexia Nervosa – Restricting Type",
        description: "19-year-old female BMI 16 with amenorrhea.",
        data: {
          patient_full_name: "Lily Adams", patient_age: "19", patient_gender: "Female", patient_mrn: "MH010",
          patient_dob: "2006-02-02", patient_insurance_plan: "Student Health", patient_policy_number: "STU-MH010",
          patient_primary_provider: "Dr. Rivera", patient_admission_date: "2025-05-06", allergies: [],
          vitalSigns: { ...blankVitals, vital_bp: "90/58 mmHg", vital_pulse: "50 bpm" },
          nyha_class_description: "", primary_diagnosis_text: "Anorexia Nervosa",
          secondaryDiagnoses: ["Osteopenia", "Bradycardia"], labs: [], medications: [], treatments: [],
          last_imaging_summary: "", last_ecg_summary: "Sinus bradycardia",
        },
        focusAreas: ["Nutritional Rehabilitation", "Body Image Therapy", "Medical Stabilization"],
      },
    ]
  }
];
