export interface LabResult {
  lab_n_name: string;
  lab_n_value: string; // e.g., "1200 pg/mL" or "High"
  lab_n_flag: 'L' | 'H' | 'C' | 'N' | ''; // Low, High, Critical, Normal, None
  lab_n_trend: 'Improving' | 'Worsening' | 'Stable' | '';
}

export interface Medication {
  med_n_name: string;
  med_n_dosage: string;
  med_n_route: string;
  med_n_frequency: string;
  med_n_status: string; // e.g., "Active", "Discontinued", "PRN"
  med_n_pa_required?: boolean | string; 
}

export interface Treatment {
  treatment_n_name: string;
  treatment_n_status: string; // e.g., "Completed", "Ongoing", "Planned"
  treatment_n_details?: string;
  treatment_n_date?: string; // YYYY-MM-DD or description
  treatment_n_pa_required?: boolean | string;
}

export interface VitalSigns {
  vital_bp: string; // e.g., "120/80 mmHg"
  vital_pulse: string; // e.g., "75 bpm"
  vital_resp_rate: string; // e.g., "16 breaths/min"
  vital_temp: string; // e.g., "37.0°C" or "98.6°F"
  vital_o2sat: string; // e.g., "98%"
  vital_pain_score: string; // e.g., "2/10"
}

export interface PatientInfo {
  // Patient Demographics
  patient_full_name: string;
  patient_age: number | string;
  patient_gender: 'Male' | 'Female' | 'Other' | 'Prefer not to specify';
  patient_mrn: string;
  patient_dob: string; // YYYY-MM-DD
  patient_insurance_plan: string;
  patient_policy_number: string;
  patient_primary_provider: string;
  patient_admission_date: string; // YYYY-MM-DD

  // Clinical Information
  allergies: string[];
  vitalSigns: VitalSigns;
  nyha_class_description?: 'NYHA Class I' | 'NYHA Class II' | 'NYHA Class III' | 'NYHA Class IV' | 'N/A';

  // From clinicalData in schema
  primary_diagnosis_text: string;
  secondaryDiagnoses: string[];
  labs: LabResult[];
  
  // New fields based on feedback and UI
  patient_severity_class?: string; // e.g., "NYHA Class III", "GAF 45", "Mild"
  medications?: Medication[];
  treatments?: Treatment[];
  last_imaging_summary?: string; // For general cases or specific mental health reports
  last_ecg_summary?: string;   // For general cases or specific mental health reports
  condition_category?: 'General Medicine' | 'Cardiology' | 'Pulmonology' | 'Mental Health' | 'Neurology' | 'Other';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  patientInfo: PatientInfo;
}

const getCurrentDateISO = () => new Date().toISOString().split('T')[0];

