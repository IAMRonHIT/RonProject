"use client";

import React, { useState, useEffect } from 'react';
import styles from './PatientDataForm.module.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Check, ChevronDown, User, Activity, AlertCircle,
  Plus, X, Loader2, Trash2, UserCircle, Thermometer,
  Heart, Clipboard, PlusCircle, FileText, Stethoscope,
  FlaskConical, Pill, FilePlus, Dna, Droplets, Radiation
} from 'lucide-react'; // ChevronsUpDown is not imported, will use ChevronDown as substitute
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { SCENARIOS_BY_ENVIRONMENT, CareEnvironment, PatientScenario as ScenarioInterface } from '@/components/careplangenerator/scenarios'; // Updated import

// TypeScript Interfaces
export interface VitalSigns {
  vital_bp: string;
  vital_pulse: string;
  vital_resp_rate: string;
  vital_temp: string;
  vital_o2sat: string;
  vital_pain_score: string;
}

export interface LabResult {
  id?: string; // Optional: for managing popover states if needed per item
  lab_n_name: string;
  lab_n_value: string;
  lab_n_flag: string;
  lab_n_trend: string;
}

export interface Medication {
  id?: string;
  med_n_name: string;
  med_n_dosage: string;
  med_n_route: string;
  med_n_frequency: string;
  med_n_status: string;
  med_n_pa_required: boolean;
}

export interface Treatment {
  id?: string;
  treatment_n_name: string;
  treatment_n_status: string;
  treatment_n_details: string;
  treatment_n_date: string;
  treatment_n_pa_required: boolean;
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
  labs: LabResult[];
  medications: Medication[];
  treatments: Treatment[];
  last_imaging_summary: string;
  last_ecg_summary: string;
}

interface PatientScenario {
  name: string;
  description: string;
  data: FormState;
}

interface PatientDataFormProps {
  isLoading: boolean;
  onSubmit: (data: FormState, careEnvironment: string, focusAreas: string[]) => void; // Updated signature
}

type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ConnectionStatus = 'unknown' | 'connected' | 'error';

// Constants for dropdowns
const DIAGNOSES = [
  'Hypertension', 'Diabetes Mellitus', 'Osteoarthritis', 'Depressive Disorders', 'Acute Respiratory Infections',
  'Retinal Disorders', 'Joint Disorders', 'Cataracts', 'Hyperlipidemias', 'Conditions of the Spine and Back',
  'Attention-Deficit Hyperactivity Disorder', 'Otitis Media', 'Acute Pharyngitis', 'Obstructive Sleep Apnea',
  'Glaucoma', 'Coronary Atherosclerosis', 'Gastroesophageal Reflux Disease', 'Sinusitis', 'Allergic Rhinitis',
  'Cardiac Dysrhythmias', 'Asthma', 'Chronic Obstructive Pulmonary Disease (COPD)', 'Anxiety Disorders',
  'Heart Disease', 'Stroke', 'Cancer', 'Alzheimer\'s Disease', 'Infectious Diseases', 'Influenza', 'Pneumonia',
  'Sexually Transmitted Diseases (STD)', 'Arthritis', 'Osteoporosis', 'Kidney Disease', 'Digestive Diseases',
  'Chronic Liver Disease', 'Cirrhosis', 'Allergies', 'Anemia', 'Iron Deficiency', 'Cardiovascular Disease',
  'Cerebrovascular Disease', 'Cholesterol', 'Dementia', 'Mental Health Conditions', 'Oral and Dental Health Issues',
  'Injuries', 'Accidents', 'Trauma', 'Birth Defects', 'Congenital Anomalies', 'Conditions of the Skin',
  'Genitourinary Disorders', 'Neoplasms', 'Urinary Tract Infection (UTI)', 'Low Back Pain', 'Abdominal Pain',
  'Fatigue', 'Malaise', 'Viral Hepatitis', 'HIV/AIDS', 'Measles', 'Mumps', 'Rubella', 'Whooping Cough', 'Pertussis',
  'Chronic Sinusitis', 'Migraine', 'Conjunctivitis', 'Pyrexia (Fever)', 'Contusion (Bruise)', 'Cystitis',
  'Hyperhidrosis (Excessive Sweating)', 'Gastroenteritis', 'Bronchitis', 'Eczema', 'Dermatitis', 'Psoriasis',
  'Acne', 'Cellulitis', 'Abscess', 'Ischemic Heart Disease', 'Heart Failure', 'Angina', 'Arrhythmia',
  'Atrial Fibrillation', 'Ventricular Fibrillation', 'Myocardial Infarction (Heart Attack)', 'Valvular Heart Disease',
  'Cardiomyopathy', 'Peripheral Artery Disease', 'Deep Vein Thrombosis (DVT)', 'Pulmonary Embolism (PE)', 'Aneurysm',
  'Transient Ischemic Attack (TIA)', 'Epilepsy', 'Seizure Disorders', 'Parkinson\'s Disease', 'Multiple Sclerosis (MS)',
  'Amyotrophic Lateral Sclerosis (ALS)', 'Vascular Dementia', 'Frontotemporal Dementia', 'Lewy Body Dementia',
  'Substance Abuse Disorders', 'Alcoholism', 'Drug Addiction', 'Schizophrenia', 'Bipolar Disorder',
  'Post-Traumatic Stress Disorder (PTSD)', 'Obsessive-Compulsive Disorder (OCD)', 'Eating Disorders',
  'Anorexia Nervosa', 'Bulimia Nervosa', 'Binge Eating Disorder', 'Personality Disorders',
  'Borderline Personality Disorder', 'Narcissistic Personality Disorder', 'Anxiety', 'Panic Disorder', 'Phobias',
  'Social Anxiety Disorder', 'Generalized Anxiety Disorder', 'Depression', 'Major Depressive Disorder',
  'Persistent Depressive Disorder', 'Premenstrual Dysphoric Disorder (PMDD)', 'Disruptive Mood Dysregulation Disorder',
  'Congestive Heart Failure'
].sort((a,b) => a.localeCompare(b));

const ALLERGIES = [
  'No Known Allergies', 'Penicillin', 'Sulfa Drugs', 'NSAIDs', 'Aspirin', 'Iodine', 'Latex',
  'Contrast Dye', 'Eggs', 'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Milk', 'Wheat', 'Soy',
  'Sesame', 'Codeine', 'Morphine', 'Tetracycline', 'Erythromycin', 'Cephalosporins'
].sort((a,b) => a.localeCompare(b));

const LAB_TESTS = [
  'Complete Blood Count (CBC)', 'Basic Metabolic Panel (BMP)', 'Comprehensive Metabolic Panel (CMP)',
  'Lipid Panel', 'Hemoglobin A1C', 'C-Reactive Protein (CRP)', 'Erythrocyte Sedimentation Rate (ESR)',
  'TSH (Thyroid Stimulating Hormone)', 'BNP (Brain Natriuretic Peptide)', 'Troponin',
  'Liver Function Tests (LFTs)', 'PT/INR', 'D-Dimer', 'Urinalysis', 'Urine Culture',
  'Blood Culture', 'Arterial Blood Gas (ABG)', 'Potassium', 'Sodium', 'Calcium',
  'Magnesium', 'Phosphorus', 'eGFR', 'Creatinine', 'BUN (Blood Urea Nitrogen)', 'Glucose', 'Hemoglobin', 'CK-MB'
].sort((a,b) => a.localeCompare(b));

const MEDICATIONS = [
  'Lisinopril', 'Metoprolol', 'Atorvastatin', 'Amlodipine', 'Metformin',
  'Levothyroxine', 'Omeprazole', 'Albuterol', 'Hydrochlorothiazide', 'Gabapentin',
  'Losartan', 'Furosemide', 'Simvastatin', 'Citalopram', 'Sertraline',
  'Montelukast', 'Pantoprazole', 'Prednisone', 'Fluoxetine', 'Tramadol',
  'Azithromycin', 'Warfarin', 'Oxycodone', 'Acetaminophen', 'Enoxaparin',
  'Escitalopram', 'Trazodone', 'Sodium Bicarbonate', 'Epoetin Alfa', 'Aspirin',
  'Ticagrelor', 'Doxorubicin', 'Cyclophosphamide', 'Ondansetron', 'Insulin Glargine', 'Glipizide', 'Levofloxacin'
].sort((a,b) => a.localeCompare(b));

const TREATMENTS = [
  'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Cardiac Rehabilitation',
  'Pulmonary Rehabilitation', 'Dialysis', 'Oxygen Therapy', 'CPAP Therapy',
  'IV Antibiotics', 'Chemotherapy', 'Radiation Therapy', 'Immunotherapy',
  'Cognitive Behavioral Therapy', 'Counseling', 'Wound Care', 'Pain Management',
  'Diabetic Education', 'Percutaneous Coronary Intervention', 'Nebulizer Treatments'
].sort((a,b) => a.localeCompare(b));

const NYHA_CLASSES = [
  'Class I: No limitation of physical activity',
  'Class II: Slight limitation of physical activity',
  'Class III: Marked limitation of physical activity',
  'Class IV: Unable to carry out any physical activity without discomfort'
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];

