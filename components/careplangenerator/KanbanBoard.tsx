"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, 
  TrendingUp, ListChecks, Edit3, Repeat, Share2, Users, Loader2, PlayCircle,
  Search, GripVertical // Added GripVertical for drag handle
} from 'lucide-react';
import { TaskDetailPortal } from './TaskDetailPortal'; // Import the portal-based task detail component

// Task Types
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
  details?: any; // For additional details like rationale, sub-tasks
  patientName?: string; // Added for modal context
  patientId?: string; // Added for modal context
}

// Props interface
interface KanbanBoardProps {
  tasks: KanbanTask[];
  epics: KanbanEpic[];
  enableSimulations?: boolean;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskAssign?: (taskId: string, assignee: string) => void;
  patientName?: string;
  patientId?: string;
}

// Status column definition
interface StatusColumn {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  color: string; // Tailwind bg color class for header accent
  borderColor: string; // Tailwind border color class for column
}

// Icon glow style will be handled by Tailwind classes like 'glow-sky-500'

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  epics,
  enableSimulations = false,
  onTaskStatusChange,
  onTaskAssign,
  patientName,
  patientId,
}) => {
  const [filteredTasks, setFilteredTasks] = useState<KanbanTask[]>(tasks);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'intervention' | 'assessment' | 'evaluation'>('all');
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<KanbanTask | null>(null);
  

  const statusColumns: StatusColumn[] = [
    { 
      id: 'todo', 
      title: 'To Do', 
      icon: <ListChecks size={18} className="text-sky-400" />,
      color: 'bg-slate-800', // Header BG
      borderColor: 'border-sky-700' // Column border, header bottom border
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      icon: <Clock size={18} className="text-amber-400 animate-pulse" />,
      color: 'bg-slate-800',
      borderColor: 'border-amber-700'
    },
    { 
      id: 'review', 
      title: 'Review', 
      icon: <Edit3 size={18} className="text-purple-400" />,
      color: 'bg-slate-800',
      borderColor: 'border-purple-700'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle size={18} className="text-lime-400" />,
      color: 'bg-slate-800',
      borderColor: 'border-lime-700'
    }
  ];

  useEffect(() => {
    let result = [...tasks];
    if (selectedEpic) result = result.filter(task => task.epicId === selectedEpic);
    if (taskFilter !== 'all') result = result.filter(task => task.type === taskFilter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term) ||
        (task.epicName && task.epicName.toLowerCase().includes(term))
      );
    }
    setFilteredTasks(result);
  }, [tasks, selectedEpic, taskFilter, searchTerm]);

  const handleTypeFilter = (type: 'all' | 'intervention' | 'assessment' | 'evaluation') => setTaskFilter(type);
  const handleEpicSelect = (epicId: string | null) => setSelectedEpic(epicId);
  const toggleEpicExpansion = (epicId: string) => setExpandedEpics(prev => ({ ...prev, [epicId]: !prev[epicId] }));

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    if (onTaskStatusChange) onTaskStatusChange(taskId, status);
  };
  const handleTaskAssign = (taskId: string, assignee: string) => {
    if (onTaskAssign) onTaskAssign(taskId, assignee);
  };

  const handleDragStart = (task: KanbanTask) => {
    if (!enableSimulations) return;
    setIsDragging(true);
    setDraggedTask(task);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (status: TaskStatus) => {
    if (!enableSimulations || !draggedTask) return;
    setIsDragging(false);
    handleTaskStatusChange(draggedTask.id, status);
    setDraggedTask(null);
  };

  const openTaskModal = (task: KanbanTask) => {
    setSelectedTaskForModal(task);
    setIsModalOpen(true);
  };
  const closeTaskModal = () => {
    setIsModalOpen(false);
    setSelectedTaskForModal(null);
  };

  const totalTasks = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  
  const getColumnGlowClass = (statusId: TaskStatus) => {
    switch (statusId) {
      case 'todo': return 'glow-sky-500';
      case 'in-progress': return 'glow-amber-400';
      case 'review': return 'glow-purple-500';
      case 'completed': return 'glow-lime-400';
      default: return '';
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center">
              <BarChart2 size={20} className="mr-2 text-sky-400 glow-sky-500" />
              Care Plan Task Board
            </h2>
            <div className="flex items-center space-x-2">
              <div className="bg-slate-800 p-1.5 rounded-md text-xs text-slate-300 border border-slate-600">
                {totalTasks} Tasks
              </div>
              <div className="bg-slate-800 border border-lime-700 p-1.5 rounded-md text-xs text-lime-400 flex items-center glow-lime-400">
                <CheckCircle size={14} className="mr-1 text-lime-400" />
                {completionRate}% Complete
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={14} className="text-slate-400" />
              </div>
              <select
                className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm appearance-none"
                value={taskFilter}
                onChange={(e) => handleTypeFilter(e.target.value as any)}
                aria-label="Filter tasks by type"
              >
                <option value="all">All Types</option>
                <option value="intervention">Interventions</option>
                <option value="assessment">Assessments</option>
                <option value="evaluation">Evaluations</option>
              </select>
            </div>
            <div className="relative flex-grow lg:flex-grow-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Epics sidebar */}
        <div className="w-72 border-r border-slate-700 bg-slate-900 p-3 overflow-y-auto styled-scrollbar-dark hidden md:block">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Goals / Epics</h3>
            <button
              className={`w-full text-left mb-1.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${selectedEpic === null ? 'bg-sky-600 text-white shadow-md glow-sky-500' : 'text-slate-300 hover:bg-slate-800 hover:text-sky-300'}`}
              onClick={() => handleEpicSelect(null)}
            >
              All Tasks
            </button>
            {epics.map(epic => (
              <div key={epic.id} className="mb-1.5">
                <div 
                  className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${selectedEpic === epic.id ? 'bg-sky-600 text-white shadow-md glow-sky-500' : 'text-slate-300 hover:bg-slate-800 hover:text-sky-300'}`}
                  onClick={() => handleEpicSelect(epic.id)}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Target size={14} className={selectedEpic === epic.id ? 'text-white' : 'text-sky-400 glow-sky-500'} />
                    <span className="truncate font-medium">{epic.title}</span>
                  </div>
                  <div 
                    className="p-1 rounded hover:bg-slate-700/50"
                    onClick={(e) => { e.stopPropagation(); toggleEpicExpansion(epic.id); }}
                  >
                    {expandedEpics[epic.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {expandedEpics[epic.id] && (
                  <div className="ml-4 pl-3 border-l-2 border-slate-700 mt-2 mb-3 py-2 pr-1 space-y-2 bg-slate-800/50 rounded-r-md">
                    <p className="text-xs text-slate-400 line-clamp-3">{epic.description}</p>
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span>Progress:</span>
                      <span className="font-semibold">{epic.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar progress-width-${Math.round(epic.progress / 5) * 5}`} 
                        data-testid="progress-bar"
                      ></div>
                    </div>
                    {epic.goalTargetDate && (
                      <div className="text-xs text-slate-400 flex items-center mt-1">
                        <Calendar size={12} className="mr-1.5" /> Due: {epic.goalTargetDate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban board columns */}
        <div className="flex-1 overflow-x-auto styled-scrollbar-dark pb-4">
          <div className="flex h-full p-4 space-x-4 min-w-max">
            {statusColumns.map(column => (
              <div 
                key={column.id}
                className={`w-80 flex flex-col bg-slate-900 rounded-xl shadow-xl border ${column.borderColor} ${getColumnGlowClass(column.id)} h-full`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className={`p-3 border-b ${column.borderColor} ${column.color} rounded-t-lg flex items-center sticky top-0 z-10 bg-opacity-80 backdrop-blur-sm`}>
                  <span className={`p-1.5 rounded-md mr-2.5 ${getColumnGlowClass(column.id)}`}>{column.icon}</span>
                  <h3 className="text-lg font-semibold text-white">
                    {column.title}
                  </h3>
                  <span className="ml-auto bg-black/30 text-slate-200 text-sm py-1 px-2.5 rounded-full border border-slate-700">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <div className="overflow-y-auto flex-grow p-3 space-y-3 styled-scrollbar-dark min-h-[calc(100vh-350px)]">
                  {filteredTasks.filter(t => t.status === column.id).length > 0 ? (
                    filteredTasks
                      .filter(t => t.status === column.id)
                      .map(task => (
                        <div 
                          key={task.id}
                          className="group relative cursor-pointer"
                          draggable={enableSimulations}
                          onDragStart={() => handleDragStart(task)}
                          onClick={() => openTaskModal(task)}
                        >
                          {/* Card with gradient border and glassmorphism effect */}
                          <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/90 backdrop-blur-sm p-3.5 rounded-lg shadow-lg border border-slate-700/80 hover:shadow-xl transition-all duration-300 relative overflow-hidden group-hover:border-slate-600">
                            
                            {/* Subtle accent line based on type */}
                            <div className={`absolute left-0 top-0 h-full w-1 ${
                              task.type === 'intervention' ? 'bg-purple-500/50' : 
                              task.type === 'assessment' ? 'bg-lime-500/50' : 
                              'bg-orange-500/50'
                            }`}></div>
                            
                            {/* Top section */}
                            <div className="pl-2 mb-2.5 flex justify-between items-start">
                              {/* Tags row */}
                              <div className="flex gap-2 flex-wrap mb-1">
                                {/* Type badge */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.type === 'intervention' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' : 
                                  task.type === 'assessment' ? 'bg-lime-900/40 text-lime-300 border border-lime-700/50' : 
                                  'bg-orange-900/40 text-orange-300 border border-orange-700/50'
                                }`}>
                                  {task.type}
                                </span>
                                
                                {/* Priority pill */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.priority === 'high' ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 
                                  task.priority === 'urgent' ? 'bg-pink-900/30 text-pink-300 border border-pink-700/50' : 
                                  task.priority === 'medium' ? 'bg-amber-900/30 text-amber-300 border border-amber-700/50' : 
                                  'bg-sky-900/30 text-sky-300 border border-sky-700/50'
                                }`}>
                                  {task.priority === 'urgent' && (
                                    <AlertCircle size={10} className="mr-1 animate-pulse text-pink-400" />
                                  )}
                                  {task.priority}
                                </span>
                              </div>
                              
                              {/* Drag handle */}
                              {enableSimulations && (
                                <GripVertical size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                              )}
                            </div>
                            
                            {/* Title with subtle gradient */}
                            <h4 className="text-sm font-semibold pl-2 mb-1.5 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                              {task.title}
                            </h4>
                            
                            {/* Description */}
                            <p className="text-xs text-slate-300/90 pl-2 mb-3 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                            
                            {/* Epic name if exists */}
                            {task.epicName && (
                              <div className="flex items-center pl-2 mb-2 text-[0.65rem] text-sky-400">
                                <Target size={10} className="inline mr-1" />
                                <span className="truncate">{task.epicName}</span>
                              </div>
                            )}
                            
                            {/* Bottom metadata row */}
                            <div className="flex justify-between items-center mt-2 text-[0.65rem] pl-2">
                              {task.dueDate && (
                                <div className="flex items-center text-slate-400">
                                  <Clock size={10} className="mr-1" />
                                  {task.dueDate}
                                </div>
                              )}
                              
                              {task.assignee && (
                                <div className="flex items-center text-amber-400 ml-auto">
                                  <Users size={10} className="mr-1" />
                                  {task.assignee}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          {enableSimulations && column.id !== 'completed' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-slate-900/0 p-3 pt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center gap-2">
                              {column.id === 'todo' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'in-progress'); }}
                                    className="bg-gradient-to-r from-sky-800/80 to-sky-900/80 text-sky-300 hover:text-white text-xs py-1 px-2 rounded border border-sky-700/70 hover:border-sky-500 flex items-center"
                                  >
                                    <PlayCircle size={10} className="mr-1" /> Start
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskAssign(task.id, 'Ron AI'); }}
                                    className="bg-gradient-to-r from-purple-800/80 to-purple-900/80 text-purple-300 hover:text-white text-xs py-1 px-2 rounded border border-purple-700/70 hover:border-purple-500 flex items-center"
                                  >
                                    <Users size={10} className="mr-1" /> Assign
                                  </button>
                                </>
                              )}
                              {column.id === 'in-progress' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'review'); }}
                                  className="bg-gradient-to-r from-amber-800/80 to-amber-900/80 text-amber-300 hover:text-white text-xs py-1 px-2 rounded border border-amber-700/70 hover:border-amber-500 flex items-center"
                                >
                                  <FileCheck size={10} className="mr-1" /> Review
                                </button>
                              )}
                              {column.id === 'review' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'completed'); }}
                                    className="bg-gradient-to-r from-lime-800/80 to-lime-900/80 text-lime-300 hover:text-white text-xs py-1 px-2 rounded border border-lime-700/70 hover:border-lime-500 flex items-center"
                                  >
                                    <CheckCircle size={10} className="mr-1" /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'in-progress'); }}
                                    className="bg-gradient-to-r from-red-800/80 to-red-900/80 text-red-300 hover:text-white text-xs py-1 px-2 rounded border border-red-700/70 hover:border-red-500 flex items-center"
                                  >
                                    <X size={10} className="mr-1" /> Revise
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-600 italic text-sm">No tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TaskDetailPortal
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        task={selectedTaskForModal}
        patientName={patientName}
        patientId={patientId}
      />
      <style jsx global>{`
        .styled-scrollbar-dark::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar-dark::-webkit-scrollbar-track { background: #0f172a; /* slate-900 */ }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb { background: #1e293b; /* slate-800 */ border-radius: 10px; }
        .styled-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #334155; /* slate-700 */ }

        /* Electric Glows - ensure these are defined in careplan-template.tsx or a global CSS file */
        .glow-sky-500 { box-shadow: 0 0 8px 1px rgba(14, 165, 233, 0.3); }
        .glow-lime-400 { box-shadow: 0 0 8px 1px rgba(163, 230, 53, 0.3); }
        .glow-amber-400 { box-shadow: 0 0 8px 1px rgba(251, 191, 36, 0.3); }
        .glow-fuchsia-400 { box-shadow: 0 0 8px 1px rgba(236, 72, 153, 0.3); }
        .glow-red-500 { box-shadow: 0 0 8px 1px rgba(239, 68, 68, 0.3); }
        .glow-purple-500 { box-shadow: 0 0 8px 1px rgba(168, 85, 247, 0.3); }
        .glow-orange-400 { box-shadow: 0 0 8px 1px rgba(251, 146, 60, 0.3); } /* For orange type badge */
      `}</style>
    </div>
  );
};

export default KanbanBoard;
