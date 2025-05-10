'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PatientInfo, Scenario, scenarios, getScenarioById, LabResult, VitalSigns } from '@/lib/scenario-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Slider } from '@/components/ui/slider'; // Not used in current form
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar as CalendarIcon, User, Activity, ShieldAlert, Stethoscope, TestTube2, PlusCircle, Trash2, Info, FileText, Edit3, ChevronDown, Zap, Brain } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// import { format as formatDate } from 'date-fns'; // Not directly used, toLocaleDateString is used
import { cn } from '@/lib/utils';

interface PatientDataFormProps {
  onSubmit: (patientInfo: PatientInfo) => void;
  isLoading: boolean;
}

const initialPatientInfo: PatientInfo = {
  patient_full_name: 'SimPatient Omega',
  patient_age: '',
  patient_gender: 'Prefer not to specify',
  patient_mrn: 'SIM-CUSTOM-000',
  patient_dob: '',
  patient_insurance_plan: 'N/A',
  patient_policy_number: 'N/A',
  patient_primary_provider: 'N/A',
  patient_admission_date: new Date().toISOString().split('T')[0],
  allergies: [],
  vitalSigns: {
    vital_bp: 'N/A',
    vital_pulse: 'N/A',
    vital_resp_rate: 'N/A',
    vital_temp: 'N/A',
    vital_o2sat: 'N/A',
    vital_pain_score: '0/10',
  },
  nyha_class_description: 'N/A',
  primary_diagnosis_text: '',
  secondaryDiagnoses: [],
  labs: [],
};

const commonDiagnoses = [
  'Hypertension', 'Type 2 Diabetes Mellitus', 'Coronary Artery Disease', 'Asthma', 'COPD',
  'Atrial Fibrillation', 'Gastroesophageal Reflux Disease (GERD)', 'Anemia', 'Hypothyroidism',
  'Hyperlipidemia', 'Osteoarthritis', 'Chronic Kidney Disease', 'Depression', 'Anxiety Disorder',
  'Urinary Tract Infection', 'Pneumonia', 'Cellulitis', 'Dehydration', 'Acute Viral Illness',
  'Allergic Rhinitis', 'Migraine', 'Obesity', 'Sleep Apnea', 'Peripheral Neuropathy', 'Dementia'
];

const commonAllergies = [
  'Penicillin', 'Sulfa drugs', 'Aspirin', 'NSAIDs (e.g., Ibuprofen)', 'Codeine',
  'Morphine', 'Latex', 'Iodine contrast', 'Shellfish', 'Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Soy', 'Wheat'
];

const commonLabTests = [
  { name: 'Complete Blood Count (CBC)', fields: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'] },
  { name: 'Basic Metabolic Panel (BMP)', fields: ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'BUN', 'Creatinine', 'Glucose'] },
  { name: 'Comprehensive Metabolic Panel (CMP)', fields: ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'BUN', 'Creatinine', 'Glucose', 'Calcium', 'Albumin', 'Total Protein', 'ALP', 'ALT', 'AST', 'Bilirubin'] },
  { name: 'Lipid Panel', fields: ['Total Cholesterol', 'LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides'] },
  { name: 'Thyroid Panel', fields: ['TSH', 'Free T4'] },
  { name: 'Liver Function Tests (LFTs)', fields: ['Albumin', 'Total Protein', 'ALP', 'ALT', 'AST', 'Bilirubin', 'GGT', 'LDH'] },
  { name: 'Coagulation Panel', fields: ['PT', 'INR', 'PTT'] },
  { name: 'Urinalysis', fields: ['Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Leukocytes', 'Nitrites', 'Blood'] },
  { name: 'BNP (B-type Natriuretic Peptide)', fields: ['BNP'] },
  { name: 'Troponin', fields: ['Troponin I', 'Troponin T'] },
  { name: 'D-dimer', fields: ['D-dimer'] },
];