const INSURANCE_PLANS = [
  'Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'UnitedHealthcare', 'Aetna',
  'Cigna', 'Humana', 'Kaiser Permanente', 'TRICARE', 'Veterans Affairs (VA)', 'Aetna Kids'
];

const MED_ROUTES = ['PO', 'IV', 'IM', 'SC', 'Inhaled', 'Topical', 'Transdermal', 'Rectal', 'Sublingual', 'Intranasal'];
const MED_FREQUENCIES = ['Daily', 'BID', 'TID', 'QID', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'Weekly', 'Monthly', 'As needed', 'Nightly', 'Every 3 weeks'];
const MED_STATUSES = ['Active', 'Discontinued', 'On hold', 'Pending'];
const FLAGS = ['H (High)', 'L (Low)', 'N (Normal)', 'C (Critical)'];
const TRENDS = ['Increasing', 'Decreasing', 'Stable', 'Fluctuating'];
const TREATMENT_STATUSES = ['Ordered', 'In progress', 'Completed', 'Discontinued', 'Planned'];

/* const SCENARIOS_OLD: PatientScenario[] = [
  {
    name: "MDD - Severe w/ Psychotic Features",
    description: "45-year-old female involuntarily admitted for severe major depressive disorder with mood-congruent psychosis.",
    data: {
      patient_full_name: "Alice Smith",
      patient_age: "45",
      patient_gender: "Female",
      patient_mrn: "MDD0001",
      patient_dob: "1980-02-14",
      patient_insurance_plan: "Blue Cross Blue Shield",
      patient_policy_number: "BCBS-MDD-0001",
      patient_primary_provider: "Dr. Henry Adams",
      patient_admission_date: "2025-05-03",
      allergies: ["No Known Allergies"],
      vitalSigns: { vital_bp: "118/76", vital_pulse: "78", vital_resp_rate: "16", vital_temp: "98.4", vital_o2sat: "98%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Severe, With Psychotic Features",
      secondaryDiagnoses: ["Generalized Anxiety Disorder"],
      labs: [
        { lab_n_name: "TSH", lab_n_value: "2.1 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "Vitamin D", lab_n_value: "22 ng/mL", lab_n_flag: "L (Low)", lab_n_trend: "Low" }
      ],
      medications: [
        { med_n_name: "Sertraline", med_n_dosage: "100 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "New Order", med_n_pa_required: false },
        { med_n_name: "Olanzapine", med_n_dosage: "10 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Cognitive Behavioral Therapy", treatment_n_status: "Planned", treatment_n_details: "Inpatient individual sessions 3x/week", treatment_n_date: "2025-05-09", treatment_n_pa_required: false },
        { treatment_n_name: "Electroconvulsive Therapy", treatment_n_status: "Ordered", treatment_n_details: "Bilateral ECT, 3 sessions/week", treatment_n_date: "2025-05-10", treatment_n_pa_required: true }
      ],
      last_imaging_summary: "Head CT negative for acute pathology.",
      last_ecg_summary: "Normal sinus rhythm."
    }
  },
  {
    name: "MDD - Postpartum Depression (Moderate)",
    description: "28-year-old female four weeks postpartum experiencing moderate depressive symptoms impacting bonding.",
    data: {
      patient_full_name: "Maria Gonzalez",
      patient_age: "28",
      patient_gender: "Female",
      patient_mrn: "MDD0002",
      patient_dob: "1996-04-12",
      patient_insurance_plan: "Aetna",
      patient_policy_number: "AET-MDD-0002",
      patient_primary_provider: "Dr. Susan Lee",
      patient_admission_date: "2025-05-04",
      allergies: ["No Known Allergies"],
      vitalSigns: { vital_bp: "112/70", vital_pulse: "82", vital_resp_rate: "18", vital_temp: "98.7", vital_o2sat: "99%", vital_pain_score: "1" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate, Postpartum Onset",
      secondaryDiagnoses: ["Iron Deficiency"],
      labs: [
        { lab_n_name: "Hemoglobin", lab_n_value: "10.8 g/dL", lab_n_flag: "L (Low)", lab_n_trend: "Increasing" },
        { lab_n_name: "TSH", lab_n_value: "1.8 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Sertraline", med_n_dosage: "50 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Cognitive Behavioral Therapy", treatment_n_status: "In progress", treatment_n_details: "Weekly outpatient sessions", treatment_n_date: "2025-05-06", treatment_n_pa_required: false },
        { treatment_n_name: "Postpartum Support Group", treatment_n_status: "Planned", treatment_n_details: "Community hospital group, weekly", treatment_n_date: "2025-05-15", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Adolescent First Episode (Mild)",
    description: "16-year-old male presenting with first episode of mild MDD following academic stress.",
    data: {
      patient_full_name: "Kevin Johnson",
      patient_age: "16",
      patient_gender: "Male",
      patient_mrn: "MDD0003",
      patient_dob: "2009-10-02",
      patient_insurance_plan: "UnitedHealthcare",
      patient_policy_number: "UHC-MDD-0003",
      patient_primary_provider: "Dr. Angela Park",
      patient_admission_date: "2025-05-02",
      allergies: ["Peanuts"],
      vitalSigns: { vital_bp: "108/68", vital_pulse: "74", vital_resp_rate: "17", vital_temp: "98.5", vital_o2sat: "98%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Mild, First Episode",
      secondaryDiagnoses: ["Attention-Deficit Hyperactivity Disorder"],
      labs: [
        { lab_n_name: "TSH", lab_n_value: "2.5 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "Vitamin B12", lab_n_value: "340 pg/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Fluoxetine", med_n_dosage: "20 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Cognitive Behavioral Therapy", treatment_n_status: "Planned", treatment_n_details: "School-based weekly sessions", treatment_n_date: "2025-05-08", treatment_n_pa_required: false },
        { treatment_n_name: "Family Therapy", treatment_n_status: "Planned", treatment_n_details: "Bi-weekly sessions", treatment_n_date: "2025-05-12", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Severe w/ Suicidal Ideation",
    description: "32-year-old male presenting to ED with severe depression and active suicidal ideation, admitted for safety.",
    data: {
      patient_full_name: "Daniel Lee",
      patient_age: "32",
      patient_gender: "Male",
      patient_mrn: "MDD0004",
      patient_dob: "1993-01-17",
      patient_insurance_plan: "Cigna",
      patient_policy_number: "CIG-MDD-0004",
      patient_primary_provider: "Dr. Monica Patel",
      patient_admission_date: "2025-05-05",
      allergies: ["Latex"],
      vitalSigns: { vital_bp: "124/80", vital_pulse: "86", vital_resp_rate: "18", vital_temp: "98.6", vital_o2sat: "99%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Severe, Without Psychotic Features",
      secondaryDiagnoses: ["Alcohol Use Disorder"],
      labs: [
        { lab_n_name: "CMP", lab_n_value: "WNL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "Serum Lithium", lab_n_value: "0.0 mmol/L", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Escitalopram", med_n_dosage: "20 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "New Order", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Safety Planning Intervention", treatment_n_status: "In progress", treatment_n_details: "Collaborative safety plan", treatment_n_date: "2025-05-05", treatment_n_pa_required: false },
        { treatment_n_name: "Inpatient Constant Observation", treatment_n_status: "Active", treatment_n_details: "1:1 monitoring", treatment_n_date: "2025-05-05", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Recurrent Moderate (Middle-aged Male)",
    description: "52-year-old male with third episode of moderate MDD impacting work and relationships.",
    data: {
      patient_full_name: "Michael Brown",
      patient_age: "52",
      patient_gender: "Male",
      patient_mrn: "MDD0005",
      patient_dob: "1973-09-03",
      patient_insurance_plan: "Humana",
      patient_policy_number: "HUM-MDD-0005",
      patient_primary_provider: "Dr. Clara Nguyen",
      patient_admission_date: "2025-04-30",
      allergies: ["Shellfish"],
      vitalSigns: { vital_bp: "130/84", vital_pulse: "80", vital_resp_rate: "16", vital_temp: "98.4", vital_o2sat: "97%", vital_pain_score: "1" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate, Recurrent",
      secondaryDiagnoses: ["Hyperlipidemias", "Hypertension"],
      labs: [
        { lab_n_name: "Lipid Panel", lab_n_value: "Total Chol 242 mg/dL", lab_n_flag: "H (High)", lab_n_trend: "Increasing" },
        { lab_n_name: "TSH", lab_n_value: "2.0 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Bupropion SR", med_n_dosage: "150 mg", med_n_route: "PO", med_n_frequency: "BID", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Cognitive Behavioral Therapy", treatment_n_status: "In progress", treatment_n_details: "Weekly sessions", treatment_n_date: "2025-05-01", treatment_n_pa_required: false },
        { treatment_n_name: "Exercise Program", treatment_n_status: "Planned", treatment_n_details: "Supervised aerobic exercise 3x/week", treatment_n_date: "2025-05-07", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Treatment Resistant (Severe)",
    description: "40-year-old female with severe treatment-resistant depression after multiple medication failures.",
    data: {
      patient_full_name: "Laura Davis",
      patient_age: "40",
      patient_gender: "Female",
      patient_mrn: "MDD0006",
      patient_dob: "1985-11-22",
      patient_insurance_plan: "Kaiser Permanente",
      patient_policy_number: "KP-MDD-0006",
      patient_primary_provider: "Dr. Omar Rahman",
      patient_admission_date: "2025-04-28",
      allergies: ["NSAIDs"],
      vitalSigns: { vital_bp: "122/78", vital_pulse: "76", vital_resp_rate: "17", vital_temp: "98.3", vital_o2sat: "98%", vital_pain_score: "2" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Severe, Treatment-Resistant",
      secondaryDiagnoses: ["Fibromyalgia"],
      labs: [
        { lab_n_name: "Lithium Level", lab_n_value: "0.4 mmol/L", lab_n_flag: "N (Therapeutic)", lab_n_trend: "Stable" },
        { lab_n_name: "TSH", lab_n_value: "1.6 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Venlafaxine XR", med_n_dosage: "225 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false },
        { med_n_name: "Lithium", med_n_dosage: "300 mg", med_n_route: "PO", med_n_frequency: "BID", med_n_status: "Active", med_n_pa_required: true }
      ],
      treatments: [
        { treatment_n_name: "Repetitive TMS", treatment_n_status: "Ordered", treatment_n_details: "5 sessions/week for 6 weeks", treatment_n_date: "2025-05-02", treatment_n_pa_required: true },
        { treatment_n_name: "Dialectical Behavior Therapy", treatment_n_status: "Planned", treatment_n_details: "Weekly group sessions", treatment_n_date: "2025-05-09", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Seasonal Pattern (SAD)",
    description: "30-year-old female teacher with moderate MDD symptoms recurring every winter season.",
    data: {
      patient_full_name: "Emma Wilson",
      patient_age: "30",
      patient_gender: "Female",
      patient_mrn: "MDD0007",
      patient_dob: "1994-01-09",
      patient_insurance_plan: "Medicaid",
      patient_policy_number: "MED-MDD-0007",
      patient_primary_provider: "Dr. Fred Chang",
      patient_admission_date: "2024-12-02",
      allergies: ["No Known Allergies"],
      vitalSigns: { vital_bp: "116/72", vital_pulse: "70", vital_resp_rate: "16", vital_temp: "97.9", vital_o2sat: "99%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate, Seasonal Pattern",
      secondaryDiagnoses: [],
      labs: [
        { lab_n_name: "Vitamin D", lab_n_value: "18 ng/mL", lab_n_flag: "L (Low)", lab_n_trend: "Low" },
        { lab_n_name: "TSH", lab_n_value: "2.2 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Bupropion XL", med_n_dosage: "300 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Light Therapy", treatment_n_status: "Ordered", treatment_n_details: "10,000-lux lamp 30min each morning", treatment_n_date: "2024-12-03", treatment_n_pa_required: false },
        { treatment_n_name: "Cognitive Behavioral Therapy", treatment_n_status: "Planned", treatment_n_details: "Weekly sessions", treatment_n_date: "2024-12-05", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Late-Onset (Elderly)",
    description: "68-year-old female with first-onset moderate depression and mild cognitive impairment.",
    data: {
      patient_full_name: "Patricia Harris",
      patient_age: "68",
      patient_gender: "Female",
      patient_mrn: "MDD0008",
      patient_dob: "1957-07-18",
      patient_insurance_plan: "Medicare",
      patient_policy_number: "MED-MDD-0008",
      patient_primary_provider: "Dr. Leo Turner",
      patient_admission_date: "2025-04-14",
      allergies: ["Contrast Dye"],
      vitalSigns: { vital_bp: "132/78", vital_pulse: "72", vital_resp_rate: "18", vital_temp: "98.2", vital_o2sat: "97%", vital_pain_score: "1" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate, Late-Onset",
      secondaryDiagnoses: ["Mild Cognitive Impairment"],
      labs: [
        { lab_n_name: "B12", lab_n_value: "250 pg/mL", lab_n_flag: "N (Low-Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "CMP", lab_n_value: "WNL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Sertraline", med_n_dosage: "50 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "New Order", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Reminiscence Therapy", treatment_n_status: "Planned", treatment_n_details: "Group sessions 2x/week", treatment_n_date: "2025-04-20", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "Brain MRI: mild age-related atrophy, no acute pathology.",
      last_ecg_summary: "Normal sinus rhythm."
    }
  },
  {
    name: "MDD - Perimenopausal Mild",
    description: "49-year-old female experiencing mild depressive symptoms during perimenopause.",
    data: {
      patient_full_name: "Chloe Martin",
      patient_age: "49",
      patient_gender: "Female",
      patient_mrn: "MDD0009",
      patient_dob: "1976-11-11",
      patient_insurance_plan: "Blue Cross Blue Shield",
      patient_policy_number: "BCBS-MDD-0009",
      patient_primary_provider: "Dr. Ellen Brooks",
      patient_admission_date: "2025-03-22",
      allergies: ["Iodine"],
      vitalSigns: { vital_bp: "118/74", vital_pulse: "72", vital_resp_rate: "16", vital_temp: "98.0", vital_o2sat: "99%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Mild, Perimenopausal",
      secondaryDiagnoses: ["Hot Flashes"],
      labs: [
        { lab_n_name: "FSH", lab_n_value: "23 mIU/mL", lab_n_flag: "N (Elevated for age)", lab_n_trend: "Increasing" },
        { lab_n_name: "Vitamin D", lab_n_value: "24 ng/mL", lab_n_flag: "L (Low)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Escitalopram", med_n_dosage: "10 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Mindfulness-Based Stress Reduction", treatment_n_status: "Planned", treatment_n_details: "8-week program", treatment_n_date: "2025-04-01", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Comorbid Chronic Pain",
    description: "55-year-old male with moderate depression exacerbated by chronic lower back pain.",
    data: {
      patient_full_name: "Richard Evans",
      patient_age: "55",
      patient_gender: "Male",
      patient_mrn: "MDD0010",
      patient_dob: "1969-06-30",
      patient_insurance_plan: "Aetna",
      patient_policy_number: "AET-MDD-0010",
      patient_primary_provider: "Dr. Olivia King",
      patient_admission_date: "2025-05-06",
      allergies: ["NSAIDs"],
      vitalSigns: { vital_bp: "128/82", vital_pulse: "76", vital_resp_rate: "16", vital_temp: "98.1", vital_o2sat: "98%", vital_pain_score: "6" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate",
      secondaryDiagnoses: ["Chronic Low Back Pain"],
      labs: [
        { lab_n_name: "CBC", lab_n_value: "WNL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "ESR", lab_n_value: "22 mm/hr", lab_n_flag: "H (High)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Duloxetine", med_n_dosage: "60 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Physical Therapy", treatment_n_status: "Ordered", treatment_n_details: "Back strengthening 2x/week", treatment_n_date: "2025-05-08", treatment_n_pa_required: false },
        { treatment_n_name: "Cognitive Behavioral Therapy for Pain", treatment_n_status: "Planned", treatment_n_details: "Weekly sessions", treatment_n_date: "2025-05-10", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "Lumbar MRI shows degenerative disc disease L4-L5.",
      last_ecg_summary: "Normal sinus rhythm."
    }
  },
  {
    name: "MDD - Veteran w/ PTSD",
    description: "38-year-old male veteran with moderate depression and comorbid PTSD symptoms.",
    data: {
      patient_full_name: "Anthony Ramirez",
      patient_age: "38",
      patient_gender: "Male",
      patient_mrn: "MDD0011",
      patient_dob: "1987-09-27",
      patient_insurance_plan: "VA Benefits",
      patient_policy_number: "VA-MDD-0011",
      patient_primary_provider: "Dr. Grace Kim",
      patient_admission_date: "2025-05-07",
      allergies: ["No Known Allergies"],
      vitalSigns: { vital_bp: "126/80", vital_pulse: "84", vital_resp_rate: "18", vital_temp: "98.3", vital_o2sat: "97%", vital_pain_score: "3" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Moderate",
      secondaryDiagnoses: ["Post-Traumatic Stress Disorder"],
      labs: [
        { lab_n_name: "TSH", lab_n_value: "2.0 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "Vitamin D", lab_n_value: "26 ng/mL", lab_n_flag: "L (Low)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Sertraline", med_n_dosage: "100 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false },
        { med_n_name: "Prazosin", med_n_dosage: "5 mg", med_n_route: "PO", med_n_frequency: "Nightly", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Prolonged Exposure Therapy", treatment_n_status: "Ordered", treatment_n_details: "Weekly sessions", treatment_n_date: "2025-05-09", treatment_n_pa_required: false },
        { treatment_n_name: "Group Therapy", treatment_n_status: "Planned", treatment_n_details: "Veteran support group weekly", treatment_n_date: "2025-05-12", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Substance Use Comorbidity",
    description: "29-year-old female with severe depression and active stimulant use disorder.",
    data: {
      patient_full_name: "Natalie Young",
      patient_age: "29",
      patient_gender: "Female",
      patient_mrn: "MDD0012",
      patient_dob: "1996-12-05",
      patient_insurance_plan: "Cigna",
      patient_policy_number: "CIG-MDD-0012",
      patient_primary_provider: "Dr. Peter Shaw",
      patient_admission_date: "2025-05-01",
      allergies: ["Sulfa Drugs"],
      vitalSigns: { vital_bp: "122/78", vital_pulse: "90", vital_resp_rate: "20", vital_temp: "98.9", vital_o2sat: "98%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Severe",
      secondaryDiagnoses: ["Stimulant Use Disorder"],
      labs: [
        { lab_n_name: "Urine Drug Screen", lab_n_value: "Positive for amphetamines", lab_n_flag: "C (Critical)", lab_n_trend: "New" },
        { lab_n_name: "CBC", lab_n_value: "WNL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" }
      ],
      medications: [
        { med_n_name: "Bupropion SR", med_n_dosage: "150 mg", med_n_route: "PO", med_n_frequency: "BID", med_n_status: "New Order", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Motivational Interviewing", treatment_n_status: "In progress", treatment_n_details: "Sessions 2x/week", treatment_n_date: "2025-05-02", treatment_n_pa_required: false },
        { treatment_n_name: "Residential Rehab Referral", treatment_n_status: "Planned", treatment_n_details: "Pending insurance approval", treatment_n_date: "2025-05-10", treatment_n_pa_required: true }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  },
  {
    name: "MDD - Atypical Presentation (College Student)",
    description: "20-year-old female college student with atypical depressive symptoms such as hypersomnia and weight gain.",
    data: {
      patient_full_name: "Olivia Carter",
      patient_age: "20",
      patient_gender: "Female",
      patient_mrn: "MDD0013",
      patient_dob: "2004-03-19",
      patient_insurance_plan: "Student Health Plan",
      patient_policy_number: "SHP-MDD-0013",
      patient_primary_provider: "Dr. Ian Rogers",
      patient_admission_date: "2025-05-03",
      allergies: ["No Known Allergies"],
      vitalSigns: { vital_bp: "110/70", vital_pulse: "72", vital_resp_rate: "16", vital_temp: "98.6", vital_o2sat: "99%", vital_pain_score: "0" },
      nyha_class_description: "",
      primary_diagnosis_text: "Major Depressive Disorder, Mild, Atypical Features",
      secondaryDiagnoses: [],
      labs: [
        { lab_n_name: "TSH", lab_n_value: "2.3 µIU/mL", lab_n_flag: "N (Normal)", lab_n_trend: "Stable" },
        { lab_n_name: "Vitamin D", lab_n_value: "20 ng/mL", lab_n_flag: "L (Low)", lab_n_trend: "Low" }
      ],
      medications: [
        { med_n_name: "Sertraline", med_n_dosage: "50 mg", med_n_route: "PO", med_n_frequency: "Daily", med_n_status: "Active", med_n_pa_required: false }
      ],
      treatments: [
        { treatment_n_name: "Interpersonal Therapy", treatment_n_status: "Planned", treatment_n_details: "Campus counseling center weekly", treatment_n_date: "2025-05-08", treatment_n_pa_required: false },
        { treatment_n_name: "Nutrition Consultation", treatment_n_status: "Planned", treatment_n_details: "Dietary changes for weight management", treatment_n_date: "2025-05-12", treatment_n_pa_required: false }
      ],
      last_imaging_summary: "N/A",
      last_ecg_summary: "N/A"
    }
  }
]; */