export const scenarios: Scenario[] = [
  // Scenario 1: Cardiology - CHF Exacerbation
  {
    id: 'scenario_chf_exacerbation',
    name: 'CHF Exacerbation',
    description: '72 y/o male, acute CHF exacerbation, NYHA IV.',
    patientInfo: {
      patient_full_name: 'Johnathan Doe',
      patient_age: 72,
      patient_gender: 'Male',
      patient_mrn: 'MRN72CHF001',
      patient_dob: '1953-03-15',
      patient_insurance_plan: 'Medicare Advantage Plan B',
      patient_policy_number: 'POL987654321',
      patient_primary_provider: 'Dr. Emily Carter',
      patient_admission_date: getCurrentDateISO(),
      allergies: ['Penicillin (rash)'],
      vitalSigns: {
        vital_bp: '160/95 mmHg',
        vital_pulse: '110 bpm',
        vital_resp_rate: '28 breaths/min',
        vital_temp: '37.2°C',
        vital_o2sat: '88% on Room Air',
        vital_pain_score: '3/10 (chest discomfort)',
      },
      nyha_class_description: 'NYHA Class IV',
      primary_diagnosis_text: 'Acute Exacerbation of Chronic Heart Failure',
      secondaryDiagnoses: ['Hypertension', 'Type 2 Diabetes Mellitus', 'CKD Stage 3'],
      labs: [
        { lab_n_name: 'BNP', lab_n_value: '1200 pg/mL', lab_n_flag: 'H', lab_n_trend: 'Worsening' },
        { lab_n_name: 'Troponin I', lab_n_value: '0.08 ng/mL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        { lab_n_name: 'Potassium', lab_n_value: '3.2 mEq/L', lab_n_flag: 'L', lab_n_trend: 'Worsening' },
      ],
    },
  },
  // Scenario 2: Endocrinology - T1DM DKA
  {
    id: 'scenario_t1dm_dka',
    name: 'T1DM DKA',
    description: '28 y/o female, new Type 1 Diabetes, DKA.',
    patientInfo: {
      patient_full_name: 'Jane Smith',
      patient_age: 28,
      patient_gender: 'Female',
      patient_mrn: 'MRN28T1DM002',
      patient_dob: '1997-07-20',
      patient_insurance_plan: 'BlueCross PPO',
      patient_policy_number: 'POLBCBS12345',
      patient_primary_provider: 'Dr. Alan Grant',
      patient_admission_date: getCurrentDateISO(),
      allergies: ['No Known Allergies'],
      vitalSigns: {
        vital_bp: '90/60 mmHg',
        vital_pulse: '120 bpm',
        vital_resp_rate: '30 breaths/min (Kussmaul)',
        vital_temp: '37.8°C',
        vital_o2sat: '97% on Room Air',
        vital_pain_score: '5/10 (abdominal pain)',
      },
      nyha_class_description: 'N/A',
      primary_diagnosis_text: 'Diabetic Ketoacidosis (DKA) secondary to new onset Type 1 Diabetes Mellitus',
      secondaryDiagnoses: ['Dehydration', 'Metabolic Acidosis'],
      labs: [
        { lab_n_name: 'Glucose', lab_n_value: '550 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        { lab_n_name: 'pH (arterial)', lab_n_value: '7.15', lab_n_flag: 'L', lab_n_trend: 'Stable' },
        { lab_n_name: 'Bicarbonate', lab_n_value: '10 mEq/L', lab_n_flag: 'L', lab_n_trend: 'Stable' },
        { lab_n_name: 'Anion Gap', lab_n_value: '25 mEq/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        { lab_n_name: 'Ketones (serum)', lab_n_value: 'Positive (Large)', lab_n_flag: 'H', lab_n_trend: 'Stable' },
      ],
    },
  },
  // Scenario 3: Pulmonology (Pediatric) - Asthma Exacerbation
  {
    id: 'scenario_ped_asthma',
    name: 'Pediatric Asthma',
    description: '8 y/o child, severe asthma exacerbation.',
    patientInfo: {
      patient_full_name: 'Timmy Green',
      patient_age: 8,
      patient_gender: 'Male',
      patient_mrn: 'MRN08ASTHMA003',
      patient_dob: '2017-01-10',
      patient_insurance_plan: 'CHIP',
      patient_policy_number: 'POLCHIP67890',
      patient_primary_provider: 'Dr. Laura Dern',
      patient_admission_date: getCurrentDateISO(),
      allergies: ['Dust Mites', 'Pollen'],
      vitalSigns: {
        vital_bp: '100/60 mmHg',
        vital_pulse: '130 bpm',
        vital_resp_rate: '35 breaths/min (wheezing)',
        vital_temp: '37.0°C',
        vital_o2sat: '90% on 2L Nasal Cannula',
        vital_pain_score: '2/10 (chest tightness)',
      },
      nyha_class_description: 'N/A',
      primary_diagnosis_text: 'Severe Asthma Exacerbation',
      secondaryDiagnoses: ['Allergic Rhinitis'],
      labs: [
        { lab_n_name: 'Peak Expiratory Flow', lab_n_value: '40% of predicted', lab_n_flag: 'L', lab_n_trend: 'Worsening' },
        { lab_n_name: 'WBC', lab_n_value: '12,000/uL (Eosinophils 8%)', lab_n_flag: 'H', lab_n_trend: 'Stable' },
      ],
    },
  },
  // Scenario 4: Orthopedics/Post-Op - DVT
  {
    id: 'scenario_postop_dvt',
    name: 'Post-Op DVT',
    description: '65 y/o female, post-THA, signs of DVT.',
    patientInfo: {
      patient_full_name: 'Alice Brown',
      patient_age: 65,
      patient_gender: 'Female',
      patient_mrn: 'MRN65DVT004',
      patient_dob: '1960-11-05',
      patient_insurance_plan: 'Aetna HMO',
      patient_policy_number: 'POLAETNA11223',
      patient_primary_provider: 'Dr. Sam Neill',
      patient_admission_date: getCurrentDateISO(), // Assuming admission for DVT workup
      allergies: ['Codeine (nausea)'],
      vitalSigns: {
        vital_bp: '130/80 mmHg',
        vital_pulse: '88 bpm',
        vital_resp_rate: '18 breaths/min',
        vital_temp: '37.5°C',
        vital_o2sat: '96% on Room Air',
        vital_pain_score: '6/10 (left calf pain)',
      },
      nyha_class_description: 'N/A',
      primary_diagnosis_text: 'Deep Vein Thrombosis (DVT) of Left Lower Extremity',
      secondaryDiagnoses: ['Post-Total Hip Arthroplasty (Right Hip, 2 days ago)', 'Obesity'],
      labs: [
        { lab_n_name: 'D-dimer', lab_n_value: '2500 ng/mL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        { lab_n_name: 'Platelets', lab_n_value: '250,000/uL', lab_n_flag: 'N', lab_n_trend: 'Stable' },
      ],
    },
  },
  // Scenario 5: Infectious Disease - CAP & Sepsis
  {
    id: 'scenario_cap_sepsis',
    name: 'CAP & Sepsis',
    description: '58 y/o male, community-acquired pneumonia, sepsis.',
    patientInfo: {
      patient_full_name: 'Robert Jones',
      patient_age: 58,
      patient_gender: 'Male',
      patient_mrn: 'MRN58SEPSIS005',
      patient_dob: '1967-05-25',
      patient_insurance_plan: 'United Healthcare PPO',
      patient_policy_number: 'POLUHC33445',
      patient_primary_provider: 'Dr. Jeff Goldblum',
      patient_admission_date: getCurrentDateISO(),
      allergies: ['No Known Allergies'],
      vitalSigns: {
        vital_bp: '85/50 mmHg',
        vital_pulse: '115 bpm',
        vital_resp_rate: '26 breaths/min',
        vital_temp: '38.9°C',
        vital_o2sat: '91% on 4L Nasal Cannula',
        vital_pain_score: '4/10 (pleuritic chest pain)',
      },
      nyha_class_description: 'N/A',
      primary_diagnosis_text: 'Sepsis secondary to Community-Acquired Pneumonia (CAP)',
      secondaryDiagnoses: ['Acute Kidney Injury (AKI)', 'Hypertension (history of)'],
      labs: [
        { lab_n_name: 'WBC', lab_n_value: '18,500/uL (Bands 15%)', lab_n_flag: 'H', lab_n_trend: 'Worsening' },
        { lab_n_name: 'Lactate', lab_n_value: '4.2 mmol/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        { lab_n_name: 'Creatinine', lab_n_value: '2.5 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Worsening' },
        { lab_n_name: 'Procalcitonin', lab_n_value: '15 ng/mL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
      ],
    },
  },
  // Scenario 6: Obstetrics - Severe Pre-eclampsia
  {
    id: 'scenario_obs_preeclampsia',
    name: 'Severe Pre-eclampsia',
    description: '34 y/o G2P1, 36 weeks, severe pre-eclampsia.',
    patientInfo: {
        patient_full_name: 'Maria Garcia',
        patient_age: 34,
        patient_gender: 'Female',
        patient_mrn: 'MRN34PREEC006',
        patient_dob: '1991-09-12',
        patient_insurance_plan: 'Kaiser Permanente',
        patient_policy_number: 'POLKP55667',
        patient_primary_provider: 'Dr. Ariana Richards',
        patient_admission_date: getCurrentDateISO(),
        allergies: ['No Known Allergies'],
        vitalSigns: {
            vital_bp: '170/115 mmHg',
            vital_pulse: '90 bpm',
            vital_resp_rate: '20 breaths/min',
            vital_temp: '37.1°C',
            vital_o2sat: '98% on Room Air',
            vital_pain_score: '7/10 (headache), 3/10 (epigastric pain)',
        },
        nyha_class_description: 'N/A',
        primary_diagnosis_text: 'Severe Pre-eclampsia at 36 weeks gestation',
        secondaryDiagnoses: ['Gestational Hypertension (history of)', 'Proteinuria'],
        labs: [
            { lab_n_name: 'Proteinuria (dipstick)', lab_n_value: '3+', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'Platelets', lab_n_value: '90,000/uL', lab_n_flag: 'L', lab_n_trend: 'Worsening' },
            { lab_n_name: 'AST', lab_n_value: '80 U/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'ALT', lab_n_value: '75 U/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'Uric Acid', lab_n_value: '8.0 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
        ],
    },
  },
  // Scenario 7: Nephrology - ESRD Fluid Overload
  {
    id: 'scenario_esrd_fluid_overload',
    name: 'ESRD Fluid Overload',
    description: '60 y/o male, ESRD, missed HD, fluid overload.',
    patientInfo: {
        patient_full_name: 'David Wilson',
        patient_age: 60,
        patient_gender: 'Male',
        patient_mrn: 'MRN60ESRD007',
        patient_dob: '1965-02-28',
        patient_insurance_plan: 'Medicaid',
        patient_policy_number: 'POLMCAID77889',
        patient_primary_provider: 'Dr. Richard Attenborough',
        patient_admission_date: getCurrentDateISO(),
        allergies: ['Lisinopril (cough)'],
        vitalSigns: {
            vital_bp: '180/100 mmHg',
            vital_pulse: '105 bpm (irregular)',
            vital_resp_rate: '24 breaths/min (crackles bilaterally)',
            vital_temp: '36.8°C',
            vital_o2sat: '90% on 3L Nasal Cannula',
            vital_pain_score: '2/10 (generalized discomfort)',
        },
        nyha_class_description: 'NYHA Class III', // Can be related to fluid status
        primary_diagnosis_text: 'Fluid Overload and Hyperkalemia secondary to Missed Hemodialysis Sessions in ESRD',
        secondaryDiagnoses: ['End-Stage Renal Disease (ESRD)', 'Hypertension', 'Atrial Fibrillation'],
        labs: [
            { lab_n_name: 'Potassium', lab_n_value: '6.8 mEq/L', lab_n_flag: 'H', lab_n_trend: 'Worsening' },
            { lab_n_name: 'Creatinine', lab_n_value: '8.5 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'BUN', lab_n_value: '90 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'BNP', lab_n_value: '900 pg/mL', lab_n_flag: 'H', lab_n_trend: 'Worsening' },
        ],
    },
  },
  // Scenario 8: Mental Health - MDD Suicidal Ideation
  {
    id: 'scenario_mdd_suicidal',
    name: 'MDD Suicidal Ideation',
    description: '45 y/o, major depressive disorder, acute suicidal ideation.',
    patientInfo: {
        patient_full_name: 'Sarah Miller',
        patient_age: 45,
        patient_gender: 'Female', // Changed for variety
        patient_mrn: 'MRN45MDDSI008',
        patient_dob: '1980-06-10',
        patient_insurance_plan: 'Cigna Open Access',
        patient_policy_number: 'POLCIGNA99001',
        patient_primary_provider: 'Dr. Wayne Knight',
        patient_admission_date: getCurrentDateISO(),
        allergies: ['No Known Allergies'],
        vitalSigns: {
            vital_bp: '120/75 mmHg',
            vital_pulse: '80 bpm',
            vital_resp_rate: '16 breaths/min',
            vital_temp: '36.9°C',
            vital_o2sat: '99% on Room Air',
            vital_pain_score: '0/10',
        },
        nyha_class_description: 'N/A',
        primary_diagnosis_text: 'Major Depressive Disorder, Recurrent, Severe, with Acute Suicidal Ideation',
        secondaryDiagnoses: ['Generalized Anxiety Disorder'],
        labs: [ // Labs typically normal unless co-occurring physical issue or medication side effect check
            { lab_n_name: 'TSH', lab_n_value: '2.5 mIU/L', lab_n_flag: 'N', lab_n_trend: 'Stable' },
            { lab_n_name: 'Vitamin D', lab_n_value: '25 ng/mL', lab_n_flag: 'L', lab_n_trend: 'Stable' }, // Common to check
        ],
    },
  },
  // Scenario 9: Gastroenterology - Acute Pancreatitis
  {
    id: 'scenario_acute_pancreatitis',
    name: 'Acute Pancreatitis',
    description: '50 y/o female, acute pancreatitis due to gallstones.',
    patientInfo: {
        patient_full_name: 'Linda Davis',
        patient_age: 50,
        patient_gender: 'Female',
        patient_mrn: 'MRN50PANC009',
        patient_dob: '1975-04-03',
        patient_insurance_plan: 'Humana Gold Plus',
        patient_policy_number: 'POLHUMANA12121',
        patient_primary_provider: 'Dr. Martin Ferrero',
        patient_admission_date: getCurrentDateISO(),
        allergies: ['Sulfa drugs (rash)'],
        vitalSigns: {
            vital_bp: '100/70 mmHg',
            vital_pulse: '110 bpm',
            vital_resp_rate: '22 breaths/min',
            vital_temp: '38.5°C',
            vital_o2sat: '95% on Room Air',
            vital_pain_score: '9/10 (epigastric pain radiating to back)',
        },
        nyha_class_description: 'N/A',
        primary_diagnosis_text: 'Acute Pancreatitis, likely secondary to Cholelithiasis',
        secondaryDiagnoses: ['Cholelithiasis', 'Nausea and Vomiting'],
        labs: [
            { lab_n_name: 'Amylase', lab_n_value: '1200 U/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'Lipase', lab_n_value: '3500 U/L', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'WBC', lab_n_value: '16,000/uL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'ALT', lab_n_value: '250 U/L', lab_n_flag: 'H', lab_n_trend: 'Stable' }, // Suggests gallstone etiology
        ],
    },
  },
  // Scenario 10: Neurology - Acute Ischemic Stroke
  {
    id: 'scenario_stroke_ischemic',
    name: 'Acute Ischemic Stroke',
    description: '78 y/o male, acute ischemic stroke symptoms.',
    patientInfo: {
        patient_full_name: 'James White',
        patient_age: 78,
        patient_gender: 'Male',
        patient_mrn: 'MRN78STROKE010',
        patient_dob: '1947-12-01',
        patient_insurance_plan: 'Tricare for Life',
        patient_policy_number: 'POLTRICARE34343',
        patient_primary_provider: 'Dr. Bob Peck',
        patient_admission_date: getCurrentDateISO(),
        allergies: ['Iodine contrast (anaphylaxis)'],
        vitalSigns: {
            vital_bp: '190/100 mmHg', // Permissive hypertension initially
            vital_pulse: '95 bpm (atrial fibrillation)',
            vital_resp_rate: '18 breaths/min',
            vital_temp: '37.0°C',
            vital_o2sat: '96% on Room Air',
            vital_pain_score: '0/10 (but has right-sided weakness, facial droop, aphasia)',
        },
        nyha_class_description: 'N/A',
        primary_diagnosis_text: 'Acute Ischemic Stroke (Left MCA territory)',
        secondaryDiagnoses: ['Atrial Fibrillation (chronic)', 'Hypertension', 'Hyperlipidemia'],
        labs: [ // Focus on labs relevant to stroke workup and tPA consideration
            { lab_n_name: 'Glucose (fingerstick)', lab_n_value: '150 mg/dL', lab_n_flag: 'H', lab_n_trend: 'Stable' },
            { lab_n_name: 'INR', lab_n_value: '1.1', lab_n_flag: 'N', lab_n_trend: 'Stable' }, 
            { lab_n_name: 'Platelets', lab_n_value: '220,000/uL', lab_n_flag: 'N', lab_n_trend: 'Stable' }, 
        ],
        patient_severity_class: 'NIHSS Score 12 (Moderate-Severe)',
        medications: [
            { med_n_name: 'Alteplase (tPA)', med_n_dosage: 'Per protocol', med_n_route: 'IV', med_n_frequency: 'Once', med_n_status: 'Administered (if eligible)' },
            { med_n_name: 'Aspirin', med_n_dosage: '325mg PO', med_n_route: 'PO', med_n_frequency: 'Once, then daily', med_n_status: 'Active' },
        ],
        treatments: [
            { treatment_n_name: 'CT Head without contrast', treatment_n_status: 'Completed', treatment_n_details: 'No hemorrhage.' },
            { treatment_n_name: 'Neurological Checks Q15min', treatment_n_status: 'Ongoing' },
        ],
        last_imaging_summary: 'CT Head: No acute bleed. MRI pending to confirm infarct.',
        last_ecg_summary: 'Atrial fibrillation with rapid ventricular response.',
        condition_category: 'Neurology',
    },
  }
];

export const getScenarioById = (id: string): Scenario | undefined => {
  return scenarios.find(scenario => scenario.id === id);
};