const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('custom');
  const [formData, setFormData] = useState<PatientInfo>(initialPatientInfo);
  const [isCustomMode, setIsCustomMode] = useState(true);

  useEffect(() => {
    if (selectedScenarioId === 'custom') {
      setIsCustomMode(true);
      // Deep clone initialPatientInfo to prevent mutation issues with nested objects like vitalSigns and labs
      setFormData(JSON.parse(JSON.stringify(initialPatientInfo)));
    } else {
      setIsCustomMode(false);
      const scenario = getScenarioById(selectedScenarioId);
      if (scenario) {
        // Deep clone scenario.patientInfo
        setFormData(JSON.parse(JSON.stringify(scenario.patientInfo)));
      }
    }
  }, [selectedScenarioId]);

  const handleFormChange = useCallback(<K extends keyof PatientInfo>(
    field: K,
    value: PatientInfo[K]
  ) => {
    if (!isCustomMode) return;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, [isCustomMode]);

  const handleVitalSignChange = useCallback((
    field: keyof VitalSigns,
    value: string
  ) => {
    if (!isCustomMode) return;
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value,
      },
    }));
  }, [isCustomMode]);

  const handleListChange = (field: 'allergies' | 'secondaryDiagnoses', item: string, checked: boolean) => {
    if (!isCustomMode) return;
    setFormData(prev => {
      const list = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...list, item] };
      } else {
        return { ...prev, [field]: list.filter(i => i !== item) };
      }
    });
  };

  const handleLabChange = (index: number, field: keyof LabResult, value: string) => {
    if (!isCustomMode) return;
    setFormData(prev => {
      const newLabs = [...prev.labs];
      newLabs[index] = { ...newLabs[index], [field]: value };
      return { ...prev, labs: newLabs };
    });
  };

  const addLab = () => {
    if (!isCustomMode) return;
    setFormData(prev => ({
      ...prev,
      labs: [...prev.labs, { lab_n_name: '', lab_n_value: '', lab_n_flag: '', lab_n_trend: '' }],
    }));
  };

  const removeLab = (index: number) => {
    if (!isCustomMode) return;
    setFormData(prev => ({
      ...prev,
      labs: prev.labs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputBaseClasses = "w-full bg-[rgba(20,30,50,0.35)] backdrop-blur-sm text-light-text placeholder-electric-cyan/50 border border-electric-cyan/40 focus:border-electric-cyan focus:ring-2 focus:ring-electric-cyan/50 focus:shadow-glow-cyan-xs rounded-lg py-3 px-4 shadow-md transition-all duration-200 ease-in-out";
  const selectTriggerClasses = `${inputBaseClasses} justify-start text-left font-normal`;
  const selectContentClasses = "bg-[rgba(5,10,20,0.6)] backdrop-blur-lg text-light-text border border-electric-cyan/50 shadow-xl rounded-lg";
  const selectItemClasses = "py-3 px-4 hover:bg-electric-cyan/20 focus:bg-electric-cyan/30 cursor-pointer data-[state=checked]:bg-electric-cyan/70 data-[state=checked]:text-cyber-dark-bg font-medium";
  
  const sectionCardClasses = "bg-[rgba(10,20,40,0.2)] backdrop-blur-md border border-electric-cyan/20 shadow-lg shadow-electric-cyan/5 rounded-xl overflow-hidden";
  const accordionTriggerClasses = "text-xl font-audiowide text-light-text hover:bg-electric-cyan/10 px-6 py-5 transition-colors duration-150 ease-in-out group data-[state=open]:bg-electric-cyan/10 data-[state=open]:text-electric-cyan";
  const accordionContentClasses = "pt-6 pb-8 px-10 space-y-7 bg-[rgba(10,20,40,0.3)] backdrop-blur-sm border-t border-electric-cyan/20"; // Increased px-6 to px-10
  const labelClasses = "text-sm font-semibold text-electric-cyan/80 mb-2 block tracking-wider uppercase";


  const renderReadOnlyField = (label: string, value: string | number | undefined, icon?: React.ReactNode) => (
    <div className="mb-4">
      <Label className={`${labelClasses} flex items-center`}>
        {icon && <span className="mr-2 opacity-80">{icon}</span>}
        {label}
      </Label>
      <div className="text-base p-3 bg-[rgba(20,30,50,0.5)] backdrop-blur-sm text-light-text/90 rounded-lg min-h-[44px] mt-1 shadow-inner border border-electric-cyan/30 font-mono">
        {String(value ?? 'N/A')}
      </div>
    </div>
  );

  const renderReadOnlyList = (label: string, items: string[] | undefined, icon?: React.ReactNode) => (
     <div className="mb-4">
      <Label className={`${labelClasses} flex items-center`}>
        {icon && <span className="mr-2 opacity-80">{icon}</span>}
        {label}
      </Label>
      <div className="text-base p-3 bg-[rgba(20,30,50,0.5)] backdrop-blur-sm text-light-text/90 rounded-lg min-h-[44px] mt-1 shadow-inner border border-electric-cyan/30 font-mono">
        {items && items.length > 0 ? items.join(', ') : 'N/A'}
      </div>
    </div>
  );

  const genderOptions: PatientInfo['patient_gender'][] = ['Male', 'Female', 'Other', 'Prefer not to specify'];
  const nyhaOptions: PatientInfo['nyha_class_description'][] = ['NYHA Class I', 'NYHA Class II', 'NYHA Class III', 'NYHA Class IV', 'N/A'];
  const labFlagOptions: LabResult['lab_n_flag'][] = ['L', 'H', 'C', 'N', ''];
  const labTrendOptions: LabResult['lab_n_trend'][] = ['Improving', 'Worsening', 'Stable', ''];

  const selectedScenarioDetails = useMemo(() => {
    if (selectedScenarioId === 'custom') return { name: "Custom Scenario Configuration", description: "Manually configure all patient parameters or quick-add common data sets."};
    return scenarios.find(s => s.id === selectedScenarioId);
  }, [selectedScenarioId]);

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-glow-panel-cyan bg-[rgba(10,20,40,0.15)] backdrop-blur-xl border border-electric-cyan/30 text-light-text rounded-2xl overflow-hidden font-sans">
      <CardHeader className="bg-gradient-to-br from-[rgba(0,243,255,0.1)] to-[rgba(13,5,21,0.2)] p-6 sm:p-8 border-b border-electric-cyan/20">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Zap size={48} className="text-electric-cyan animate-pulse-glow" />
          <div>
            <CardTitle className="text-4xl font-audiowide tracking-wider text-electric-cyan [text-shadow:_0_0_8px_theme(colors.electric-cyan)]">
              Patient Data Interface
            </CardTitle>
            <CardDescription className="text-electric-cyan/70 mt-2 text-base">
              Input detailed patient profiles or select pre-defined clinical scenarios for ADPIE plan generation.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-10">
        {/* Scenario Selection Section */}
        <div className={`${sectionCardClasses} p-6`}>
          <Label htmlFor="scenario-select" className="text-2xl font-audiowide mb-5 block text-electric-cyan flex items-center [text-shadow:_0_0_5px_theme(colors.electric-cyan)]">
            <Brain size={26} className="mr-3.5 text-cyber-magenta" /> Scenario Matrix
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
            <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
              <SelectTrigger 
                id="scenario-select" 
                className={cn(selectTriggerClasses, "text-base")}
              >
                <SelectValue placeholder="Select Scenario or Create Custom..." />
              </SelectTrigger>
              <SelectContent className={selectContentClasses}>
                <SelectItem value="custom" className={selectItemClasses}>
                  <span className="text-lg mr-2.5">⚡</span> Configure Custom Patient
                </SelectItem>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id} className={selectItemClasses}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedScenarioDetails && (
              <div className="bg-[rgba(5,10,20,0.4)] backdrop-blur-sm p-5 rounded-lg border border-electric-cyan/20 shadow-md h-full">
                <h4 className="font-audiowide text-xl text-electric-cyan mb-2 [text-shadow:_0_0_3px_theme(colors.electric-cyan)]">{selectedScenarioDetails.name}</h4>
                <p className="text-sm text-light-text/80 leading-relaxed font-mono">{selectedScenarioDetails.description}</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <Accordion type="multiple" defaultValue={['demographics', 'vitals']} className="w-full space-y-8">
            {/* Patient Demographics */}
            <AccordionItem value="demographics" className={sectionCardClasses}>
              <AccordionTrigger className={accordionTriggerClasses}>
                <div className="flex items-center">
                  <User className="mr-4 h-7 w-7 text-electric-cyan transition-transform duration-300 group-data-[state=open]:rotate-12 group-data-[state=open]:scale-110" /> Patient Demographics
                </div>
                <ChevronDown className="h-6 w-6 shrink-0 text-electric-cyan/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClasses}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8"> {/* Increased gap-x-10 to gap-x-16 */}
                  {isCustomMode ? (
                    <>
                      <div>
                        <Label htmlFor="patient_full_name" className={labelClasses}>Full Name</Label>
                        <Input id="patient_full_name" value={formData.patient_full_name} onChange={e => handleFormChange('patient_full_name', e.target.value)} placeholder="e.g., SimPatient Alpha" className={inputBaseClasses} />
                      </div>
                      <div>
                        <Label htmlFor="patient_mrn" className={labelClasses}>Medical Record Number (MRN)</Label>
                        <Input id="patient_mrn" value={formData.patient_mrn} onChange={e => handleFormChange('patient_mrn', e.target.value)} placeholder="e.g., SIM-CUSTOM-001" className={inputBaseClasses} />
                      </div>
                       <div>
                        <Label htmlFor="patient_age" className={labelClasses}>Age</Label>
                        <Input 
                          type="number" 
                          id="patient_age" 
                          value={String(formData.patient_age)}
                          onChange={e => handleFormChange('patient_age', e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                          placeholder="e.g., 65" 
                          className={inputBaseClasses}
                        />
                      </div>
                      <div>
                        <Label className={labelClasses}>Gender</Label>
                        <RadioGroup
                          value={formData.patient_gender}
                          onValueChange={(value) => handleFormChange('patient_gender', value as PatientInfo['patient_gender'])}
                          className="flex flex-wrap gap-x-6 gap-y-3 pt-2.5"
                        >
                          {genderOptions.map(opt => (
                            <div key={opt} className="flex items-center space-x-2.5 group">
                              <RadioGroupItem value={opt} id={`gender-${opt}`} className="border-electric-cyan/50 text-electric-cyan focus:ring-electric-cyan focus:ring-offset-cyber-dark-bg data-[state=checked]:border-electric-cyan data-[state=checked]:bg-electric-cyan/30 w-5 h-5" />
                              <Label htmlFor={`gender-${opt}`} className="font-medium text-light-text/80 cursor-pointer group-hover:text-electric-cyan transition-colors">{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="patient_dob" className={labelClasses}>Date of Birth</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                selectTriggerClasses,
                                !formData.patient_dob && "text-electric-cyan/50"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-electric-cyan/80" />
                              {formData.patient_dob ? new Date(formData.patient_dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-electric-cyan/50">Select date...</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={cn(selectContentClasses, "w-auto p-0")}>
                            <Calendar
                              mode="single"
                              selected={formData.patient_dob ? new Date(formData.patient_dob) : undefined}
                              onSelect={date => handleFormChange('patient_dob', date ? date.toISOString().split('T')[0] : '')}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              classNames={{
                                caption_label: "text-electric-cyan font-audiowide",
                                day: "hover:bg-electric-cyan/20 rounded-md text-light-text/80",
                                day_selected: "bg-electric-cyan/70 text-cyber-dark-bg hover:bg-electric-cyan rounded-md",
                                nav_button: "hover:bg-electric-cyan/20 rounded-md text-electric-cyan",
                                head_cell: "text-electric-cyan/70 font-audiowide",
                                table: "border-collapse border-spacing-0",
                                cell: "p-0",
                                day_today: "text-electric-cyan font-bold",
                                month: "space-y-4 p-3",
                                caption: "flex justify-center pt-1 relative items-center px-2",
                                nav: "space-x-1 flex items-center",
                                nav_button_previous: "absolute left-1.5",
                                nav_button_next: "absolute right-1.5",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="patient_admission_date" className={labelClasses}>Admission Date</Label>
                         <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                selectTriggerClasses,
                                !formData.patient_admission_date && "text-electric-cyan/50"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-electric-cyan/80" />
                              {formData.patient_admission_date ? new Date(formData.patient_admission_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-electric-cyan/50">Select date...</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={cn(selectContentClasses, "w-auto p-0")}>
                            <Calendar
                              mode="single"
                              selected={formData.patient_admission_date ? new Date(formData.patient_admission_date) : undefined}
                              onSelect={date => handleFormChange('patient_admission_date', date ? date.toISOString().split('T')[0] : '')}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={2000}
                              toYear={new Date().getFullYear() + 1}
                               classNames={{
                                caption_label: "text-electric-cyan font-audiowide",
                                day: "hover:bg-electric-cyan/20 rounded-md text-light-text/80",
                                day_selected: "bg-electric-cyan/70 text-cyber-dark-bg hover:bg-electric-cyan rounded-md",
                                nav_button: "hover:bg-electric-cyan/20 rounded-md text-electric-cyan",
                                head_cell: "text-electric-cyan/70 font-audiowide",
                                table: "border-collapse border-spacing-0",
                                cell: "p-0",
                                day_today: "text-electric-cyan font-bold",
                                month: "space-y-4 p-3",
                                caption: "flex justify-center pt-1 relative items-center px-2",
                                nav: "space-x-1 flex items-center",
                                nav_button_previous: "absolute left-1.5",
                                nav_button_next: "absolute right-1.5",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="patient_insurance_plan" className={labelClasses}>Insurance Plan</Label>
                        <Input id="patient_insurance_plan" value={formData.patient_insurance_plan} onChange={e => handleFormChange('patient_insurance_plan', e.target.value)} placeholder="e.g., Celestial Health Gold" className={inputBaseClasses} />
                      </div>
                      <div>
                        <Label htmlFor="patient_policy_number" className={labelClasses}>Policy Number</Label>
                        <Input id="patient_policy_number" value={formData.patient_policy_number} onChange={e => handleFormChange('patient_policy_number', e.target.value)} placeholder="e.g., CHG-98765000" className={inputBaseClasses} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="patient_primary_provider" className={labelClasses}>Primary Provider</Label>
                        <Input id="patient_primary_provider" value={formData.patient_primary_provider} onChange={e => handleFormChange('patient_primary_provider', e.target.value)} placeholder="e.g., Dr. Evelyn Reed" className={inputBaseClasses} />
                      </div>
                    </>
                  ) : ( // Read-only mode styling
                    <>
                      {renderReadOnlyField('Full Name', formData.patient_full_name, <User size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('MRN', formData.patient_mrn, <FileText size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Age', String(formData.patient_age), <Info size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Gender', formData.patient_gender, <User size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Date of Birth', formData.patient_dob ? new Date(formData.patient_dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', <CalendarIcon size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Admission Date', formData.patient_admission_date ? new Date(formData.patient_admission_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', <CalendarIcon size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Insurance Plan', formData.patient_insurance_plan, <ShieldAlert size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Policy Number', formData.patient_policy_number, <FileText size={18} className="text-electric-cyan/70"/>)}
                      {renderReadOnlyField('Primary Provider', formData.patient_primary_provider, <Stethoscope size={18} className="text-electric-cyan/70"/>)}
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Vital Signs */}
            <AccordionItem value="vitals" className={sectionCardClasses}>
              <AccordionTrigger className={accordionTriggerClasses}>
                 <div className="flex items-center">
                  <Activity className="mr-4 h-7 w-7 text-electric-cyan transition-transform duration-300 group-data-[state=open]:rotate-12 group-data-[state=open]:scale-110" /> Vital Signs
                </div>
                <ChevronDown className="h-6 w-6 shrink-0 text-electric-cyan/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClasses}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8"> {/* Increased gap-x-10 to gap-x-16 */}
                    {isCustomMode ? (
                        <>
                            <div>
                                <Label htmlFor="vital_bp" className={labelClasses}>Blood Pressure (e.g., 120/80 mmHg)</Label>
                                <Input id="vital_bp" value={formData.vitalSigns.vital_bp} onChange={e => handleVitalSignChange('vital_bp', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <Label htmlFor="vital_pulse" className={labelClasses}>Pulse (e.g., 75 bpm)</Label>
                                <Input id="vital_pulse" value={formData.vitalSigns.vital_pulse} onChange={e => handleVitalSignChange('vital_pulse', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <Label htmlFor="vital_resp_rate" className={labelClasses}>Respiratory Rate (e.g., 16 breaths/min)</Label>
                                <Input id="vital_resp_rate" value={formData.vitalSigns.vital_resp_rate} onChange={e => handleVitalSignChange('vital_resp_rate', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <Label htmlFor="vital_temp" className={labelClasses}>Temperature (e.g., 37.0°C)</Label>
                                <Input id="vital_temp" value={formData.vitalSigns.vital_temp} onChange={e => handleVitalSignChange('vital_temp', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <Label htmlFor="vital_o2sat" className={labelClasses}>O2 Saturation (e.g., 98%)</Label>
                                <Input id="vital_o2sat" value={formData.vitalSigns.vital_o2sat} onChange={e => handleVitalSignChange('vital_o2sat', e.target.value)} className={inputBaseClasses} />
                            </div>
                            <div>
                                <Label htmlFor="vital_pain_score" className={labelClasses}>Pain Score (e.g., 2/10)</Label>
                                <Input id="vital_pain_score" value={formData.vitalSigns.vital_pain_score} onChange={e => handleVitalSignChange('vital_pain_score', e.target.value)} className={inputBaseClasses} />
                            </div>
                        </>
                    ) : (
                        <>
                            {renderReadOnlyField('Blood Pressure', formData.vitalSigns.vital_bp, <Activity size={18} className="text-electric-cyan/70"/>)}
                            {renderReadOnlyField('Pulse', formData.vitalSigns.vital_pulse, <Activity size={18} className="text-electric-cyan/70"/>)}
                            {renderReadOnlyField('Respiratory Rate', formData.vitalSigns.vital_resp_rate, <Activity size={18} className="text-electric-cyan/70"/>)}
                            {renderReadOnlyField('Temperature', formData.vitalSigns.vital_temp, <Activity size={18} className="text-electric-cyan/70"/>)}
                            {renderReadOnlyField('O2 Saturation', formData.vitalSigns.vital_o2sat, <Activity size={18} className="text-electric-cyan/70"/>)}
                            {renderReadOnlyField('Pain Score', formData.vitalSigns.vital_pain_score, <Activity size={18} className="text-electric-cyan/70"/>)}
                        </>
                    )}
                 </div>
              </AccordionContent>
            </AccordionItem>

            {/* Clinical Information */}
            <AccordionItem value="clinical-info" className={sectionCardClasses}>
              <AccordionTrigger className={accordionTriggerClasses}>
                <div className="flex items-center">
                  <Stethoscope className="mr-4 h-7 w-7 text-electric-cyan transition-transform duration-300 group-data-[state=open]:rotate-12 group-data-[state=open]:scale-110" /> Clinical Data
                </div>
                <ChevronDown className="h-6 w-6 shrink-0 text-electric-cyan/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className={cn(accordionContentClasses, "space-y-10")}>
                {/* Allergies */}
                <div>
                  <Label className="text-lg font-audiowide mb-3.5 block text-electric-cyan/90 tracking-wide">Allergies</Label>
                  {isCustomMode ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4 max-h-72 overflow-y-auto p-5 border border-electric-cyan/30 rounded-lg bg-[rgba(20,30,50,0.2)] backdrop-blur-sm shadow-inner custom-scrollbar scrollbar-thin">
                      {commonAllergies.map(allergy => (
                        <div key={allergy} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={`allergy-${allergy}`}
                            checked={formData.allergies.includes(allergy)}
                            onCheckedChange={checked => handleListChange('allergies', allergy, !!checked)}
                            className="border-electric-cyan/50 data-[state=checked]:bg-electric-cyan data-[state=checked]:text-cyber-dark-bg focus:ring-electric-cyan focus:ring-offset-cyber-dark-bg w-5 h-5 rounded"
                          />
                          <Label htmlFor={`allergy-${allergy}`} className="font-medium text-sm text-light-text/80 cursor-pointer group-hover:text-electric-cyan transition-colors">{allergy}</Label>
                        </div>
                      ))}
                       <div className="flex items-center space-x-3 group">
                          <Checkbox
                            id="allergy-none"
                            checked={formData.allergies.includes('No Known Allergies')}
                            onCheckedChange={checked => {
                                if (!!checked) {
                                    setFormData(prev => ({...prev, allergies: ['No Known Allergies']}));
                                } else {
                                     setFormData(prev => ({...prev, allergies: prev.allergies.filter(a => a !== 'No Known Allergies')}));
                                }
                            }}
                            className="border-electric-cyan/50 data-[state=checked]:bg-electric-cyan data-[state=checked]:text-cyber-dark-bg focus:ring-electric-cyan focus:ring-offset-cyber-dark-bg w-5 h-5 rounded"
                          />
                          <Label htmlFor="allergy-none" className="font-medium text-sm text-light-text/80 cursor-pointer group-hover:text-electric-cyan transition-colors">No Known Allergies</Label>
                        </div>
                    </div>
                  ) : (
                    renderReadOnlyList('Allergies', formData.allergies, <ShieldAlert size={18} className="text-electric-cyan/70"/>)
                  )}
                </div>

                {/* NYHA Class */}
                <div>
                  <Label htmlFor="nyha_class_description" className="text-lg font-audiowide mb-3 block text-electric-cyan/90 tracking-wide">NYHA Class (if applicable)</Label>
                  {isCustomMode ? (
                    <Select
                      value={formData.nyha_class_description || 'N/A'}
                      onValueChange={(value) => handleFormChange('nyha_class_description', value as PatientInfo['nyha_class_description'])}
                    >
                      <SelectTrigger id="nyha_class_description" className={selectTriggerClasses}>
                        <SelectValue placeholder="Select NYHA Class..." />
                      </SelectTrigger>
                      <SelectContent className={selectContentClasses}>
                        {nyhaOptions.map(opt => (
                          <SelectItem key={opt} value={opt || 'N/A'} className={selectItemClasses}>{opt || 'N/A'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    renderReadOnlyField('NYHA Class', formData.nyha_class_description, <Activity size={18} className="text-electric-cyan/70"/>)
                  )}
                </div>

                {/* Primary Diagnosis */}
                <div>
                  <Label htmlFor="primary_diagnosis_text" className="text-lg font-audiowide mb-3 block text-electric-cyan/90 tracking-wide">Primary Diagnosis</Label>
                  {isCustomMode ? (
                     <Select
                      value={formData.primary_diagnosis_text}
                      onValueChange={(value) => handleFormChange('primary_diagnosis_text', value)}
                    >
                      <SelectTrigger id="primary_diagnosis_text" className={selectTriggerClasses}>
                        <SelectValue placeholder="Select Primary Diagnosis..." />
                      </SelectTrigger>
                      <SelectContent className={cn(selectContentClasses, "max-h-72 custom-scrollbar scrollbar-thin")}>
                        {commonDiagnoses.map(dx => (
                          <SelectItem key={dx} value={dx} className={selectItemClasses}>{dx}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    renderReadOnlyField('Primary Diagnosis', formData.primary_diagnosis_text, <Stethoscope size={18} className="text-electric-cyan/70"/>)
                  )}
                </div>

                {/* Secondary Diagnoses */}
                <div>
                  <Label className="text-lg font-audiowide mb-3.5 block text-electric-cyan/90 tracking-wide">Secondary Diagnoses</Label>
                  {isCustomMode ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4 max-h-72 overflow-y-auto p-5 border border-electric-cyan/30 rounded-lg bg-[rgba(20,30,50,0.2)] backdrop-blur-sm shadow-inner custom-scrollbar scrollbar-thin">
                      {commonDiagnoses.map(dx => (
                        <div key={`sec-dx-${dx}`} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={`sec-dx-${dx}`}
                            checked={formData.secondaryDiagnoses.includes(dx)}
                            onCheckedChange={checked => handleListChange('secondaryDiagnoses', dx, !!checked)}
                            className="border-electric-cyan/50 data-[state=checked]:bg-electric-cyan data-[state=checked]:text-cyber-dark-bg focus:ring-electric-cyan focus:ring-offset-cyber-dark-bg w-5 h-5 rounded"
                          />
                          <Label htmlFor={`sec-dx-${dx}`} className="font-medium text-sm text-light-text/80 cursor-pointer group-hover:text-electric-cyan transition-colors">{dx}</Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    renderReadOnlyList('Secondary Diagnoses', formData.secondaryDiagnoses, <Stethoscope size={18} className="text-electric-cyan/70"/>)
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Lab Results */}
            <AccordionItem value="labs" className={sectionCardClasses}>
              <AccordionTrigger className={accordionTriggerClasses}>
                <div className="flex items-center">
                  <TestTube2 className="mr-4 h-7 w-7 text-electric-cyan transition-transform duration-300 group-data-[state=open]:rotate-12 group-data-[state=open]:scale-110" /> Lab Results
                </div>
                <ChevronDown className="h-6 w-6 shrink-0 text-electric-cyan/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className={cn(accordionContentClasses, "space-y-10")}>
                {isCustomMode && (
                  <div className="mb-8 p-6 bg-[rgba(5,10,20,0.3)] backdrop-blur-sm rounded-xl border border-electric-cyan/20 shadow-inner">
                    <Label className="text-lg font-audiowide text-electric-cyan mb-4 block tracking-wide [text-shadow:_0_0_3px_theme(colors.electric-cyan)]">Quick Add: Common Lab Panels</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {commonLabTests.slice(0, 6).map(panel => ( 
                        <Button
                            key={panel.name}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newLabsToAdd = panel.fields.map(fieldName => ({
                                    lab_n_name: fieldName,
                                    lab_n_value: 'Pending',
                                    lab_n_flag: '',
                                    lab_n_trend: ''
                                } as LabResult));
                                setFormData(prev => ({...prev, labs: [...prev.labs, ...newLabsToAdd]}));
                            }}
                            className="text-sm justify-start py-3.5 px-4 bg-[rgba(20,30,50,0.4)] hover:bg-electric-cyan/20 border-electric-cyan/40 hover:border-electric-cyan/70 text-light-text/90 hover:text-electric-cyan rounded-lg shadow-md transition-all hover:shadow-glow-cyan-xs"
                        >
                           <PlusCircle className="mr-3 h-5 w-5 text-acid-green/80" /> {panel.name}
                        </Button>
                    ))}
                    </div>
                     <p className="text-xs text-electric-cyan/60 mt-5 flex items-center">
                        <Info size={14} className="mr-2 text-electric-cyan/70" /> Values can be edited manually below.
                    </p>
                  </div>
                )}
                {formData.labs.map((lab, index) => (
                  <Card key={index} className="p-6 bg-[rgba(5,10,20,0.4)] backdrop-blur-sm border-electric-cyan/25 rounded-xl shadow-lg shadow-electric-cyan/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8 items-end"> {/* Increased gap-x-10 to gap-x-12 */}
                      <div>
                        <Label htmlFor={`lab_n_name-${index}`} className={labelClasses}>Lab Name</Label>
                        {isCustomMode ? (
                          <Input id={`lab_n_name-${index}`} value={lab.lab_n_name} onChange={e => handleLabChange(index, 'lab_n_name', e.target.value)} placeholder="e.g., Glucose" className={inputBaseClasses} />
                        ) : renderReadOnlyField('Lab Name', lab.lab_n_name, <TestTube2 size={16} className="text-electric-cyan/70"/>)}
                      </div>
                      <div>
                        <Label htmlFor={`lab_n_value-${index}`} className={labelClasses}>Value</Label>
                        {isCustomMode ? (
                          <Input id={`lab_n_value-${index}`} value={lab.lab_n_value} onChange={e => handleLabChange(index, 'lab_n_value', e.target.value)} placeholder="e.g., 120 mg/dL" className={inputBaseClasses} />
                        ) : renderReadOnlyField('Value', lab.lab_n_value, <Info size={16} className="text-electric-cyan/70"/>)}
                      </div>
                      <div>
                        <Label htmlFor={`lab_n_flag-${index}`} className={labelClasses}>Flag</Label>
                        {isCustomMode ? (
                          <Select value={lab.lab_n_flag} onValueChange={(value: LabResult['lab_n_flag']) => handleLabChange(index, 'lab_n_flag', value)}>
                            <SelectTrigger id={`lab_n_flag-${index}`} className={selectTriggerClasses}>
                              <SelectValue placeholder="Flag..." />
                            </SelectTrigger>
                            <SelectContent className={selectContentClasses}>
                              {labFlagOptions.map(opt => <SelectItem key={`flag-${opt}-${index}`} value={opt} className={selectItemClasses}>{opt || 'N/A'}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : renderReadOnlyField('Flag', lab.lab_n_flag, <Info size={16} className="text-electric-cyan/70"/>)}
                      </div>
                      <div>
                        <Label htmlFor={`lab_n_trend-${index}`} className={labelClasses}>Trend</Label>
                        {isCustomMode ? (
                          <Select value={lab.lab_n_trend} onValueChange={(value: LabResult['lab_n_trend']) => handleLabChange(index, 'lab_n_trend', value)}>
                            <SelectTrigger id={`lab_n_trend-${index}`} className={selectTriggerClasses}>
                              <SelectValue placeholder="Trend..." />
                            </SelectTrigger>
                            <SelectContent className={selectContentClasses}>
                              {labTrendOptions.map(opt => <SelectItem key={`trend-${opt}-${index}`} value={opt} className={selectItemClasses}>{opt || 'N/A'}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : renderReadOnlyField('Trend', lab.lab_n_trend, <Info size={16} className="text-electric-cyan/70"/>)}
                      </div>
                    </div>
                    {isCustomMode && (
                      <Button variant="ghost" size="sm" onClick={() => removeLab(index)} className="mt-7 text-alert-red/80 hover:text-alert-red hover:bg-alert-red/20 px-4 py-2.5 rounded-lg transition-colors duration-150 flex items-center group">
                        <Trash2 className="mr-2.5 h-4.5 w-4.5 group-hover:scale-110 transition-transform" /> Remove Lab Entry
                      </Button>
                    )}
                  </Card>
                ))}
                {isCustomMode && (
                  <Button type="button" variant="outline" onClick={addLab} className="mt-8 bg-electric-cyan/10 hover:bg-electric-cyan/20 border-electric-cyan/50 text-electric-cyan hover:text-electric-cyan/90 rounded-lg py-3.5 px-6 transition-all shadow-md hover:shadow-glow-cyan-xs flex items-center group">
                    <PlusCircle className="mr-2.5 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" /> Add New Lab Result
                  </Button>
                )}
                {!isCustomMode && formData.labs.length === 0 && renderReadOnlyList('Labs', [], <TestTube2 size={18} className="text-electric-cyan/70"/>)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-10 border-t border-electric-cyan/20 flex justify-center">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full md:w-auto text-xl font-audiowide tracking-wider px-12 py-4 bg-gradient-to-r from-electric-cyan to-cyber-magenta hover:from-cyber-magenta hover:to-electric-cyan text-cyber-dark-bg rounded-lg shadow-glow-cyan-md hover:shadow-glow-magenta-md transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyber-magenta/50 focus:ring-offset-2 focus:ring-offset-cyber-dark-bg disabled:opacity-60 disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-cyber-dark-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating ADPIE Plan...
                </>
              ) : 'Generate ADPIE Care Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientDataForm;
