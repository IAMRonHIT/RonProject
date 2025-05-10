// Kanban helper functions

// Types
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

export interface KanbanEpic {
  id: string;
  title: string;
  description: string;
  goalTargetDate?: string;
  diagnosisId: string;
  diagnosisName: string;
  tasks: KanbanTask[];
  progress: number;
}

export interface KanbanTask {
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

// Raw care plan data types
export interface CarePlanGoal {
  goal_description: string;
  goal_target_date?: string;
  goal_outcomes: string[];
  goal_rationale?: string;
}

export interface CarePlanIntervention {
  intervention_action: string;
  intervention_rationale: string;
  intervention_is_pending?: boolean;
}

export interface NursingDiagnosis {
  diagnosis_nanda: string;
  diagnosis_related_to?: string;
  diagnosis_evidence: string[];
  diagnosis_is_risk?: boolean;
  diagnosis_risk_factors?: string[];
  goals: CarePlanGoal[];
  interventions: CarePlanIntervention[];
}

export interface CarePlanEvaluation {
  evaluation_goal_description_ref: string;
  evaluation_date?: string;
  evaluation_status?: string;
  evaluation_evidence: string;
  evaluation_revision?: string;
  evaluation_rationale?: string;
}

export interface CarePlanDataForKanban {
  nursingDiagnoses?: NursingDiagnosis[];
  evaluations?: CarePlanEvaluation[];
  assessment_subjective_chief_complaint?: string;
  assessment_subjective_hpi?: string;
  assessment_objective_vitals_summary?: string;
  assessment_objective_physical_exam?: string;
  assessment_objective_diagnostics?: string;
}

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to get a random priority
export const getRandomPriority = (): 'low' | 'medium' | 'high' | 'urgent' => {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  return priorities[Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high' | 'urgent';
};

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Main function to generate Kanban epics and tasks from care plan data
export const generateKanbanData = (data: CarePlanDataForKanban): { epics: KanbanEpic[], tasks: KanbanTask[] } => {
  const epics: KanbanEpic[] = [];
  const tasks: KanbanTask[] = [];
  
  // Process nursing diagnoses and their goals/interventions
  if (data.nursingDiagnoses && data.nursingDiagnoses.length > 0) {
    data.nursingDiagnoses.forEach((diagnosis, diagnosisIndex) => {
      // Create goals as epics
      diagnosis.goals.forEach((goal, goalIndex) => {
        const epicId = `epic-${diagnosisIndex}-${goalIndex}`;
        
        // Create epic from goal
        const epic: KanbanEpic = {
          id: epicId,
          title: goal.goal_description,
          description: goal.goal_rationale || `Goal related to ${diagnosis.diagnosis_nanda}`,
          goalTargetDate: goal.goal_target_date,
          diagnosisId: `diagnosis-${diagnosisIndex}`,
          diagnosisName: diagnosis.diagnosis_nanda,
          tasks: [],
          progress: 0 // Will be calculated later
        };
        
        // Add epic to list
        epics.push(epic);
        
        // Create tasks from interventions related to this goal
        diagnosis.interventions.forEach((intervention, interventionIndex) => {
          const interventionTask: KanbanTask = {
            id: `task-intervention-${diagnosisIndex}-${goalIndex}-${interventionIndex}`,
            title: intervention.intervention_action,
            description: intervention.intervention_rationale,
            status: intervention.intervention_is_pending ? 'todo' : 'todo',
            priority: getRandomPriority(),
            type: 'intervention',
            epicId: epicId,
            epicName: goal.goal_description,
            createdAt: getTodayDate(),
            dueDate: goal.goal_target_date
          };
          
          // Add task to epic's tasks and to the main tasks list
          epic.tasks.push(interventionTask);
          tasks.push(interventionTask);
        });
      });
    });
  }
  
  // Process assessment items as tasks
  if (data.assessment_subjective_chief_complaint || data.assessment_subjective_hpi) {
    const subjectiveAssessmentTask: KanbanTask = {
      id: `task-assessment-subjective-${generateId()}`,
      title: 'Complete Subjective Assessment',
      description: `Review and document patient's chief complaint and history of present illness.`,
      status: 'todo',
      priority: 'high',
      type: 'assessment',
      createdAt: getTodayDate(),
      details: {
        chief_complaint: data.assessment_subjective_chief_complaint,
        hpi: data.assessment_subjective_hpi
      }
    };
    tasks.push(subjectiveAssessmentTask);
  }
  
  if (data.assessment_objective_vitals_summary || data.assessment_objective_physical_exam || data.assessment_objective_diagnostics) {
    const objectiveAssessmentTask: KanbanTask = {
      id: `task-assessment-objective-${generateId()}`,
      title: 'Complete Objective Assessment',
      description: `Review and document vital signs, physical exam findings, and diagnostic results.`,
      status: 'todo',
      priority: 'high',
      type: 'assessment',
      createdAt: getTodayDate(),
      details: {
        vitals: data.assessment_objective_vitals_summary,
        physical_exam: data.assessment_objective_physical_exam,
        diagnostics: data.assessment_objective_diagnostics
      }
    };
    tasks.push(objectiveAssessmentTask);
  }
  
  // Process evaluations as tasks
  if (data.evaluations && data.evaluations.length > 0) {
    data.evaluations.forEach((evaluation, index) => {
      // Find associated epic (goal)
      const relatedEpic = epics.find(e => e.title === evaluation.evaluation_goal_description_ref);
      
      const evaluationTask: KanbanTask = {
        id: `task-evaluation-${index}`,
        title: `Evaluate Goal: ${evaluation.evaluation_goal_description_ref.substring(0, 50)}...`,
        description: `Review progress and document evidence: ${evaluation.evaluation_evidence}`,
        status: evaluation.evaluation_status?.toLowerCase().includes('met') ? 'completed' : 'todo',
        priority: 'medium',
        type: 'evaluation',
        epicId: relatedEpic?.id,
        epicName: relatedEpic?.title,
        createdAt: evaluation.evaluation_date || getTodayDate(),
        details: evaluation
      };
      
      // Add to tasks list
      tasks.push(evaluationTask);
      
      // Add to epic's tasks if there's a related epic
      if (relatedEpic) {
        relatedEpic.tasks.push(evaluationTask);
      }
    });
  }
  
  // Calculate progress for each epic
  epics.forEach(epic => {
    if (epic.tasks.length === 0) {
      epic.progress = 0;
    } else {
      const completedTasks = epic.tasks.filter(t => t.status === 'completed').length;
      epic.progress = Math.round((completedTasks / epic.tasks.length) * 100);
    }
  });
  
  return { epics, tasks };
};

// Function to filter tasks
export const filterKanbanTasks = (
  tasks: KanbanTask[],
  filterType: 'all' | 'intervention' | 'assessment' | 'evaluation',
  selectedEpicId: string | null,
  searchTerm: string = ''
): KanbanTask[] => {
  let result = [...tasks];
  
  // Filter by type
  if (filterType !== 'all') {
    result = result.filter(task => task.type === filterType);
  }
  
  // Filter by epic
  if (selectedEpicId) {
    result = result.filter(task => task.epicId === selectedEpicId);
  }
  
  // Filter by search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    result = result.filter(task => 
      task.title.toLowerCase().includes(term) || 
      task.description.toLowerCase().includes(term)
    );
  }
  
  return result;
};

// Function to update task status
export const updateTaskStatus = (
  tasks: KanbanTask[],
  taskId: string,
  newStatus: TaskStatus
): KanbanTask[] => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, status: newStatus } 
      : task
  );
};

// Function to assign task to an agent
export const assignTaskToAgent = (
  tasks: KanbanTask[],
  taskId: string,
  assignee: string
): KanbanTask[] => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, assignee } 
      : task
  );
};