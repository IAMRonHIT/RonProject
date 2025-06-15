// Type definitions
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

interface CarePlanJsonData {
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
}

// Helper functions for kanban board
export const generateKanbanData = (carePlanData: CarePlanJsonData | null): { epics: KanbanEpic[], tasks: KanbanTask[] } => {
  const epics: KanbanEpic[] = [];
  const tasks: KanbanTask[] = [];

  if (!carePlanData) {
    return { epics, tasks };
  }

  // Create epics from nursing diagnoses and goals
  if (carePlanData.nursingDiagnoses && carePlanData.nursingDiagnoses.length > 0) {
    carePlanData.nursingDiagnoses.forEach((diagnosis, dIndex) => {
      // For each diagnosis, create one epic per goal
      if (diagnosis.goals && diagnosis.goals.length > 0) {
        diagnosis.goals.forEach((goal, gIndex) => {
          const epicId = `epic-${dIndex}-${gIndex}`;
          const epicTasks: KanbanTask[] = [];

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
              tasks.push(task);
              epicTasks.push(task);
            });
          }

          // Create evaluation tasks for this goal
          if (carePlanData.evaluations) {
            const matchingEvaluations = carePlanData.evaluations.filter(
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
              tasks.push(task);
              epicTasks.push(task);
            });
          }

          // Calculate progress for this epic based on task statuses
          const completedTasks = epicTasks.filter(t => t.status === 'completed').length;
          const progress = epicTasks.length > 0 ? Math.round((completedTasks / epicTasks.length) * 100) : 0;

          epics.push({
            id: epicId,
            title: goal.goal_description || `Goal for ${diagnosis.diagnosis_nanda}`,
            description: goal.goal_rationale || `Related to ${diagnosis.diagnosis_related_to || 'diagnosis'}`,
            goalTargetDate: goal.goal_target_date,
            diagnosisId: `diagnosis-${dIndex}`,
            diagnosisName: diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`,
            tasks: epicTasks,
            progress: progress
          });
        });
      } else {
        // If no goals, create one epic for the diagnosis
        const epicId = `epic-diagnosis-${dIndex}`;
        const epicTasks: KanbanTask[] = [];

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
            tasks.push(task);
            epicTasks.push(task);
          });
        }

        // Calculate progress for this epic
        const completedTasks = epicTasks.filter(t => t.status === 'completed').length;
        const progress = epicTasks.length > 0 ? Math.round((completedTasks / epicTasks.length) * 100) : 0;

        epics.push({
          id: epicId,
          title: `${diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`}`,
          description: diagnosis.diagnosis_related_to || 'No related factors specified',
          diagnosisId: `diagnosis-${dIndex}`,
          diagnosisName: diagnosis.diagnosis_nanda || `Diagnosis ${dIndex + 1}`,
          tasks: epicTasks,
          progress: progress
        });
      }
    });
  }

  // Add some default tasks if none were created
  if (tasks.length === 0) {
    const defaultEpicId = 'default-epic';
    
    // Default tasks
    const defaultTasks = [
      {
        id: 'default-task-1',
        title: 'Review patient assessment',
        description: 'Complete thorough clinical assessment and document findings',
        status: 'todo' as TaskStatus,
        priority: 'high' as const,
        type: 'assessment' as const,
        epicId: defaultEpicId,
        epicName: 'Care Plan Implementation',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-task-2',
        title: 'Administer prescribed medications',
        description: 'Follow medication schedule and document administration',
        status: 'in-progress' as TaskStatus,
        priority: 'high' as const,
        type: 'intervention' as const,
        epicId: defaultEpicId,
        epicName: 'Care Plan Implementation',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 'default-task-3',
        title: 'Patient education',
        description: 'Educate patient on condition and self-care management',
        status: 'todo' as TaskStatus,
        priority: 'medium' as const,
        type: 'intervention' as const,
        epicId: defaultEpicId,
        epicName: 'Care Plan Implementation',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ];

    // Add tasks to our arrays
    tasks.push(...defaultTasks);

    // Create a default epic
    epics.push({
      id: defaultEpicId,
      title: 'Care Plan Implementation',
      description: 'Standard clinical interventions and assessments',
      diagnosisId: 'default',
      diagnosisName: 'Standard Care',
      tasks: defaultTasks,
      progress: 0
    });
  }

  return { epics, tasks };
};

export const updateTaskStatus = (tasks: KanbanTask[], taskId: string, newStatus: TaskStatus): KanbanTask[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        status: newStatus,
        // If task is being started or completed, update the assignee if not already set
        assignee: newStatus === 'in-progress' && !task.assignee ? 'Clinician' : task.assignee
      };
    }
    return task;
  });
};

export const assignTaskToAgent = (tasks: KanbanTask[], taskId: string, assignee: string): KanbanTask[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        assignee,
        // If a task is assigned, it's automatically moved to in-progress if it was in todo
        status: task.status === 'todo' ? 'in-progress' : task.status
      };
    }
    return task;
  });
};