// Empty form state template
const EMPTY_FORM_STATE: FormState = {
  patient_full_name: "", patient_age: "", patient_gender: "", patient_mrn: "", patient_dob: "", patient_insurance_plan: "", patient_policy_number: "", patient_primary_provider: "", patient_admission_date: "",
  allergies: [],
  vitalSigns: { vital_bp: "", vital_pulse: "", vital_resp_rate: "", vital_temp: "", vital_o2sat: "", vital_pain_score: "" },
  nyha_class_description: "", primary_diagnosis_text: "", secondaryDiagnoses: [],
  labs: [], medications: [], treatments: [],
  last_imaging_summary: "", last_ecg_summary: ""
};

const ALL_ACCORDION_SECTIONS = ['demographics', 'vitals', 'allergies', 'diagnoses', 'labs', 'medications', 'treatments', 'imaging'];


const PatientDataForm = ({ onSubmit, isLoading }: PatientDataFormProps) => {
  const fadeInDownKeyframes = `
    @keyframes fadeInDown { from { opacity: 0; transform: translate3d(0, -20px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
    @keyframes pulseSlow { 0%, 100% { opacity: 0.1; transform: scale(0.95); } 50% { opacity: 0.15; transform: scale(1.05); } }
    .animate-pulse-slow { animation: pulseSlow 8s infinite ease-in-out; }
    .animate-pulse-slower { animation: pulseSlow 12s infinite ease-in-out; }
  `;

  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(SCENARIOS_BY_ENVIRONMENT[0].id);
  const [selectedScenarioName, setSelectedScenarioName] = useState<string>(SCENARIOS_BY_ENVIRONMENT[0].scenarios[0].name);
  
  const [formState, setFormState] = useState<FormState>(() => {
    const initialEnv = SCENARIOS_BY_ENVIRONMENT.find(env => env.id === selectedEnvironmentId);
    const initialScenario = initialEnv?.scenarios.find(sc => sc.name === selectedScenarioName);
    return JSON.parse(JSON.stringify(initialScenario?.data || EMPTY_FORM_STATE)); // Deep copy
  });

  const [expandedSections, setExpandedSections] = useState<string[]>([]); // Accordions collapsed by default
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popoverOpenState, setPopoverOpenState] = useState<Record<string, boolean>>({});


  const today = new Date().toISOString().split('T')[0];

  const showNotification = (message: string, type: Notification['type']) => {
    const newNotification = { id: Date.now().toString(), message, type };
    setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const handlePopoverOpenChange = (popoverId: string, open: boolean) => {
    setPopoverOpenState(prev => ({ ...prev, [popoverId]: open }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'vitalSigns') {
        setFormState(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, [child]: value } }));
      }
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'vitalSigns') {
        setFormState(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, [child]: value } }));
      }
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };
  
  type ArrayObjectKeys = 'labs' | 'medications' | 'treatments';
  type ArrayStringKeys = 'allergies' | 'secondaryDiagnoses';
  type ArrayKeys = ArrayObjectKeys | ArrayStringKeys;

  const handleArrayChange = (index: number, field: string, value: string | boolean, arrayName: ArrayObjectKeys) => {
    setFormState(prev => {
      const newArray = prev[arrayName].map((item, i) => i === index ? { ...item, [field]: value } : item);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleStringArrayChange = (index: number, value: string, arrayName: ArrayStringKeys) => {
    setFormState(prev => {
      const newArray = prev[arrayName].map((item, i) => i === index ? value : item);
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addItemToArray = (arrayName: ArrayKeys) => {
    setFormState(prev => {
      let newItem: any;
      const newId = `${arrayName}-item-${Date.now()}`; // For popover state management
      if (arrayName === 'labs') newItem = { id: newId, lab_n_name: "", lab_n_value: "", lab_n_flag: "", lab_n_trend: "" };
      else if (arrayName === 'medications') newItem = { id: newId, med_n_name: "", med_n_dosage: "", med_n_route: "", med_n_frequency: "", med_n_status: "", med_n_pa_required: false };
      else if (arrayName === 'treatments') newItem = { id: newId, treatment_n_name: "", treatment_n_status: "", treatment_n_details: "", treatment_n_date: "", treatment_n_pa_required: false };
      else if (arrayName === 'allergies' || arrayName === 'secondaryDiagnoses') newItem = "";
      else return prev;
      return { ...prev, [arrayName]: [...prev[arrayName], newItem] };
    });
  };

  const removeFromArray = (arrayName: ArrayKeys, index: number) => {
    setFormState(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  };

  const handleScenarioChange = (newScenarioName: string, environmentId?: string) => {
    const currentEnvId = environmentId || selectedEnvironmentId;
    const environment = SCENARIOS_BY_ENVIRONMENT.find(env => env.id === currentEnvId);
    if (!environment) return;

    const scenarioData = environment.scenarios.find((s: ScenarioInterface) => s.name === newScenarioName);
    
    setSelectedScenarioName(newScenarioName);

    if (scenarioData) {
      setFormState(JSON.parse(JSON.stringify(scenarioData.data))); // Deep copy
      showNotification(`Loaded scenario: ${newScenarioName} from ${environment.name}`, 'success');
    } else if (newScenarioName === "Custom" || (environment.id === "custom" && environment.scenarios[0]?.name === newScenarioName)) {
      // Special handling for the "Build Your Own Scenario" under "Custom" environment
      const customEnv = SCENARIOS_BY_ENVIRONMENT.find(env => env.id === "custom");
      const customScenarioData = customEnv?.scenarios[0]?.data;
      setFormState(JSON.parse(JSON.stringify(customScenarioData || EMPTY_FORM_STATE)));
      showNotification('Started with blank custom scenario', 'info');
    }
    setPopoverOpenState({}); // Reset all popover states
  };

  const handleEnvironmentChange = (newEnvironmentId: string) => {
    setSelectedEnvironmentId(newEnvironmentId);
    const environment = SCENARIOS_BY_ENVIRONMENT.find(env => env.id === newEnvironmentId);
    if (environment && environment.scenarios.length > 0) {
      // Auto-select the first scenario of the new environment
      handleScenarioChange(environment.scenarios[0].name, newEnvironmentId);
    } else {
      // Handle case where environment has no scenarios or is not found (e.g., custom with no pre-defined)
      setSelectedScenarioName(""); // Or a specific placeholder
      setFormState(JSON.parse(JSON.stringify(EMPTY_FORM_STATE)));
      if (environment) {
        showNotification(`Switched to ${environment.name}. Select a scenario or build custom.`, 'info');
      }
    }
  };

  const handleSubmit = (useStreaming: boolean) => {
    if (!formState.patient_full_name.trim() || !formState.primary_diagnosis_text.trim()) {
      showNotification('Patient Name and Primary Diagnosis are required.', 'error');
      if (!expandedSections.includes('demographics')) {
        setExpandedSections(prev => [...prev, 'demographics']);
      }
      if (!expandedSections.includes('diagnoses')) {
        setExpandedSections(prev => [...prev, 'diagnoses']);
      }
      // Try to focus on the first empty required field
      setTimeout(() => { // Allow state to update and sections to expand
        const fullNameInput = document.getElementById('patient_full_name');
        const primaryDiagnosisButton = document.getElementById('primary_diagnosis_combobox_trigger');
        if (!formState.patient_full_name.trim() && fullNameInput) {
          fullNameInput.focus();
        } else if (!formState.primary_diagnosis_text.trim() && primaryDiagnosisButton) {
          primaryDiagnosisButton.focus();
        }
      }, 100);
      return;
    }
    
    const currentEnv = SCENARIOS_BY_ENVIRONMENT.find(env => env.id === selectedEnvironmentId);
    const currentScenario = currentEnv?.scenarios.find(sc => sc.name === selectedScenarioName);

    const envName = currentEnv?.name || "Unknown Environment"; // Provide a fallback
    const focusAreas = currentScenario?.focusAreas || []; // Provide a fallback

    // The `useStreaming` parameter is no longer directly passed from here,
    // as the new backend endpoint implies streaming.
    // If you need to differentiate, the main page component would decide which SonarService method to call.
    // For now, we assume the new `onSubmit` always triggers the sequential stream.
    showNotification('Starting multi-stage streaming generation...', 'info');
    onSubmit(formState, envName, focusAreas);
  };

  const testBackend = async (): Promise<void> => {
    try {
      setConnectionStatus('unknown'); setConnectionError(null);
      const response = await fetch('/api/careplan/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.status === 'success') setConnectionStatus('connected');
      else { setConnectionStatus('error'); setConnectionError(data.message || 'Unknown error during test'); }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => { testBackend(); }, []);

  const checkFormCompleteness = (data: FormState): boolean => {
    // Basic string fields
    const basicFields: (keyof FormState)[] = [
      'patient_full_name', 'patient_age', 'patient_gender', 'patient_mrn', 'patient_dob',
      'patient_insurance_plan', 'patient_policy_number', 'patient_primary_provider',
      'patient_admission_date', 'primary_diagnosis_text',
      'last_imaging_summary', 'last_ecg_summary', 'nyha_class_description'
    ];
    for (const field of basicFields) {
      const value = data[field];
      if (typeof value === 'string' && !value.trim()) {
        // Allow N/A for nyha_class_description if that's its value
        if (field === 'nyha_class_description' && value === 'N/A') continue;
        return false;
      }
      if (typeof value !== 'string' && (value === null || value === undefined)) return false; // Handles non-string types if any
    }

    // Vital Signs
    const vitalFields: (keyof VitalSigns)[] = [
      'vital_bp', 'vital_pulse', 'vital_resp_rate', 'vital_temp', 'vital_o2sat', 'vital_pain_score'
    ];
    for (const field of vitalFields) {
      if (!data.vitalSigns[field].trim()) return false;
    }

    // Allergies: if any allergy item exists, it must not be an empty string
    if (data.allergies.some(allergy => !allergy.trim())) return false;

    // Secondary Diagnoses: if any diagnosis item exists, it must not be an empty string
    if (data.secondaryDiagnoses.some(diag => !diag.trim())) return false;

    // Labs: if any lab item exists, its core fields must be filled
    for (const lab of data.labs) {
      if (!lab.lab_n_name.trim() || !lab.lab_n_value.trim() || !lab.lab_n_flag.trim() || !lab.lab_n_trend.trim()) return false;
    }

    // Medications: if any medication item exists, its core fields must be filled
    for (const med of data.medications) {
      if (!med.med_n_name.trim() || !med.med_n_dosage.trim() || !med.med_n_route.trim() || !med.med_n_frequency.trim() || !med.med_n_status.trim()) return false;
    }

    // Treatments: if any treatment item exists, its core fields must be filled
    if (data.treatments && Array.isArray(data.treatments)) {
      for (const treatment of data.treatments) {
        if (!treatment || 
            typeof treatment.treatment_n_name !== 'string' || !treatment.treatment_n_name.trim() ||
            typeof treatment.treatment_n_status !== 'string' || !treatment.treatment_n_status.trim() ||
            typeof treatment.treatment_n_details !== 'string' || !treatment.treatment_n_details.trim() ||
            typeof treatment.treatment_n_date !== 'string' || !treatment.treatment_n_date.trim()) {
          return false;
        }
      }
    } else if (data.treatments === null || data.treatments === undefined) {
      // If treatments array itself is null/undefined, consider it incomplete if it's expected.
      // However, an empty array is fine. If it must exist, this check might need adjustment.
      // For now, assume null/undefined means it's not properly initialized if it should be an array.
    }


    return true;
  };

  useEffect(() => {
    setIsFormComplete(checkFormCompleteness(formState));
  }, [formState]);

  const renderCommandItems = (
    items: string[],
    currentValue: string,
    onSelectCallback: (value: string) => void,
    popoverId: string
  ) => (
    items.map((item) => (
      <CommandItem
        key={item}
        value={item}
        onSelect={(val) => {
          const selectedItem = items.find(s => s.toLowerCase() === val.toLowerCase()) || "";
          onSelectCallback(selectedItem);
          handlePopoverOpenChange(popoverId, false);
        }}
        className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20 aria-selected:!bg-cyan-500/30"
      >
        <Check className={cn("mr-2 h-4 w-4", currentValue.toLowerCase() === item.toLowerCase() ? "opacity-100 text-cyan-400" : "opacity-0")} />
        {item}
      </CommandItem>
    ))
  );


  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <style>{fadeInDownKeyframes}</style>
      <div
        className={styles.backgroundPattern}
      />
      <div className="fixed top-[10%] left-[5%] w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow -z-10"></div>
      <div className="fixed bottom-[15%] right-[10%] w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slower -z-10"></div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-500 pb-2">AI Care Plan Synthesizer</h1>
        // ... (rest of the code remains the same)
```
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Input patient data to generate comprehensive, AI-powered care plans.</p>
      </div>

      <div className="fixed top-6 right-6 w-full max-w-sm z-[100] space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className={cn("relative w-full p-4 rounded-lg border shadow-2xl backdrop-blur-lg animate-fade-in-down", notif.type === 'success' && 'bg-green-600/20 border-green-500/50 text-green-200', notif.type === 'error' && 'bg-red-600/20 border-red-500/50 text-red-200', notif.type === 'info' && 'bg-blue-600/20 border-blue-500/50 text-blue-200')}>
            <div className="flex items-start">
              {notif.type === 'success' && <Check className="h-5 w-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />}
              {notif.type === 'error' && <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />}
              {notif.type === 'info' && <FileText className="h-5 w-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />}
              <p className="text-sm font-medium flex-grow">{notif.message}</p>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-current/70 hover:text-current absolute top-1 right-1" onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Card className="backdrop-blur-xl bg-black/40 border border-zinc-700/60 shadow-2xl shadow-black/50 rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-30">
            <div>
              <Label htmlFor="environment-select-trigger" className="block text-zinc-200 font-semibold mb-2">Select Care Environment</Label>
              <Select value={selectedEnvironmentId} onValueChange={handleEnvironmentChange}>
                <SelectTrigger 
                  id="environment-select-trigger" 
                  className="w-full bg-zinc-800/70 border-zinc-700/60 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500 data-[placeholder]:text-zinc-400"
                >
                  <SelectValue placeholder="Select care environment" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-72 scenario-scrollbar"
                >
                  {SCENARIOS_BY_ENVIRONMENT.map((env: CareEnvironment) => (
                    <SelectItem 
                      key={env.id} 
                      value={env.id} 
                      className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20 data-[state=checked]:!bg-cyan-500/30"
                    >
                      <div className="flex items-center">
                        <env.icon className="h-4 w-4 mr-2 text-cyan-400" />
                        <span>{env.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scenario-select-trigger" className="block text-zinc-200 font-semibold mb-2">Select Patient Scenario</Label>
              <Select 
                value={selectedScenarioName} 
                onValueChange={(value) => handleScenarioChange(value)}
                disabled={!selectedEnvironmentId || (SCENARIOS_BY_ENVIRONMENT.find(env => env.id === selectedEnvironmentId)?.scenarios.length === 0 && selectedEnvironmentId !== 'custom')}
              >
                <SelectTrigger 
                  id="scenario-select-trigger" 
                  className="w-full bg-zinc-800/70 border-zinc-700/60 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500 data-[placeholder]:text-zinc-400"
                >
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-72 scenario-scrollbar"
                >
                  {SCENARIOS_BY_ENVIRONMENT.find(env => env.id === selectedEnvironmentId)?.scenarios.map((scenario: ScenarioInterface) => (
                    <SelectItem 
                      key={scenario.name} 
                      value={scenario.name} 
                      className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20 data-[state=checked]:!bg-cyan-500/30"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{scenario.name}</span>
                        <span className="text-xs text-zinc-400">{scenario.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className={cn(
                "h-3 w-3 rounded-full",
                isFormComplete ? "bg-green-500" : "bg-yellow-500 animate-pulse"
              )}></span>
              <span className={cn(
                "text-sm font-medium",
                isFormComplete ? "text-green-400" : "text-yellow-400"
              )}>
                {isFormComplete ? "All fields complete" : "Pending fields"}
              </span>
            </div>
            <Button variant="ghost" onClick={() => setExpandedSections(prev => prev.length === ALL_ACCORDION_SECTIONS.length ? [] : ALL_ACCORDION_SECTIONS)} className="text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              {expandedSections.length === ALL_ACCORDION_SECTIONS.length ? <><ChevronDown className="mr-2 h-4 w-4" /> Collapse All</> : <><PlusCircle className="mr-2 h-4 w-4" /> Expand All</>}
            </Button>
          </div>
          
          <Separator className="my-6 bg-zinc-700/50" />
          <div className="space-y-4">
            <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="space-y-4">
              {/* Demographics Section */}
              <AccordionItem value="demographics" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling">
                  <div className="flex items-center"><UserCircle className="h-6 w-6 mr-3 text-cyan-400 group-hover:text-cyan-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Patient Demographics</span></div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-3 bg-black/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><Label htmlFor="patient_full_name" className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</Label><Input id="patient_full_name" name="patient_full_name" value={formState.patient_full_name} onChange={handleChange} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div><Label htmlFor="patient_age" className="block text-sm font-medium text-zinc-300 mb-1.5">Age</Label><Input id="patient_age" name="patient_age" value={formState.patient_age} onChange={handleChange} type="number" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                      <div><Label htmlFor="patient_gender" className="block text-sm font-medium text-zinc-300 mb-1.5">Gender</Label><Select value={formState.patient_gender} onValueChange={(value) => handleSelectChange("patient_gender", value)}><SelectTrigger id="patient_gender" className="w-full bg-zinc-800/70 border-zinc-700/60 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{GENDERS.map((gender) => <SelectItem key={gender} value={gender} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{gender}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div><Label htmlFor="patient_mrn" className="block text-sm font-medium text-zinc-300 mb-1.5">MRN</Label><Input id="patient_mrn" name="patient_mrn" value={formState.patient_mrn} onChange={handleChange} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="patient_dob" className="block text-sm font-medium text-zinc-300 mb-1.5">Date of Birth</Label><Input id="patient_dob" name="patient_dob" value={formState.patient_dob} onChange={handleChange} type="date" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 date-input-styling" /></div>
                  </div>
                  <Separator className="my-5 bg-zinc-700/40" />
                  <h3 className="text-sm font-medium text-zinc-200 mb-3">Insurance & Admission</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><Label htmlFor="patient_insurance_plan" className="block text-sm font-medium text-zinc-300 mb-1.5">Insurance Plan</Label><Select value={formState.patient_insurance_plan} onValueChange={(value) => handleSelectChange("patient_insurance_plan", value)}><SelectTrigger id="patient_insurance_plan" className="w-full bg-zinc-800/70 border-zinc-700/60 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select insurance" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{INSURANCE_PLANS.map((plan) => <SelectItem key={plan} value={plan} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{plan}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label htmlFor="patient_policy_number" className="block text-sm font-medium text-zinc-300 mb-1.5">Policy Number</Label><Input id="patient_policy_number" name="patient_policy_number" value={formState.patient_policy_number} onChange={handleChange} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="patient_primary_provider" className="block text-sm font-medium text-zinc-300 mb-1.5">Primary Provider</Label><Input id="patient_primary_provider" name="patient_primary_provider" value={formState.patient_primary_provider} onChange={handleChange} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="patient_admission_date" className="block text-sm font-medium text-zinc-300 mb-1.5">Admission Date</Label><Input id="patient_admission_date" name="patient_admission_date" value={formState.patient_admission_date} onChange={handleChange} type="date" max={today} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 date-input-styling" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Vital Signs Section */}
              <AccordionItem value="vitals" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling">
                  <div className="flex items-center"><Heart className="h-6 w-6 mr-3 text-rose-400 group-hover:text-rose-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Vital Signs</span></div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-3 bg-black/30">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div><Label htmlFor="vital_bp" className="block text-sm font-medium text-zinc-300 mb-1.5">Blood Pressure</Label><Input id="vital_bp" name="vitalSigns.vital_bp" value={formState.vitalSigns.vital_bp} onChange={handleChange} placeholder="e.g., 120/80" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="vital_pulse" className="block text-sm font-medium text-zinc-300 mb-1.5">Pulse (bpm)</Label><Input id="vital_pulse" name="vitalSigns.vital_pulse" value={formState.vitalSigns.vital_pulse} onChange={handleChange} placeholder="e.g., 72" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="vital_resp_rate" className="block text-sm font-medium text-zinc-300 mb-1.5">Resp. Rate</Label><Input id="vital_resp_rate" name="vitalSigns.vital_resp_rate" value={formState.vitalSigns.vital_resp_rate} onChange={handleChange} placeholder="e.g., 16" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="vital_temp" className="block text-sm font-medium text-zinc-300 mb-1.5">Temperature (°F)</Label><Input id="vital_temp" name="vitalSigns.vital_temp" value={formState.vitalSigns.vital_temp} onChange={handleChange} placeholder="e.g., 98.6" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="vital_o2sat" className="block text-sm font-medium text-zinc-300 mb-1.5">O2 Saturation (%)</Label><Input id="vital_o2sat" name="vitalSigns.vital_o2sat" value={formState.vitalSigns.vital_o2sat} onChange={handleChange} placeholder="e.g., 97%" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                    <div><Label htmlFor="vital_pain_score" className="block text-sm font-medium text-zinc-300 mb-1.5">Pain Score (0-10)</Label><Input id="vital_pain_score" name="vitalSigns.vital_pain_score" value={formState.vitalSigns.vital_pain_score} onChange={handleChange} placeholder="e.g., 3" className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                  </div>
                  <div className="mt-5"><Label htmlFor="nyha_class_description" className="block text-sm font-medium text-zinc-300 mb-1.5">NYHA Class (if applicable)</Label><Select value={formState.nyha_class_description} onValueChange={(value) => handleSelectChange("nyha_class_description", value)}><SelectTrigger id="nyha_class_description" className="w-full bg-zinc-800/70 border-zinc-700/60 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select NYHA class" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md"><SelectItem value="N/A" className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">N/A</SelectItem>{NYHA_CLASSES.map((nyhaClass) => <SelectItem key={nyhaClass} value={nyhaClass} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{nyhaClass}</SelectItem>)}</SelectContent></Select></div>
                </AccordionContent>
              </AccordionItem>

              {/* Allergies Section */}
              <AccordionItem value="allergies" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                 <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling">
                   <div className="flex items-center"><AlertCircle className="h-6 w-6 mr-3 text-amber-400 group-hover:text-amber-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Allergies</span></div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-6 pt-3 bg-black/30">
                   {formState.allergies.length === 0 && <p className="text-zinc-400 text-sm italic mb-3">No allergies recorded. Click "Add Allergy" to add one.</p>}
                   <div className="space-y-3">
                     {formState.allergies.map((allergy: string, index: number) => {
                       const popoverId = `allergy-${index}`;
                       return (
                         <div key={popoverId} className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
                           <Popover open={popoverOpenState[popoverId]} onOpenChange={(open) => handlePopoverOpenChange(popoverId, open)}>
                             <PopoverTrigger asChild>
                               <Button variant="outline" role="combobox" aria-expanded={popoverOpenState[popoverId]} className="w-full justify-between font-normal bg-zinc-900/70 border-zinc-700 text-zinc-200 hover:bg-zinc-800/90 hover:text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                                 {allergy || "Select allergy..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-60"><Command><CommandInput placeholder="Search allergy..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No allergy found.</CommandEmpty><CommandGroup>{renderCommandItems(ALLERGIES, allergy, (value) => handleStringArrayChange(index, value, 'allergies'), popoverId)}</CommandGroup></CommandList></Command></PopoverContent>
                           </Popover>
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeFromArray('allergies', index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
                         </div>
                       );
                     })}
                   </div>
                   <Button type="button" variant="outline" size="sm" onClick={() => addItemToArray('allergies')} className="mt-4 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"><Plus className="h-4 w-4 mr-2" /> Add Allergy</Button>
                 </AccordionContent>
               </AccordionItem>

              {/* Diagnoses Section */}
              <AccordionItem value="diagnoses" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling">
                  <div className="flex items-center"><Clipboard className="h-6 w-6 mr-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Diagnoses</span></div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-3 bg-black/30">
                  <div className="mb-5">
                    <Label htmlFor="primary_diagnosis_combobox_trigger" className="block text-sm font-medium text-zinc-300 mb-1.5">Primary Diagnosis</Label>
                    <Popover open={popoverOpenState['primaryDiagnosis']} onOpenChange={(open) => handlePopoverOpenChange('primaryDiagnosis', open)}>
                      <PopoverTrigger asChild>
                        <Button id="primary_diagnosis_combobox_trigger" variant="outline" role="combobox" aria-expanded={popoverOpenState['primaryDiagnosis']} className="w-full justify-between font-normal bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                          {formState.primary_diagnosis_text || "Select primary diagnosis..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-72"><Command><CommandInput placeholder="Search diagnosis..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No diagnosis found.</CommandEmpty><CommandGroup>{renderCommandItems(DIAGNOSES, formState.primary_diagnosis_text, (value) => handleSelectChange("primary_diagnosis_text", value), 'primaryDiagnosis')}</CommandGroup></CommandList></Command></PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-zinc-300 mb-1.5">Secondary Diagnoses</Label>
                    {formState.secondaryDiagnoses.length === 0 && <p className="text-zinc-400 text-sm italic mb-3">No secondary diagnoses recorded.</p>}
                    <div className="space-y-3">
                      {formState.secondaryDiagnoses.map((diagnosis: string, index: number) => {
                        const popoverId = `secondaryDiagnosis-${index}`;
                        return (
                          <div key={popoverId} className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
                            <Popover open={popoverOpenState[popoverId]} onOpenChange={(open) => handlePopoverOpenChange(popoverId, open)}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={popoverOpenState[popoverId]} className="w-full justify-between font-normal bg-zinc-900/70 border-zinc-700 text-zinc-200 hover:bg-zinc-800/90 hover:text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                                  {diagnosis || "Select diagnosis..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-60">
                                <Command><CommandInput placeholder="Search diagnosis..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No diagnosis found.</CommandEmpty><CommandGroup>{renderCommandItems(DIAGNOSES.filter(d => d !== formState.primary_diagnosis_text && !formState.secondaryDiagnoses.filter((_, i) => i !== index).includes(d)), diagnosis, (value) => handleStringArrayChange(index, value, 'secondaryDiagnoses'), popoverId)}</CommandGroup></CommandList></Command>
                              </PopoverContent>
                            </Popover>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFromArray('secondaryDiagnoses', index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        );
                      })}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addItemToArray('secondaryDiagnoses')} className="mt-4 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"><Plus className="h-4 w-4 mr-2" /> Add Secondary Diagnosis</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Labs, Medications, Treatments follow similar refactor for searchable names */}
              {/* Lab Results Section */}
              <AccordionItem value="labs" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling"><div className="flex items-center"><FlaskConical className="h-6 w-6 mr-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Lab Results</span></div></AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-0 bg-black/30">
                  {formState.labs.length === 0 && <p className="text-zinc-400 text-sm italic my-3">No lab results recorded.</p>}
                  <div className="space-y-4">
                    {formState.labs.map((lab, index) => {
                      const popoverId = lab.id || `labName-${index}`; // Use item's own id if available
                      return(
                      <div key={`lab-${index}`} className="p-4 border border-zinc-700/60 rounded-lg bg-zinc-800/40">
                        <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-semibold text-emerald-300">Lab Result #{index + 1}</h3><Button type="button" variant="ghost" size="icon" onClick={() => removeFromArray('labs', index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <Label htmlFor={popoverId + "_trigger"} className="block text-sm font-medium text-zinc-300 mb-1.5">Test Name</Label>
                            <Popover open={popoverOpenState[popoverId]} onOpenChange={(open) => handlePopoverOpenChange(popoverId, open)}>
                              <PopoverTrigger asChild>
                                <Button id={popoverId + "_trigger"} variant="outline" role="combobox" aria-expanded={popoverOpenState[popoverId]} className="w-full justify-between font-normal bg-zinc-900/70 border-zinc-700 text-zinc-200 hover:bg-zinc-800/90 hover:text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                                  {lab.lab_n_name || "Select test..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-60"><Command><CommandInput placeholder="Search test..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No test found.</CommandEmpty><CommandGroup>{renderCommandItems(LAB_TESTS, lab.lab_n_name, (value) => handleArrayChange(index, 'lab_n_name', value, 'labs'), popoverId)}</CommandGroup></CommandList></Command></PopoverContent>
                            </Popover>
                          </div>
                          <div><Label htmlFor={`lab_n_value-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Value</Label><Input id={`lab_n_value-${index}`} value={lab.lab_n_value} onChange={(e) => handleArrayChange(index, 'lab_n_value', e.target.value, 'labs')} className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                          <div><Label htmlFor={`lab_n_flag-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Flag</Label><Select value={lab.lab_n_flag} onValueChange={(value) => handleArrayChange(index, 'lab_n_flag', value, 'labs')}><SelectTrigger id={`lab_n_flag-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select flag" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{FLAGS.map((flag) => <SelectItem key={flag} value={flag} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{flag}</SelectItem>)}</SelectContent></Select></div>
                          <div><Label htmlFor={`lab_n_trend-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Trend</Label><Select value={lab.lab_n_trend} onValueChange={(value) => handleArrayChange(index, 'lab_n_trend', value, 'labs')}><SelectTrigger id={`lab_n_trend-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select trend" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{TRENDS.map((trend) => <SelectItem key={trend} value={trend} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{trend}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                      </div>
                    )})}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addItemToArray('labs')} className="mt-5 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"><Plus className="h-4 w-4 mr-2" /> Add Lab Result</Button>
                </AccordionContent>
              </AccordionItem>

              {/* Medications Section */}
              <AccordionItem value="medications" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling"><div className="flex items-center"><Pill className="h-6 w-6 mr-3 text-sky-400 group-hover:text-sky-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Medications</span></div></AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-0 bg-black/30">
                {formState.medications.length === 0 && <p className="text-zinc-400 text-sm italic my-3">No medications recorded.</p>}
                  <div className="space-y-4">
                    {formState.medications.map((med, index) => {
                      const popoverId = med.id || `medName-${index}`;
                      return (
                      <div key={`med-${index}`} className="p-4 border border-zinc-700/60 rounded-lg bg-zinc-800/40">
                        <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-semibold text-sky-300">Medication #{index + 1}</h3><Button type="button" variant="ghost" size="icon" onClick={() => removeFromArray('medications', index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <Label htmlFor={popoverId + "_trigger"} className="block text-sm font-medium text-zinc-300 mb-1.5">Name</Label>
                            <Popover open={popoverOpenState[popoverId]} onOpenChange={(open) => handlePopoverOpenChange(popoverId, open)}>
                              <PopoverTrigger asChild>
                                <Button id={popoverId + "_trigger"} variant="outline" role="combobox" aria-expanded={popoverOpenState[popoverId]} className="w-full justify-between font-normal bg-zinc-900/70 border-zinc-700 text-zinc-200 hover:bg-zinc-800/90 hover:text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                                  {med.med_n_name || "Select medication..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-60"><Command><CommandInput placeholder="Search medication..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No medication found.</CommandEmpty><CommandGroup>{renderCommandItems(MEDICATIONS, med.med_n_name, (value) => handleArrayChange(index, 'med_n_name', value, 'medications'), popoverId)}</CommandGroup></CommandList></Command></PopoverContent>
                            </Popover>
                          </div>
                          <div><Label htmlFor={`med_n_dosage-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Dosage</Label><Input id={`med_n_dosage-${index}`} value={med.med_n_dosage} onChange={(e) => handleArrayChange(index, 'med_n_dosage', e.target.value, 'medications')} className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500" /></div>
                          <div><Label htmlFor={`med_n_route-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Route</Label><Select value={med.med_n_route} onValueChange={(value) => handleArrayChange(index, 'med_n_route', value, 'medications')}><SelectTrigger id={`med_n_route-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select route" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{MED_ROUTES.map((route) => <SelectItem key={route} value={route} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{route}</SelectItem>)}</SelectContent></Select></div>
                          <div><Label htmlFor={`med_n_frequency-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Frequency</Label><Select value={med.med_n_frequency} onValueChange={(value) => handleArrayChange(index, 'med_n_frequency', value, 'medications')}><SelectTrigger id={`med_n_frequency-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{MED_FREQUENCIES.map((frequency) => <SelectItem key={frequency} value={frequency} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{frequency}</SelectItem>)}</SelectContent></Select></div>
                          <div><Label htmlFor={`med_n_status-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Status</Label><Select value={med.med_n_status} onValueChange={(value) => handleArrayChange(index, 'med_n_status', value, 'medications')}><SelectTrigger id={`med_n_status-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{MED_STATUSES.map((status) => <SelectItem key={status} value={status} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{status}</SelectItem>)}</SelectContent></Select></div>
                          <div className="flex items-end pb-1.5"><div className="flex items-center space-x-2"><Checkbox id={`pa-required-${index}`} checked={med.med_n_pa_required} onCheckedChange={(checked) => handleArrayChange(index, 'med_n_pa_required', Boolean(checked), 'medications')} className="border-zinc-600 data-[state=checked]:bg-sky-500 data-[state=checked]:text-zinc-900" /><Label htmlFor={`pa-required-${index}`} className="text-sm font-medium text-zinc-300 cursor-pointer">PA Required</Label></div></div>
                        </div>
                      </div>
                    )})}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addItemToArray('medications')} className="mt-5 border-sky-500/50 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"><Plus className="h-4 w-4 mr-2" /> Add Medication</Button>
                </AccordionContent>
              </AccordionItem>

              {/* Treatments Section */}
              <AccordionItem value="treatments" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling"><div className="flex items-center"><Stethoscope className="h-6 w-6 mr-3 text-violet-400 group-hover:text-violet-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Treatments</span></div></AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-0 bg-black/30">
                {formState.treatments.length === 0 && <p className="text-zinc-400 text-sm italic my-3">No treatments recorded.</p>}
                  <div className="space-y-4">
                    {formState.treatments.map((treatment, index) => {
                      const popoverId = treatment.id || `treatmentName-${index}`;
                      return (
                      <div key={`treatment-${index}`} className="p-4 border border-zinc-700/60 rounded-lg bg-zinc-800/40">
                        <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-semibold text-violet-300">Treatment #{index + 1}</h3><Button type="button" variant="ghost" size="icon" onClick={() => removeFromArray('treatments', index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <Label htmlFor={popoverId + "_trigger"} className="block text-sm font-medium text-zinc-300 mb-1.5">Name</Label>
                            <Popover open={popoverOpenState[popoverId]} onOpenChange={(open) => handlePopoverOpenChange(popoverId, open)}>
                              <PopoverTrigger asChild>
                                <Button id={popoverId + "_trigger"} variant="outline" role="combobox" aria-expanded={popoverOpenState[popoverId]} className="w-full justify-between font-normal bg-zinc-900/70 border-zinc-700 text-zinc-200 hover:bg-zinc-800/90 hover:text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500">
                                  {treatment.treatment_n_name || "Select treatment..."} <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md max-h-60"><Command><CommandInput placeholder="Search treatment..." className="h-9 bg-zinc-800 border-b border-zinc-700 text-zinc-100 placeholder:text-zinc-400 ring-offset-black focus:ring-1 focus:ring-cyan-500" /><CommandList><CommandEmpty>No treatment found.</CommandEmpty><CommandGroup>{renderCommandItems(TREATMENTS, treatment.treatment_n_name, (value) => handleArrayChange(index, 'treatment_n_name', value, 'treatments'), popoverId)}</CommandGroup></CommandList></Command></PopoverContent>
                            </Popover>
                          </div>
                          <div><Label htmlFor={`treatment_n_status-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Status</Label><Select value={treatment.treatment_n_status} onValueChange={(value) => handleArrayChange(index, 'treatment_n_status', value, 'treatments')}><SelectTrigger id={`treatment_n_status-${index}`} className="w-full bg-zinc-900/70 border-zinc-700 text-zinc-100 ring-offset-black focus:ring-1 focus:ring-cyan-500"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent className="bg-zinc-900/95 border-zinc-700 text-zinc-200 backdrop-blur-md">{TREATMENT_STATUSES.map((status) => <SelectItem key={status} value={status} className="hover:!bg-cyan-600/20 focus:!bg-cyan-600/20">{status}</SelectItem>)}</SelectContent></Select></div>
                          <div className="md:col-span-2"><Label htmlFor={`treatment_n_details-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Details</Label><Textarea id={`treatment_n_details-${index}`} value={treatment.treatment_n_details} onChange={(e) => handleArrayChange(index, 'treatment_n_details', e.target.value, 'treatments')} className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 resize-none" rows={2}/></div>
                          <div><Label htmlFor={`treatment_n_date-${index}`} className="block text-sm font-medium text-zinc-300 mb-1.5">Date</Label><Input id={`treatment_n_date-${index}`} value={treatment.treatment_n_date} onChange={(e) => handleArrayChange(index, 'treatment_n_date', e.target.value, 'treatments')} type="date" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 date-input-styling" /></div>
                          <div className="flex items-end pb-1.5"><div className="flex items-center space-x-2"><Checkbox id={`treatment-pa-required-${index}`} checked={treatment.treatment_n_pa_required} onCheckedChange={(checked) => handleArrayChange(index, 'treatment_n_pa_required', Boolean(checked), 'treatments')} className="border-zinc-600 data-[state=checked]:bg-violet-500 data-[state=checked]:text-zinc-900" /><Label htmlFor={`treatment-pa-required-${index}`} className="text-sm font-medium text-zinc-300 cursor-pointer">PA Required</Label></div></div>
                        </div>
                      </div>
                    )})}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addItemToArray('treatments')} className="mt-5 border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"><Plus className="h-4 w-4 mr-2" /> Add Treatment</Button>
                </AccordionContent>
              </AccordionItem>

              {/* Imaging & Diagnostics Section */}
              <AccordionItem value="imaging" className="border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/30 shadow-md">
                <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/40 transition-colors group accordion-trigger-styling"><div className="flex items-center"><Radiation className="h-6 w-6 mr-3 text-yellow-400 group-hover:text-yellow-300 transition-colors" /><span className="text-zinc-100 font-semibold text-base">Imaging & Diagnostics</span></div></AccordionTrigger>
                <AccordionContent className="px-4 pb-6 pt-3 bg-black/30">
                  <div className="space-y-5">
                    <div><Label htmlFor="last_imaging_summary" className="block text-sm font-medium text-zinc-300 mb-1.5">Last Imaging Summary</Label><Textarea id="last_imaging_summary" name="last_imaging_summary" value={formState.last_imaging_summary} onChange={handleChange} rows={3} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 resize-none" placeholder="Enter summary of recent imaging results..." /></div>
                    <div><Label htmlFor="last_ecg_summary" className="block text-sm font-medium text-zinc-300 mb-1.5">Last ECG Summary</Label><Textarea id="last_ecg_summary" name="last_ecg_summary" value={formState.last_ecg_summary} onChange={handleChange} rows={3} className="bg-zinc-800/70 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 ring-offset-black focus:ring-1 focus:ring-cyan-500 resize-none" placeholder="Enter summary of recent ECG findings..." /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator className="my-8 bg-zinc-700/50" />
          {connectionStatus === 'error' && (<div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200"><div className="font-semibold mb-1.5 flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-red-400" /> Backend Connection Error</div><p className="text-sm">{connectionError || "Unable to connect to the care plan generation service. Please check your connection or try again later."}</p><Button variant="link" size="sm" className="text-red-300 hover:text-red-200 p-0 h-auto mt-1" onClick={testBackend}>Retry Connection</Button></div>)}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* The distinction between streaming/non-streaming is now handled by which SonarService method is called in page.tsx */}
            {/* This button will now always trigger the sequential streaming via the updated onSubmit */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => handleSubmit(true)} // `true` for useStreaming is now implicit for this flow
                    disabled={isLoading || connectionStatus === 'error'} 
                    className="w-full sm:w-auto text-base px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : <Activity className="mr-2 h-5 w-5" />}
                    Generate Multi-Stage Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800/90 text-zinc-200 border-zinc-700 backdrop-blur-sm">
                  <p>Generate the care plan sequentially, stage by stage.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
      <footer className="text-center mt-12 pb-8"><p className="text-xs text-zinc-500">Care Plan Synthesizer v1.2 | For demonstration purposes only.</p></footer>
      <style jsx global>{`
        .date-input-styling::-webkit-calendar-picker-indicator { filter: invert(0.8) brightness(100%) sepia(10%) saturate(1000%) hue-rotate(180deg); cursor: pointer; }
        .accordion-trigger-styling:focus-visible { outline: 2px solid var(--tw-ring-color, hsl(190 95% 50% / 1)); /* Adjusted to a more visible cyan focus */ outline-offset: 2px; border-radius: 0.375rem; /* rounded-md */ }
        .popover-content-width { width: var(--radix-popover-trigger-width); }
        /* Scenario scrollbar styles */
        .scenario-scrollbar {
          overflow-y: scroll !important;
          scrollbar-width: thin;
          scrollbar-color: #22d3ee #18181b;
        }
        .scenario-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .scenario-scrollbar::-webkit-scrollbar-thumb {
          background: #22d3ee;
          border-radius: 6px;
        }
        .scenario-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
        }
      `}</style>
    </div>
  );
};

export default PatientDataForm;
