import React, { useState, ReactNode, useEffect } from 'react';
import {
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, TrendingUp, ListChecks, Edit3, Repeat,
  Link, BookOpen, ImageIcon
} from 'lucide-react';

// Types matching the expected JSON structure (based on User Prompt Template)
// These can be refined further for stricter typing if needed
type SectionType = 'assessment' | 'diagnosis' | 'planning' | 'implementation' | 'evaluation' | 'sources';

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
  // Include ADPIE fields if they might be nested here (though unlikely based on prompt)
  nyha_class_description?: string; // From Overview section
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
  treatment_n_details?: string; // Corresponds to parameters placeholder
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
  // Use dynamic keys for confidence/contributions/insights based on prompt
  [key: string]: any; 
}

interface PriorAuthCriterion {
  name?: string; // Corresponds to pa_n_criterion_m_name
  met?: boolean | string;
  notes?: string;
}

interface PriorAuthItem {
  id?: string; // Corresponds to pa_n_id
  item?: string; // Corresponds to pa_n_item_name
  type?: string; // Corresponds to pa_n_type
  status?: string; // Corresponds to pa_n_status
  submittedDate?: string; // Corresponds to pa_n_submitted_date
  approvedDate?: string; // Corresponds to pa_n_approved_date
  expirationDate?: string; // Corresponds to pa_n_expiration_date
  estimatedResponse?: string; // Corresponds to pa_n_estimated_response
  estimatedSubmission?: string; // Corresponds to pa_n_estimated_submission
  confidence?: string; // Corresponds to pa_n_approval_confidence
  criteria?: PriorAuthCriterion[];
  // Allow dynamic keys
  [key: string]: any;
}

interface SourceData {
  id?: string; // Corresponds to source_n_id
  title?: string; // Corresponds to source_n_title
  type?: string; // Corresponds to source_n_type
  url?: string; // Corresponds to source_n_url
  snippet?: string; // Corresponds to source_n_snippet
  retrieval_date?: string; // Corresponds to source_n_retrieval_date
  agent_source?: string; // Corresponds to source_n_agent_source
  // Allow dynamic keys
  [key: string]: any;
}

// Main data structure expected in the 'data' prop
interface CarePlanJsonData {
  patientData?: PatientData;
  clinicalData?: ClinicalData;
  aiAgents?: AgentType[];
  priorAuthItems?: PriorAuthItem[];
  sourcesData?: SourceData[];
  // ADPIE data might be flat at the root level based on prompt structure
  assessment_subjective_chief_complaint?: string;
  assessment_subjective_hpi?: string;
  assessment_subjective_goals?: string;
  assessment_subjective_other?: string;
  assessment_objective_vitals_summary?: string;
  assessment_objective_physical_exam?: string;
  assessment_objective_diagnostics?: string;
  assessment_objective_meds_reviewed?: string;
  assessment_objective_other?: string;
  diagnosis_1_nanda?: string;
  diagnosis_1_related_to?: string;
  diagnosis_1_evidence?: string;
  diagnosis_2_nanda?: string;
  diagnosis_2_related_to?: string;
  diagnosis_2_evidence?: string;
  diagnosis_3_nanda_risk?: string;
  diagnosis_3_related_to_risk_factors?: string;
  goal_1_description?: string;
  goal_1_target_date?: string;
  goal_1_outcome_1?: string;
  goal_1_outcome_2?: string;
  goal_2_description?: string;
  goal_2_target_date?: string;
  goal_2_outcome_1?: string;
  Discipline_1?: string;
  discipline_1_plan_item_1?: string;
  discipline_1_plan_item_2?: string;
  Discipline_2?: string;
  discipline_2_plan_item_1?: string;
  intervention_target_1?: string;
  intervention_1_action?: string;
  intervention_1_rationale?: string;
  intervention_2_action?: string;
  intervention_2_rationale?: string;
  intervention_3_action_pending?: string;
  intervention_3_rationale?: string;
  intervention_target_2?: string;
  intervention_4_action?: string;
  intervention_4_rationale?: string;
  evaluation_1_date?: string;
  evaluation_1_status?: string;
  evaluation_1_evidence?: string;
  evaluation_1_revision?: string;
  evaluation_2_date?: string;
  evaluation_2_status?: string;
  evaluation_2_evidence?: string;
  evaluation_2_revision?: string;
  overall_plan_summary?: string;
  next_step_1?: string;
  next_step_2?: string;
  next_step_3?: string;
  // Notification data might be separate or nested
  notification_title?: string;
  notification_message?: string;
  notification_detail_1?: string;
  notification_detail_2?: string;
}

