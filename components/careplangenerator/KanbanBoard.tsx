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
import TaskDetailModal from './TaskDetailModal'; // Import the new modal

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

// Icon glow style
const iconGlowStyle = { filter: 'drop-shadow(0 0 3px rgba(135, 206, 250, 0.6))' }; // Light blue glow

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  epics,
  enableSimulations = false,
  onTaskStatusChange,
  onTaskAssign,
  patientName,
  patientId,
}) => {
  // State
  const [filteredTasks, setFilteredTasks] = useState<KanbanTask[]>(tasks);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'intervention' | 'assessment' | 'evaluation'>('all');
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<KanbanTask | null>(null);

  // Define status columns
  const statusColumns: StatusColumn[] = [
    { 
      id: 'todo', 
      title: 'To Do', 
      icon: <ListChecks size={18} style={iconGlowStyle} />,
      color: 'bg-sky-600',
      borderColor: 'border-sky-500/70'
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      icon: <Clock size={18} style={iconGlowStyle} />,
      color: 'bg-amber-600',
      borderColor: 'border-amber-500/70'
    },
    { 
      id: 'review', 
      title: 'Review', 
      icon: <Edit3 size={18} style={iconGlowStyle} />,
      color: 'bg-purple-600',
      borderColor: 'border-purple-500/70'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle size={18} style={iconGlowStyle} />,
      color: 'bg-green-600',
      borderColor: 'border-green-500/70'
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
    setSelectedTaskForModal({...task, patientName, patientId });
    setIsModalOpen(true);
  };
  const closeTaskModal = () => {
    setIsModalOpen(false);
    setSelectedTaskForModal(null);
  };

  const totalTasks = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const getPriorityBadgeStyle = (priority: KanbanTask['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'urgent': return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'low': return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      default: return 'bg-slate-600 text-slate-300 border-slate-500';
    }
  };
  
  const getTypeBadgeStyle = (type: KanbanTask['type']) => {
    switch (type) {
      case 'intervention': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'assessment': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'evaluation': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      default: return 'bg-slate-600 text-slate-300 border-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center">
              <BarChart2 size={20} className="mr-2 text-sky-400" style={iconGlowStyle} />
              Care Plan Task Board
            </h2>
            <div className="flex items-center space-x-2">
              <div className="bg-slate-700 p-1.5 rounded-md text-xs text-slate-300 border border-slate-600">
                {totalTasks} Tasks
              </div>
              <div className="bg-green-700/20 border border-green-600/50 p-1.5 rounded-md text-xs text-green-300 flex items-center">
                <CheckCircle size={14} className="mr-1" style={iconGlowStyle} />
                {completionRate}% Complete
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={14} className="text-slate-400" style={iconGlowStyle} />
              </div>
              <select
                className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm appearance-none"
                value={taskFilter}
                onChange={(e) => handleTypeFilter(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="intervention">Interventions</option>
                <option value="assessment">Assessments</option>
                <option value="evaluation">Evaluations</option>
              </select>
            </div>
            <div className="relative flex-grow lg:flex-grow-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-slate-400" style={iconGlowStyle} />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
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
        <div className="w-72 border-r border-slate-700 bg-slate-800 p-3 overflow-y-auto styled-scrollbar hidden md:block">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Goals / Epics</h3>
            <button
              className={`w-full text-left mb-1.5 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${selectedEpic === null ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`}
              onClick={() => handleEpicSelect(null)}
            >
              All Tasks
            </button>
            {epics.map(epic => (
              <div key={epic.id} className="mb-1.5">
                <div 
                  className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${selectedEpic === epic.id ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`}
                  onClick={() => handleEpicSelect(epic.id)}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Target size={14} className={selectedEpic === epic.id ? 'text-white' : 'text-sky-400'} style={iconGlowStyle} />
                    <span className="truncate font-medium">{epic.title}</span>
                  </div>
                  <div 
                    className="p-1 rounded hover:bg-slate-600/50"
                    onClick={(e) => { e.stopPropagation(); toggleEpicExpansion(epic.id); }}
                  >
                    {expandedEpics[epic.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {expandedEpics[epic.id] && (
                  <div className="ml-4 pl-4 border-l-2 border-slate-700 mt-2 mb-3 py-2 pr-1 space-y-2 bg-slate-700/30 rounded-r-md">
                    <p className="text-xs text-slate-400 line-clamp-3">{epic.description}</p>
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span>Progress:</span>
                      <span className="font-semibold">{epic.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-sky-500 to-green-500 h-1.5 rounded-full" style={{ width: `${epic.progress}%` }}></div>
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
        <div className="flex-1 overflow-x-auto styled-scrollbar pb-4">
          <div className="flex h-full p-4 space-x-4 min-w-max">
            {statusColumns.map(column => (
              <div 
                key={column.id}
                className={`w-80 flex flex-col bg-slate-800 rounded-xl shadow-lg border ${column.borderColor} h-full`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className={`p-3 border-b ${column.borderColor} ${column.color} rounded-t-lg`}>
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <span className="p-1.5 rounded-md mr-2.5">{column.icon}</span>
                    {column.title}
                    <span className="ml-auto bg-black/20 text-slate-200 text-sm py-1 px-2.5 rounded-full">
                      {filteredTasks.filter(t => t.status === column.id).length}
                    </span>
                  </h3>
                </div>
                <div className="overflow-y-auto flex-grow p-3 space-y-3 styled-scrollbar min-h-[calc(100vh-300px)]">
                  {filteredTasks.filter(t => t.status === column.id).length > 0 ? (
                    filteredTasks
                      .filter(t => t.status === column.id)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="bg-slate-700 rounded-lg p-3.5 border border-slate-600 shadow-md hover:border-sky-500/70 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                          draggable={enableSimulations}
                          onDragStart={() => handleDragStart(task)}
                          onClick={() => openTaskModal(task)}
                        >
                          {enableSimulations && <GripVertical size={16} className="absolute top-2 right-2 text-slate-500 group-hover:text-slate-400 cursor-grab" />}
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getTypeBadgeStyle(task.type)} capitalize`}>
                              {task.type}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getPriorityBadgeStyle(task.priority)} capitalize`}>
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-100 mb-1.5 line-clamp-2">{task.title}</h4>
                          <p className="text-sm text-slate-300 mb-2.5 line-clamp-2">{task.description}</p>
                          {task.epicName && (
                            <div className="flex items-center mb-2 text-xs text-sky-300">
                              <Target size={12} className="mr-1.5" style={iconGlowStyle} />
                              <span className="truncate">{task.epicName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs text-slate-400">
                            {task.dueDate && <span>Due: {task.dueDate}</span>}
                            {task.assignee && <span className="font-medium flex items-center text-amber-300">
                              <Users size={12} className="mr-1.5" style={iconGlowStyle} /> {task.assignee}
                            </span>}
                          </div>
                          {enableSimulations && column.id !== 'completed' && (
                            <div className="flex items-center justify-start space-x-2 mt-3 pt-3 border-t border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {column.id === 'todo' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'in-progress'); }}
                                    className="bg-transparent hover:bg-sky-500/10 text-sky-300 hover:text-sky-200 text-xs font-medium py-1.5 px-3 rounded-md border border-sky-500/70 flex items-center"
                                  >
                                    <PlayCircle size={14} className="mr-1.5" /> Start
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskAssign(task.id, 'Ron AI'); }}
                                    className="bg-transparent hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 text-xs font-medium py-1.5 px-3 rounded-md border border-purple-500/70 flex items-center"
                                  >
                                    <Users size={14} className="mr-1.5" /> Assign
                                  </button>
                                </>
                              )}
                              {column.id === 'in-progress' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'review'); }}
                                  className="bg-transparent hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 text-xs font-medium py-1.5 px-3 rounded-md border border-amber-500/70 flex items-center"
                                >
                                  <FileCheck size={14} className="mr-1.5" /> Needs Review
                                </button>
                              )}
                              {column.id === 'review' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'completed'); }}
                                    className="bg-transparent hover:bg-green-500/10 text-green-300 hover:text-green-200 text-xs font-medium py-1.5 px-3 rounded-md border border-green-500/70 flex items-center"
                                  >
                                    <CheckCircle size={14} className="mr-1.5" /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTaskStatusChange(task.id, 'in-progress'); }}
                                    className="bg-transparent hover:bg-red-500/10 text-red-300 hover:text-red-200 text-xs font-medium py-1.5 px-3 rounded-md border border-red-500/70 flex items-center"
                                  >
                                    <X size={14} className="mr-1.5" /> Revise
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500 italic text-sm">No tasks in this column</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={closeTaskModal}
        task={selectedTaskForModal}
        patientName={patientName}
        patientId={patientId}
      />
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); /* slate-800 with opacity */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; /* slate-600 */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; /* slate-500 */ }
      `}</style>
    </div>
  );
};

export default KanbanBoard;