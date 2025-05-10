"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Calendar, Activity, FileText, Clock, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Zap, Info,
  Star, Check, ArrowRight, MessageCircle, Clipboard, BarChart2,
  Settings, Download, RefreshCw, Filter, Bell, FileCheck, Plus, Target, 
  TrendingUp, ListChecks, Edit3, Repeat, Share2, Users, Loader2, PlayCircle
} from 'lucide-react';

// Task Types
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

interface KanbanEpic {
  id: string;
  title: string;
  description: string;
  goalTargetDate?: string;
  diagnosisId: string;
  diagnosisName: string;
  tasks: KanbanTask[];
  progress: number;
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

// Props interface
interface KanbanBoardProps {
  tasks: KanbanTask[];
  epics: KanbanEpic[];
  enableSimulations?: boolean;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskAssign?: (taskId: string, assignee: string) => void;
}

// Status column definition
interface StatusColumn {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  epics,
  enableSimulations = false,
  onTaskStatusChange,
  onTaskAssign
}) => {
  // State
  const [filteredTasks, setFilteredTasks] = useState<KanbanTask[]>(tasks);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'intervention' | 'assessment' | 'evaluation'>('all');
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Define status columns
  const statusColumns: StatusColumn[] = [
    { 
      id: 'todo', 
      title: 'To Do', 
      icon: <ListChecks size={18} />, 
      color: 'bg-blue-700'
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      icon: <Clock size={18} />, 
      color: 'bg-amber-700'
    },
    { 
      id: 'review', 
      title: 'Review', 
      icon: <Edit3 size={18} />, 
      color: 'bg-orange-700'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: <CheckCircle size={18} />, 
      color: 'bg-green-700'
    }
  ];

  // Update filtered tasks when tasks or filters change
  useEffect(() => {
    let result = [...tasks];
    
    // Filter by epic
    if (selectedEpic) {
      result = result.filter(task => task.epicId === selectedEpic);
    }
    
    // Filter by task type
    if (taskFilter !== 'all') {
      result = result.filter(task => task.type === taskFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, selectedEpic, taskFilter, searchTerm]);

  // Filter tasks by type
  const handleTypeFilter = (type: 'all' | 'intervention' | 'assessment' | 'evaluation') => {
    setTaskFilter(type);
  };

  // Select an epic
  const handleEpicSelect = (epicId: string | null) => {
    setSelectedEpic(epicId);
  };

  // Toggle epic expansion
  const toggleEpicExpansion = (epicId: string) => {
    setExpandedEpics(prev => ({
      ...prev,
      [epicId]: !prev[epicId]
    }));
  };

  // Handle task status change
  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, status);
    }
  };

  // Handle task assignment
  const handleTaskAssign = (taskId: string, assignee: string) => {
    if (onTaskAssign) {
      onTaskAssign(taskId, assignee);
    }
  };

  // Drag and drop functionality
  const handleDragStart = (task: KanbanTask) => {
    if (!enableSimulations) return;
    setIsDragging(true);
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (!enableSimulations || !draggedTask) return;
    setIsDragging(false);
    handleTaskStatusChange(draggedTask.id, status);
    setDraggedTask(null);
  };

  // Calculate stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate progress for selected epic
  const selectedEpicData = selectedEpic ? epics.find(e => e.id === selectedEpic) : null;

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl overflow-hidden">
      {/* Header with stats and filters */}
      <div className="bg-slate-700 p-4 border-b border-slate-600">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center">
              <BarChart2 size={20} className="mr-2 text-blue-400" />
              Care Plan Tasks
            </h2>
            <div className="flex items-center space-x-2">
              <div className="bg-slate-600 p-1.5 rounded-md text-sm text-slate-200">
                {totalTasks} Tasks
              </div>
              <div className="bg-green-700 bg-opacity-30 p-1.5 rounded-md text-sm text-green-300 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                {completionRate}% Complete
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={14} className="text-slate-400" />
              </div>
              <select
                className="bg-slate-600 text-slate-200 border border-slate-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={taskFilter}
                onChange={(e) => handleTypeFilter(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="intervention">Interventions</option>
                <option value="assessment">Assessments</option>
                <option value="evaluation">Evaluations</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-slate-600 text-slate-200 border border-slate-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and kanban */}
      <div className="flex flex-1 overflow-hidden">
        {/* Epics sidebar */}
        <div className="w-64 border-r border-slate-600 bg-slate-700 p-3 overflow-y-auto styled-scrollbar hidden md:block">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-400 mb-2 px-2">GOALS / EPICS</h3>
            
            <button
              className={`w-full text-left mb-1.5 px-3 py-2 rounded-lg text-sm ${selectedEpic === null ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-600'}`}
              onClick={() => handleEpicSelect(null)}
            >
              All Tasks
            </button>
            
            {epics.map(epic => (
              <div key={epic.id} className="mb-1.5">
                <div 
                  className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm cursor-pointer ${selectedEpic === epic.id ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-600'}`}
                  onClick={() => handleEpicSelect(epic.id)}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Target size={14} className={selectedEpic === epic.id ? 'text-white' : 'text-blue-400'} />
                    <span className="truncate">{epic.title}</span>
                  </div>
                  <div 
                    className="flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEpicExpansion(epic.id);
                    }}
                  >
                    {expandedEpics[epic.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
                
                {expandedEpics[epic.id] && (
                  <div className="ml-3 pl-3 border-l border-slate-600 mt-1 mb-2 space-y-1">
                    <div className="text-xs text-slate-400 mt-1 mb-2">
                      {epic.description}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                      <span>Progress:</span>
                      <span className="font-medium">{epic.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                        style={{ width: `${epic.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      {epic.goalTargetDate && (
                        <div className="flex items-center mt-1">
                          <Calendar size={12} className="mr-1.5" />
                          Due: {epic.goalTargetDate}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mb-4 border-t border-slate-600 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-2 px-2">STATS</h3>
            <div className="space-y-2">
              {statusColumns.map(col => {
                const count = filteredTasks.filter(t => t.status === col.id).length;
                return (
                  <div 
                    key={col.id} 
                    className="flex justify-between items-center px-3 py-1.5 rounded-lg text-sm text-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`p-1 rounded-md ${col.color} bg-opacity-30 text-slate-100`}>
                        {React.cloneElement(col.icon as React.ReactElement, { size: 12 })}
                      </span>
                      <span>{col.title}</span>
                    </div>
                    <span className="bg-slate-600 px-2 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto styled-scrollbar pb-4">
          <div className="flex h-full p-4 space-x-4 min-w-max">
            {statusColumns.map(column => (
              <div 
                key={column.id}
                className="w-80 flex flex-col bg-slate-700 rounded-xl shadow-md border border-slate-600 h-[calc(100vh-220px)] min-h-[400px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className={`p-3 border-b border-slate-600 bg-gradient-to-r from-slate-700 to-slate-600`}>
                  <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                    <span className={`${column.color} p-1.5 rounded-md text-slate-100 mr-2.5`}>
                      {column.icon}
                    </span>
                    {column.title}
                    <span className="ml-3 bg-slate-600 text-slate-300 text-sm py-1 px-2.5 rounded-full">
                      {filteredTasks.filter(t => t.status === column.id).length}
                    </span>
                  </h3>
                </div>
                <div className="overflow-y-auto flex-grow p-3 space-y-3 styled-scrollbar">
                  {filteredTasks.filter(t => t.status === column.id).length > 0 ? (
                    filteredTasks
                      .filter(t => t.status === column.id)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className={`bg-slate-800 rounded-lg p-4 border border-slate-600 hover:border-${column.color.replace('bg-', '')} shadow-sm transition-all duration-200 cursor-pointer group`}
                          draggable={enableSimulations}
                          onDragStart={() => handleDragStart(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              task.type === 'intervention' ? 'bg-purple-900 text-purple-200' :
                              task.type === 'assessment' ? 'bg-green-900 text-green-200' :
                              'bg-amber-900 text-amber-200'
                            }`}>
                              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              task.priority === 'high' ? 'bg-red-900 text-red-200' :
                              task.priority === 'medium' ? 'bg-amber-900 text-amber-200' :
                              task.priority === 'urgent' ? 'bg-pink-900 text-pink-200' :
                              'bg-blue-900 text-blue-200'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-slate-100 mb-2 line-clamp-2">{task.title}</h4>
                          <p className="text-sm text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                          
                          {task.epicName && (
                            <div className="flex items-center mb-2 text-xs text-blue-300">
                              <Target size={12} className="mr-1.5" />
                              <span className="truncate">{task.epicName}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-sm text-slate-400">
                            {task.dueDate && <span className="text-xs">Due: {task.dueDate}</span>}
                            {task.assignee && <span className={`text-xs font-medium flex items-center ${
                              task.status === 'completed' ? 'text-green-300' : 'text-amber-300'
                            }`}>
                              <Users size={12} className="mr-1.5" /> {task.assignee}
                            </span>}
                          </div>

                          {enableSimulations && column.id !== 'completed' && (
                            <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {column.id === 'todo' && (
                                <>
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center"
                                  >
                                    <PlayCircle size={14} className="mr-1.5" /> Start
                                  </button>
                                  <button
                                    onClick={() => handleTaskAssign(task.id, 'Ron AI Assistant')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center"
                                  >
                                    <Users size={14} className="mr-1.5" /> Assign
                                  </button>
                                </>
                              )}
                              
                              {column.id === 'in-progress' && (
                                <button
                                  onClick={() => handleTaskStatusChange(task.id, 'review')}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center"
                                >
                                  <FileCheck size={14} className="mr-1.5" /> Done - Needs Review
                                </button>
                              )}
                              
                              {column.id === 'review' && (
                                <>
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center"
                                  >
                                    <CheckCircle size={14} className="mr-1.5" /> Approve & Complete
                                  </button>
                                  <button
                                    onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-sm flex items-center"
                                  >
                                    <X size={14} className="mr-1.5" /> Needs Revision
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-400 italic text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

// Missing components - adding stub implementation
const Search = ({ size, className }: { size: number, className: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size}

      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
};

export default KanbanBoard;