// Props for the CarePlanTemplate component
interface CarePlanTemplateProps {
  data: CarePlanJsonData | null;
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

// --- UI Sub-Components --- (Remain largely the same, but use extracted data)

const TabButton = ({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) => (
  <button
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
      active
        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
        : 'bg-white text-gray-600 hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

const SectionHeader = ({ title, icon, expanded, onToggle }: { title: string; icon: ReactNode; expanded: boolean; onToggle: () => void }) => (
  <div
    className={`flex justify-between items-center p-4 rounded-t-lg cursor-pointer transition-colors duration-200 ${
      expanded ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center">
      {icon}
      <h3 className="font-semibold ml-2">{title}</h3>
    </div>
    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
  </div>
);

const InfoCard = ({ icon, label, value, color = "blue" }: InfoCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-500", 
    green: "bg-green-50 border-green-100 text-green-500",
    purple: "bg-purple-50 border-purple-100 text-purple-500", 
    amber: "bg-amber-50 border-amber-100 text-amber-500",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-500", 
    teal: "bg-teal-50 border-teal-100 text-teal-500",
    red: "bg-red-50 border-red-100 text-red-500", 
    pink: "bg-pink-50 border-pink-100 text-pink-500",
    cyan: "bg-cyan-50 border-cyan-100 text-cyan-500",
  };
  
  // Use a type-safe approach for color access
  const safeColor = (color as keyof typeof colorClasses) in colorClasses 
    ? (color as keyof typeof colorClasses) 
    : 'blue';
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center">
      <div className={`rounded-full p-2.5 mr-3 ${colorClasses[safeColor]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let bgColor, textColor, icon;
  const displayStatus = status || 'Unknown';

  switch(displayStatus.toLowerCase()) {
    case 'approved': case 'active': case 'met':
      bgColor = 'bg-green-100'; textColor = 'text-green-800'; icon = <CheckCircle size={14} className="text-green-500 mr-1.5" />; break;
    case 'in progress': case 'pending': case 'partially met':
      bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; icon = <Clock size={14} className="text-amber-500 mr-1.5" />; break;
    case 'pending submission': case 'scheduled':
      bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; icon = <FileText size={14} className="text-blue-500 mr-1.5" />; break;
    case 'denied': case 'not met':
      bgColor = 'bg-red-100'; textColor = 'text-red-800'; icon = <X size={14} className="text-red-500 mr-1.5" />; break;
    case 'new order':
      bgColor = 'bg-orange-100'; textColor = 'text-orange-800'; icon = <Plus size={14} className="text-orange-500 mr-1.5" />; break;
    default:
      bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; icon = <Info size={14} className="text-gray-500 mr-1.5" />;
  }
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {displayStatus}
    </div>
  );
};

const AgentCard = ({ agent, isExpanded, onToggle, section }: { agent: AgentType; isExpanded: boolean; onToggle: () => void; section: SectionType }) => {
  const agentName = agent?.name || 'Unknown Agent';
  const agentSpecialty = agent?.specialty || 'Unknown Specialty';
  // Handle dynamic confidence key (e.g., agent_1_confidence_score) or default 'confidence'
  const confidenceKey = Object.keys(agent || {}).find(k => 
    k.includes('confidence') || k.endsWith('_confidence_score')
  ) || 'confidence';
  const agentConfidence = agent && confidenceKey && agent[confidenceKey] 
    ? (typeof agent[confidenceKey] === 'string' ? parseFloat(agent[confidenceKey] as string) || 0 : 
       typeof agent[confidenceKey] === 'number' ? agent[confidenceKey] as number : 0) 
    : 0;

  const getAgentStyling = (name: string) => {
    name = (name || '').toLowerCase();
    if (name.includes('clinical')) return { border: 'border-blue-200', bg: 'bg-blue-50', header: 'from-blue-500 to-blue-600', icon: <Activity className="text-white" size={20}/> };
    if (name.includes('medication') || name.includes('pharma')) return { border: 'border-purple-200', bg: 'bg-purple-50', header: 'from-purple-500 to-purple-600', icon: <FileText className="text-white" size={20}/> };
    if (name.includes('discharge') || name.includes('transition')) return { border: 'border-green-200', bg: 'bg-green-50', header: 'from-green-500 to-green-600', icon: <Calendar className="text-white" size={20}/> };
    if (name.includes('benefits') || name.includes('insurance') || name.includes('auth')) return { border: 'border-indigo-200', bg: 'bg-indigo-50', header: 'from-indigo-500 to-indigo-600', icon: <Shield className="text-white" size={20}/> };
    if (name.includes('sdoh') || name.includes('social')) return { border: 'border-pink-200', bg: 'bg-pink-50', header: 'from-pink-500 to-pink-600', icon: <User className="text-white" size={20}/> };
    if (name.includes('compliance') || name.includes('guard')) return { border: 'border-cyan-200', bg: 'bg-cyan-50', header: 'from-cyan-500 to-cyan-600', icon: <CheckCircle className="text-white" size={20}/> };
    return { border: 'border-gray-200', bg: 'bg-gray-50', header: 'from-gray-500 to-gray-600', icon: <Zap className="text-white" size={20}/> };
  };
  const styles = getAgentStyling(agentName);

  const getContributionField = (agent: AgentType, section: SectionType): string => {
     const fieldMap: Partial<Record<SectionType, string>> = { // Map section to expected contribution key suffix
         assessment: 'assessmentContribution', diagnosis: 'diagnosisContribution', planning: 'planningContribution',
         implementation: 'implementationContribution', evaluation: 'evaluationContribution'
     };
     const suffix = fieldMap[section];
     if (!suffix) return section === 'sources' ? "N/A for Sources Tab" : "N/A";
     // Find the key in the agent object that ends with the suffix
     const contributionKey = Object.keys(agent).find(k => k.endsWith(suffix));
     return contributionKey ? (agent[contributionKey] as string || 'N/A') : 'N/A';
  };

  // Find insight keys (e.g., agent_1_insight_1, agent_1_insight_2)
  const insightKeys = Object.keys(agent).filter(k => k.includes('_insight_'));
  const insights = insightKeys.map(key => agent[key]).filter(Boolean);

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border ${isExpanded ? 'ring-2 ring-offset-1 ring-blue-400' : styles.border} hover:shadow-lg transition-all duration-300`}>
      <div className={`bg-gradient-to-r ${styles.header} px-4 py-3 text-white flex justify-between items-center cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center">
          <div className="p-1.5 bg-white bg-opacity-20 rounded-lg mr-3">{styles.icon}</div>
          <div>
            <h4 className="font-bold text-white">{agentName}</h4>
            <p className="text-xs text-white text-opacity-90">{agentSpecialty}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 px-2.5 py-1 rounded text-xs font-medium mr-2">
            {(agentConfidence * 100).toFixed(0)}% Conf.
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className={`rounded-lg p-3 border ${styles.border} ${styles.bg}`}>
            <div className="font-semibold text-gray-800 text-sm mb-2">{section.charAt(0).toUpperCase() + section.slice(1)} Contribution:</div>
            <p className="text-sm text-gray-700">{getContributionField(agent, section)}</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Zap size={14} className="mr-1.5 text-amber-500" /> AI Insights</h5>
            <ul className="space-y-1.5">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start">
                  <ArrowRight size={12} className="text-amber-500 mr-1.5 mt-0.5 flex-shrink-0" /> {insight || 'N/A'}
                </li>
              )) : <li className="text-xs text-gray-500 italic">No insights provided.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const PriorAuthCard = ({ item }: { item: PriorAuthItem }) => {
  // Use dynamic keys or direct keys based on expected JSON structure
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

  const criteriaComponents = [];
  if (paCriteria.length > 0) {
    for (let i = 0; i < paCriteria.length; i++) {
      const criterion = paCriteria[i];
      criteriaComponents.push(
        <div key={`criterion-${i}`} className="border-t border-gray-100 pt-2 mt-2">
          <div className="text-sm flex justify-between">
            <span className="font-medium">{criterion.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${criterion.met === true || criterion.met === 'true' || criterion.met === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {criterion.met === true || criterion.met === 'true' || criterion.met === 'yes' ? 'Met' : 'Not Met'}
            </span>
          </div>
          {criterion.notes && (
            <p className="text-xs text-gray-500 mt-1">{criterion.notes}</p>
          )}
        </div>
      );
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm mb-4 bg-white overflow-hidden">
      <div className="border-b border-gray-100 p-4 flex justify-between items-start">
         <div>
          <div className="flex items-center mb-1">
            <StatusBadge status={paStatus} />
            <span className="ml-2 text-xs font-medium text-gray-500">{paId}</span>
          </div>
          <h4 className="font-semibold text-gray-900">{paItemName}</h4>
          <div className="text-xs text-gray-500 mt-1">
            {paType} • {paSubmittedDate ? `Submitted: ${paSubmittedDate}` : `Est. Submission: ${paEstSubmission}`}
          </div>
        </div>
        <div className="text-center flex-shrink-0 ml-4">
          <div className="text-2xl font-bold text-blue-600">{(paConfidence * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-600">Approval Conf.</div>
        </div>
      </div>
      <div className="p-4 bg-gray-50">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Criteria Assessment</h5>
        <div className="space-y-2">
          {criteriaComponents.length > 0 ? criteriaComponents : <p className="text-xs text-gray-500 italic">No criteria specified.</p>}
        </div>
      </div>
       {paStatus.toLowerCase() === 'approved' && paApprovedDate && paExpirationDate && (
        <div className="p-3 bg-green-50 border-t border-green-100 flex justify-between items-center text-xs text-green-800">
          <span>Approved: {paApprovedDate}</span> <span>Expires: {paExpirationDate}</span>
        </div>
      )}
      {paStatus.toLowerCase() === 'in progress' && paEstResponse && (
         <div className="p-3 bg-amber-50 border-t border-amber-100 flex justify-between items-center text-xs text-amber-800">
          <span>Est. Response: {paEstResponse}</span>
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

     const getSourceIcon = (type: string) => {
         type = (type || '').toLowerCase();
         if (type.includes('guideline')) return <BookOpen size={16} className="text-blue-600 mr-2 flex-shrink-0" />;
         if (type.includes('article')) return <FileText size={16} className="text-purple-600 mr-2 flex-shrink-0" />;
         if (type.includes('ehr') || type.includes('note')) return <Clipboard size={16} className="text-green-600 mr-2 flex-shrink-0" />;
         if (type.includes('patient')) return <User size={16} className="text-pink-600 mr-2 flex-shrink-0" />;
         return <Link size={16} className="text-gray-600 mr-2 flex-shrink-0" />;
     };

     return (
         <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center">
                     {getSourceIcon(sourceType)}
                     <h4 className="font-semibold text-gray-800">{sourceTitle}</h4>
                 </div>
                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{sourceType}</span>
             </div>
             <p className="text-sm text-gray-600 mb-3 italic">"{sourceSnippet}"</p>
             <div className="flex justify-between items-center text-xs text-gray-500">
                 <span>Retrieved: {sourceRetrievalDate}</span>
                 {sourceUrl && (
                     <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                         View Source <Link size={12} className="ml-1" />
                     </a>
                 )}
                  <span>Cited by: {sourceAgent}</span>
             </div>
         </div>
     );
};

const NotificationPopup = ({ data }: { data: CarePlanJsonData | null }) => {
   const title = data?.notification_title || 'Notification';
   const message = data?.notification_message || 'No message.';
   const detail1 = data?.notification_detail_1 || '';
   const detail2 = data?.notification_detail_2 || '';
   // Need state passed down or managed locally to control visibility
   // const [isVisible, setIsVisible] = useState(true);
   // if (!isVisible) return null;

   return (
      <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-blue-200 p-4 w-80 z-50 animate-fade-in">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
            <AlertCircle size={20} className="text-blue-600" />
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600 mb-2">{message}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600 font-medium">{detail1}</span>
              {detail2 && (
                 <span className="text-xs text-green-600 font-medium flex items-center">
                   <Check size={12} className="mr-1" /> {detail2}
                 </span>
              )}
            </div>
          </div>
          {/* Button to close needs state management */}
          {/* <button onClick={() => setIsVisible(false)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button> */}
        </div>
      </div>
   );
}

// --- Main Component Render ---
const CarePlanTemplate = ({ data }: CarePlanTemplateProps) => {
  // Track when component has mounted to trigger animations
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted after a brief delay for fade-in effect
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    assessment: true, diagnosis: false, planning: false,
    implementation: true, evaluation: true, sources: false
  } as Record<SectionType, boolean>);
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
  const [showPriorAuth, setShowPriorAuth] = useState(false);

  // Toggle functions
  const toggleSection = (section: SectionType) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  const toggleAgentExpansion = (agentName: string) => {
    const key = agentName || `unknown_agent_${Math.random()}`;
    setExpandedAgents(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const togglePriorAuth = () => setShowPriorAuth(!showPriorAuth);

  // Extract data safely with better validation
  const patientInfo = data?.patientData ? { ...data.patientData } : {};
  const clinicalInfo = data?.clinicalData ? { ...data.clinicalData } : {};
  const agents = Array.isArray(data?.aiAgents) ? [...data.aiAgents] : [];
  const paItems = Array.isArray(data?.priorAuthItems) ? [...data.priorAuthItems] : [];
  const sources = Array.isArray(data?.sourcesData) ? [...data.sourcesData] : [];
  const adpieData = data ? { ...data } : {}; // Assume ADPIE fields might be at root level
  
  // Log data structure on first load for debugging
  useEffect(() => {
    if (data) {
      console.log("[CarePlanTemplate] Received data structure:", 
        Object.keys(data).length ? Object.keys(data) : "empty object");
      
      // Check critical structures
      if (data.patientData && typeof data.patientData !== 'object') {
        console.error('[CarePlanTemplate] Invalid patientData format:', data.patientData);
      }
      if (data.clinicalData && typeof data.clinicalData !== 'object') {
        console.error('[CarePlanTemplate] Invalid clinicalData format:', data.clinicalData);
      }
      if (data.aiAgents && !Array.isArray(data.aiAgents)) {
        console.error('[CarePlanTemplate] aiAgents is not an array:', data.aiAgents);
      }
      if (data.priorAuthItems && !Array.isArray(data.priorAuthItems)) {
        console.error('[CarePlanTemplate] priorAuthItems is not an array:', data.priorAuthItems);
      }
      if (data.sourcesData && !Array.isArray(data.sourcesData)) {
        console.error('[CarePlanTemplate] sourcesData is not an array:', data.sourcesData);
      }
    }
  }, [data]);

  // Check if data is loaded
  if (!data) {
     return (
       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 flex items-center justify-center">
         <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center">
           <div className="animate-pulse">
             <div className="h-10 w-40 bg-gray-200 rounded mx-auto mb-4"></div>
             <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
           </div>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-y-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2.5 rounded-xl shadow-md text-white mr-4">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ron AI</h1>
              <p className="text-gray-600">Comprehensive Plan of Care</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              className={`relative bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center shadow-sm transition-colors duration-200 ${showPriorAuth ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
              onClick={togglePriorAuth} title="Toggle Prior Authorizations Panel" >
              <Shield size={16} className="mr-1.5" /> Prior Auth
              {paItems.some(i => i.status?.toLowerCase() === 'in progress' || i.status?.toLowerCase() === 'pending submission') && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold shadow">!</span>
              )}
            </button>
            <button className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center shadow-sm transition-colors duration-200" title="Communicate with Team">
              <MessageCircle size={16} className="mr-1.5" /> Communicate
            </button>
            <button className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center shadow-sm transition-colors duration-200" title="Export Care Plan">
              <Download size={16} className="mr-1.5" /> Export
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Care Plan Section */}
          <div className={`w-full ${showPriorAuth ? 'lg:w-2/3' : 'w-full'} transition-all duration-300 ease-in-out`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              {/* Patient Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-5 text-white">
                <div className="flex justify-between items-start flex-wrap gap-y-3">
                  <div>
                    <h2 className="text-2xl font-bold">{patientInfo.patient_full_name || 'N/A'}</h2>
                    <p className="text-white text-opacity-90 text-sm">
                      {patientInfo.patient_age || 'N/A'} y.o. {patientInfo.patient_gender || 'N/A'} • MRN: {patientInfo.patient_mrn || 'N/A'} • Admitted: {patientInfo.patient_admission_date || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-15 px-4 py-2 rounded-xl backdrop-blur-sm text-right max-w-xs">
                    <div className="text-sm opacity-80 mb-1">Primary Diagnosis</div>
                    <div className="font-semibold">{clinicalInfo.primary_diagnosis_text || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="p-4 border-b border-gray-200">
                 <div className="flex space-x-3 overflow-x-auto pb-2">
                  <TabButton active={activeTab === 'overview'} icon={<Clipboard size={16} />} label="Overview" onClick={() => setActiveTab('overview')} />
                  <TabButton active={activeTab === 'assessment'} icon={<FileCheck size={16} />} label="Assessment" onClick={() => setActiveTab('assessment')} />
                  <TabButton active={activeTab === 'diagnosis'} icon={<AlertCircle size={16} />} label="Diagnosis" onClick={() => setActiveTab('diagnosis')} />
                  <TabButton active={activeTab === 'planning'} icon={<BarChart2 size={16} />} label="Planning" onClick={() => setActiveTab('planning')} />
                  <TabButton active={activeTab === 'implementation'} icon={<ListChecks size={16} />} label="Implementation" onClick={() => setActiveTab('implementation')} />
                  <TabButton active={activeTab === 'evaluation'} icon={<Star size={16} />} label="Evaluation" onClick={() => setActiveTab('evaluation')} />
                  <TabButton active={activeTab === 'sources'} icon={<Link size={16} />} label="Sources" onClick={() => setActiveTab('sources')} />
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="p-6">
                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                  <div className={`space-y-6 ${isMounted ? 'fade-in' : 'opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard icon={<User size={18} />} label="Provider" value={patientInfo.patient_primary_provider} color="blue" />
                      <InfoCard icon={<Shield size={18} />} label="Insurance" value={patientInfo.patient_insurance_plan} color="indigo" />
                      <InfoCard icon={<Activity size={18} />} label="Severity/Class" value={patientInfo.nyha_class_description} color="purple" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Vital Signs (Latest)</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {patientInfo.vitalSigns && typeof patientInfo.vitalSigns === 'object' 
                          ? Object.entries(patientInfo.vitalSigns).map(([key, value]) => (
                          <div key={key} className="bg-white p-3 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-500 mb-1 uppercase">{key.replace('vital_', '') === 'o2Sat' ? 'O₂ Sat' : key.replace('vital_', '')}</div>
                            <div className="font-semibold text-gray-900">{value || 'N/A'}</div>
                          </div> ))
                          : <div className="col-span-3 md:col-span-6 text-center text-gray-500">No vital signs data available</div>
                        }
                      </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <div> <h3 className="text-lg font-semibold text-gray-800 mb-3">Medications</h3> <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {clinicalInfo.medications && clinicalInfo.medications.length > 0 ? clinicalInfo.medications.map((med, idx) => ( <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"> <div> <div className="font-medium text-gray-900">{med.med_n_name || 'N/A'} {med.med_n_dosage || ''}</div> <div className="text-xs text-gray-500">{med.med_n_route || 'N/A'} • {med.med_n_frequency || 'N/A'}</div> </div> <div className="flex items-center flex-shrink-0 ml-2"> {(typeof med.med_n_pa_required === 'string' ? med.med_n_pa_required.toLowerCase() === 'true' : !!med.med_n_pa_required) && ( <span className="mr-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded" title="Prior Authorization Required">PA</span> )} <StatusBadge status={med.med_n_status || ''} /> </div> </div> )) : <p className="text-sm text-gray-500 italic">No medications listed.</p>} </div> </div>
                       <div> <h3 className="text-lg font-semibold text-gray-800 mb-3">Treatments & Diagnostics</h3> <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {clinicalInfo.treatments && clinicalInfo.treatments.length > 0 ? clinicalInfo.treatments.map((treatment, idx) => ( <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"> <div> <div className="font-medium text-gray-900">{treatment.treatment_n_name || 'N/A'}</div> <div className="text-xs text-gray-500"> {treatment.treatment_n_details || treatment.treatment_n_date || 'N/A'} </div> </div> <div className="flex items-center flex-shrink-0 ml-2"> {(typeof treatment.treatment_n_pa_required === 'string' ? treatment.treatment_n_pa_required.toLowerCase() === 'true' : !!treatment.treatment_n_pa_required) && ( <span className="mr-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded" title="Prior Authorization Required">PA</span> )} <StatusBadge status={treatment.treatment_n_status || ''} /> </div> </div> )) : <p className="text-sm text-gray-500 italic">No treatments listed.</p>} </div> </div>
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Lab Results</h3>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {clinicalInfo.labs && clinicalInfo.labs.length > 0 ? clinicalInfo.labs.map((lab, idx) => ( <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"> <div className="flex justify-between items-center mb-1"> <div className="font-medium text-gray-900 text-sm">{lab.lab_n_name || 'N/A'}</div> <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ lab.lab_n_flag?.toUpperCase() === 'HIGH' ? 'bg-red-100 text-red-800' : lab.lab_n_flag?.toUpperCase() === 'LOW' ? 'bg-amber-100 text-amber-800' : lab.lab_n_flag?.toUpperCase() === 'NORMAL' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }`}> {lab.lab_n_flag || 'N/A'} </div> </div> <div className="text-xl font-bold text-gray-900">{lab.lab_n_value || 'N/A'}</div> <div className="text-xs text-gray-500 flex items-center mt-1"> Trend: <span className={`ml-1 font-medium ${ lab.lab_n_trend === 'increasing' ? 'text-red-600' : lab.lab_n_trend === 'decreasing' ? 'text-green-600' : 'text-gray-600' }`}> {lab.lab_n_trend === 'increasing' ? '↑' : lab.lab_n_trend === 'decreasing' ? '↓' : '→'} {lab.lab_n_trend || 'N/A'} </span> </div> </div> )) : <p className="text-sm text-gray-500 italic">No lab results available.</p>} </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"> <h3 className="font-medium text-gray-900 mb-2">Last Imaging (CXR)</h3> <p className="text-gray-700 text-sm">{clinicalInfo.last_imaging_summary || 'N/A'}</p> </div>
                       <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"> <h3 className="font-medium text-gray-900 mb-2">Last ECG</h3> <p className="text-gray-700 text-sm">{clinicalInfo.last_ecg_summary || 'N/A'}</p> </div>
                     </div>
                   </div>
                )}

                {/* Assessment Tab Content */}
                {activeTab === 'assessment' && ( <div> <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200"> <SectionHeader title="Clinical Assessment Data" icon={<FileCheck size={18} className={expandedSections.assessment ? 'text-white' : 'text-blue-500'}/>} expanded={expandedSections.assessment} onToggle={() => toggleSection('assessment')} /> {expandedSections.assessment && ( <div className="p-4 space-y-4"> <div> <h4 className="font-medium text-gray-800 mb-2">Subjective Data</h4> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <ul className="space-y-2 text-sm text-gray-700"> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Chief Complaint: {adpieData.assessment_subjective_chief_complaint}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>History of Present Illness: {adpieData.assessment_subjective_hpi}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Patient Goals/Concerns: {adpieData.assessment_subjective_goals}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Other Findings: {adpieData.assessment_subjective_other}</span></li> </ul> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">Objective Data</h4> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <ul className="space-y-2 text-sm text-gray-700"> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Vital Signs Summary: {adpieData.assessment_objective_vitals_summary}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Physical Exam Findings: {adpieData.assessment_objective_physical_exam}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Diagnostic Test Results: {adpieData.assessment_objective_diagnostics}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Medications Reviewed: {adpieData.assessment_objective_meds_reviewed}</span></li> <li className="flex items-start"><ArrowRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>Other Findings: {adpieData.assessment_objective_other}</span></li> </ul> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">AI Agent Contributions</h4> <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {agents.map((agent, idx) => ( <AgentCard key={idx} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="assessment" /> ))} {agents.length === 0 && <p className="text-sm text-gray-500 italic lg:col-span-2">No AI agent contributions available.</p>} </div> </div> </div> )} </div> </div>
                )}

                {/* Diagnosis Tab Content */}
                {activeTab === 'diagnosis' && ( <div> <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200"> <SectionHeader title="Nursing Diagnoses" icon={<AlertCircle size={18} className={expandedSections.diagnosis ? 'text-white' : 'text-purple-500'}/>} expanded={expandedSections.diagnosis} onToggle={() => toggleSection('diagnosis')} /> {expandedSections.diagnosis && ( <div className="p-4 space-y-4"> <div> <h4 className="font-medium text-gray-800 mb-2">Primary Nursing Diagnoses</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">{adpieData.diagnosis_1_nanda}</div> <p className="text-sm text-gray-700">R/T: {adpieData.diagnosis_1_related_to}</p> <p className="text-sm text-gray-700">AEB: {adpieData.diagnosis_1_evidence}</p> </div> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">{adpieData.diagnosis_2_nanda}</div> <p className="text-sm text-gray-700">R/T: {adpieData.diagnosis_2_related_to}</p> <p className="text-sm text-gray-700">AEB: {adpieData.diagnosis_2_evidence}</p> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">Secondary Nursing Diagnoses</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">{adpieData.diagnosis_3_nanda_risk}</div> <p className="text-sm text-gray-700">R/T: {adpieData.diagnosis_3_related_to_risk_factors}</p> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">AI Agent Contributions</h4> <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {agents.map((agent, idx) => ( <AgentCard key={idx} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="diagnosis" /> ))} {agents.length === 0 && <p className="text-sm text-gray-500 italic lg:col-span-2">No AI agent contributions available.</p>} </div> </div> </div> )} </div> </div>
                )}

                {/* Planning Tab Content */}
                {activeTab === 'planning' && ( <div> <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200"> <SectionHeader title="Care Planning & Goals" icon={<BarChart2 size={18} className={expandedSections.planning ? 'text-white' : 'text-indigo-500'}/>} expanded={expandedSections.planning} onToggle={() => toggleSection('planning')} /> {expandedSections.planning && ( <div className="p-4 space-y-4"> <div> <h4 className="font-medium text-gray-800 mb-2">Goals & Expected Outcomes (SMART)</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">Goal 1: {adpieData.goal_1_description}</div> <p className="text-sm text-gray-700">Target Date: {adpieData.goal_1_target_date}</p> <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mt-1"> <li>Outcome 1.1: {adpieData.goal_1_outcome_1}</li> <li>Outcome 1.2: {adpieData.goal_1_outcome_2}</li> </ul> </div> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">Goal 2: {adpieData.goal_2_description}</div> <p className="text-sm text-gray-700">Target Date: {adpieData.goal_2_target_date}</p> <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside mt-1"> <li>Outcome 2.1: {adpieData.goal_2_outcome_1}</li> </ul> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">Interdisciplinary Care Planning</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">{adpieData.Discipline_1} Plan</div> <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside"> <li>{adpieData.discipline_1_plan_item_1}</li> <li>{adpieData.discipline_1_plan_item_2}</li> </ul> </div> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">{adpieData.Discipline_2} Plan</div> <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside"> <li>{adpieData.discipline_2_plan_item_1}</li> </ul> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">AI Agent Contributions</h4> <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {agents.map((agent, idx) => ( <AgentCard key={idx} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="planning" /> ))} {agents.length === 0 && <p className="text-sm text-gray-500 italic lg:col-span-2">No AI agent contributions available.</p>} </div> </div> </div> )} </div> </div>
                )}

                 {/* Implementation Tab Content */}
                {activeTab === 'implementation' && ( <div> <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200"> <SectionHeader title="Interventions & Implementation" icon={<ListChecks size={18} className={expandedSections.implementation ? 'text-white' : 'text-green-500'}/>} expanded={expandedSections.implementation} onToggle={() => toggleSection('implementation')} /> {expandedSections.implementation && ( <div className="p-4 space-y-4"> <div> <h4 className="font-medium text-gray-800 mb-2">Implemented Interventions</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-2">Target: {adpieData.intervention_target_1}</div> <ul className="space-y-2 text-sm text-gray-700"> <li className="flex items-start"><CheckCircle size={14} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>{adpieData.intervention_1_action} (Rationale: {adpieData.intervention_1_rationale})</span></li> <li className="flex items-start"><CheckCircle size={14} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>{adpieData.intervention_2_action} (Rationale: {adpieData.intervention_2_rationale})</span></li> <li className="flex items-start"><Clock size={14} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" /><span>{adpieData.intervention_3_action_pending} (Rationale: {adpieData.intervention_3_rationale})</span></li> </ul> </div> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-2">Target: {adpieData.intervention_target_2}</div> <ul className="space-y-2 text-sm text-gray-700"> <li className="flex items-start"><CheckCircle size={14} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" /><span>{adpieData.intervention_4_action} (Rationale: {adpieData.intervention_4_rationale})</span></li> </ul> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">AI Agent Contributions</h4> <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {agents.map((agent, idx) => ( <AgentCard key={idx} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="implementation" /> ))} {agents.length === 0 && <p className="text-sm text-gray-500 italic lg:col-span-2">No AI agent contributions available.</p>} </div> </div> </div> )} </div> </div>
                )}

                {/* Evaluation Tab Content */}
                {activeTab === 'evaluation' && ( <div> <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200"> <SectionHeader title="Evaluation & Outcomes" icon={<Star size={18} className={expandedSections.evaluation ? 'text-white' : 'text-yellow-500'}/>} expanded={expandedSections.evaluation} onToggle={() => toggleSection('evaluation')} /> {expandedSections.evaluation && ( <div className="p-4 space-y-4"> <div> <h4 className="font-medium text-gray-800 mb-2">Goal Evaluation (Ongoing)</h4> <div className="space-y-3"> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">Goal: {adpieData.goal_1_description}</div> <div className="mb-2"> <span className="font-medium text-sm text-gray-700">Status ({adpieData.evaluation_1_date}): </span> <span className={`text-sm font-semibold ${ adpieData.evaluation_1_status?.toLowerCase() === 'met' ? 'text-green-700' : adpieData.evaluation_1_status?.toLowerCase() === 'partially met' ? 'text-amber-700' : adpieData.evaluation_1_status?.toLowerCase() === 'not met' ? 'text-red-700' : 'text-gray-700' }`}>{adpieData.evaluation_1_status}</span> </div> <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Evidence:</span> {adpieData.evaluation_1_evidence}</p> <p className="text-sm text-gray-700"><span className="font-medium">Plan Revision:</span> {adpieData.evaluation_1_revision}</p> </div> <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"> <div className="font-medium text-gray-900 mb-1">Goal: {adpieData.goal_2_description}</div> <div className="mb-2"> <span className="font-medium text-sm text-gray-700">Status ({adpieData.evaluation_2_date}): </span> <span className={`text-sm font-semibold ${ adpieData.evaluation_2_status?.toLowerCase() === 'met' ? 'text-green-700' : adpieData.evaluation_2_status?.toLowerCase() === 'partially met' ? 'text-amber-700' : adpieData.evaluation_2_status?.toLowerCase() === 'not met' ? 'text-red-700' : 'text-gray-700' }`}>{adpieData.evaluation_2_status}</span> </div> <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Evidence:</span> {adpieData.evaluation_2_evidence}</p> <p className="text-sm text-gray-700"><span className="font-medium">Plan Revision:</span> {adpieData.evaluation_2_revision}</p> </div> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">Overall Plan Status & Next Steps</h4> <div className="bg-blue-50 rounded-lg p-4 border border-blue-200"> <p className="text-sm text-blue-800 mb-2">{adpieData.overall_plan_summary}</p> <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside"> <li>{adpieData.next_step_1}</li> <li>{adpieData.next_step_2}</li> <li>{adpieData.next_step_3}</li> </ul> </div> </div> <div> <h4 className="font-medium text-gray-800 mb-2">AI Agent Contributions</h4> <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {agents.map((agent, idx) => ( <AgentCard key={idx} agent={agent} isExpanded={!!expandedAgents[agent.name || `agent_${idx}`]} onToggle={() => toggleAgentExpansion(agent.name || `agent_${idx}`)} section="evaluation" /> ))} {agents.length === 0 && <p className="text-sm text-gray-500 italic lg:col-span-2">No AI agent contributions available.</p>} </div> </div> </div> )} </div> </div>
                )}

                {/* Sources Tab Content */}
                {activeTab === 'sources' && (
                  <div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200">
                      <SectionHeader
                        title="Cited Sources & Evidence"
                        icon={<Link size={18} className={expandedSections.sources ? 'text-white' : 'text-teal-500'}/>}
                        expanded={expandedSections.sources}
                        onToggle={() => toggleSection('sources')}
                      />
                      {expandedSections.sources && (
                        <div className="p-4 space-y-4">
                           <div>
                            <h4 className="font-medium text-gray-800 mb-2">Supporting Documentation</h4>
                            <div className="space-y-3">
                              {sources.length > 0 ? sources.map((source, idx) => (
                                <SourceCard key={source.id || `source-${idx}`} source={source} />
                              )) : <p className="text-sm text-gray-500 italic">No sources cited.</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


              </div> {/* End Tab Content Area */}
            </div> {/* End Patient Card */}
          </div> {/* End Care Plan Section */}

          {/* Prior Authorization Panel */}
          {showPriorAuth && (
            <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-md p-5 border border-gray-200 transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield size={20} className="mr-2 text-blue-600" /> Prior Authorizations
                </h3>
                <button onClick={togglePriorAuth} className="text-gray-400 hover:text-gray-600"> <X size={18} /> </button>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {paItems.length > 0 ? paItems.map((item, idx) => ( <PriorAuthCard key={item.id || `pa-${idx}`} item={item} /> )) : <p className="text-sm text-gray-500 text-center py-4">No prior authorization items found.</p>}
              </div>
            </div>
          )}
        </div> {/* End Main Content Flex Container */}
      </div> {/* End Max Width Container */}
    </div> // End Root Div
  );
};

export default CarePlanTemplate;
