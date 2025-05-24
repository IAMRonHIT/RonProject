"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  X, CheckCircle2, Users, Calendar, Tag, FileText, MessageSquare, 
  Paperclip, Link2, Activity, Edit3, Trash2, Clock, AlertTriangle, 
  Shield, Sparkles, ChevronRight, User, Flag, Target, History,
  CheckSquare, ListChecks, ArrowUpRight, FileCheck, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KanbanTask } from './kanban-helpers';

interface TaskDetailModalProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
}

const ScrollArea = dynamic(() => import('@/components/ui/scroll-area').then(mod => mod.ScrollArea), { ssr: false });

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  patientName,
  patientId,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'outcomes'>('details');
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !task) {
    return null;
  }

  const getPriorityConfig = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent': 
        return {
          color: 'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30',
          icon: '🚨',
          glow: 'shadow-rose-500/20'
        };
      case 'high': 
        return {
          color: 'from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30',
          icon: '⚡',
          glow: 'shadow-orange-500/20'
        };
      case 'medium': 
        return {
          color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
          icon: '⏱',
          glow: 'shadow-yellow-500/20'
        };
      case 'low': 
        return {
          color: 'from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
          icon: '💧',
          glow: 'shadow-sky-500/20'
        };
      default: 
        return {
          color: 'from-slate-600/20 to-slate-700/20 text-slate-300 border-slate-500/30',
          icon: '•',
          glow: 'shadow-slate-500/20'
        };
    }
  };

  const getStatusConfig = (status: KanbanTask['status']) => {
    switch (status) {
      case 'todo': 
        return {
          color: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
          icon: <ListChecks size={14} />,
          label: 'To Do'
        };
      case 'in-progress': 
        return {
          color: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30',
          icon: <Activity size={14} />,
          label: 'In Progress'
        };
      case 'review': 
        return {
          color: 'from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/30',
          icon: <FileCheck size={14} />,
          label: 'Under Review'
        };
      case 'completed': 
        return {
          color: 'from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 size={14} />,
          label: 'Completed'
        };
      default: 
        return {
          color: 'from-slate-600/20 to-slate-700/20 text-slate-300 border-slate-500/30',
          icon: <Clock size={14} />,
          label: status
        };
    }
  };
  
  const getTaskTypeConfig = (type: KanbanTask['type']) => {
    switch (type) {
      case 'intervention': 
        return {
          color: 'from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30',
          icon: <Brain size={14} />,
          label: 'Clinical Intervention'
        };
      case 'assessment': 
        return {
          color: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30',
          icon: <FileText size={14} />,
          label: 'Assessment'
        };
      case 'evaluation': 
        return {
          color: 'from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30',
          icon: <Target size={14} />,
          label: 'Evaluation'
        };
      default: 
        return {
          color: 'from-slate-600/20 to-slate-700/20 text-slate-300 border-slate-500/30',
          icon: <Tag size={14} />,
          label: type
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const typeConfig = getTaskTypeConfig(task.type);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4 animate-slide-up">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.color} shadow-lg ${priorityConfig.glow}`}>
                    {typeConfig.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-50 truncate flex-1">
                    {task.title}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User size={14} className="text-slate-500" />
                    <span>{patientName || 'Unknown Patient'}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Shield size={14} className="text-slate-500" />
                    <span>ID: {patientId || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </Button>
            </div>
            
            {/* Status badges */}
            <div className="flex items-center gap-3 mt-4">
              <Badge className={`bg-gradient-to-r ${statusConfig.color} backdrop-blur-sm px-3 py-1.5 flex items-center gap-1.5`}>
                {statusConfig.icon}
                <span className="font-medium">{statusConfig.label}</span>
              </Badge>
              
              <Badge className={`bg-gradient-to-r ${priorityConfig.color} backdrop-blur-sm px-3 py-1.5`}>
                <span className="mr-1">{priorityConfig.icon}</span>
                <span className="font-medium capitalize">{task.priority} Priority</span>
              </Badge>
              
              <Badge className={`bg-gradient-to-r ${typeConfig.color} backdrop-blur-sm px-3 py-1.5`}>
                {typeConfig.label}
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800/50">
            {[
              { id: 'details', label: 'Details', icon: <FileText size={16} /> },
              { id: 'activity', label: 'Activity', icon: <History size={16} /> },
              { id: 'outcomes', label: 'Outcomes', icon: <Target size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-sky-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 px-8 py-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                  <div className="absolute top-0 right-0 p-2 text-slate-600">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-sky-400" />
                    Task Description
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Rationale */}
                {task.details?.rationale && (
                  <div className="rounded-xl bg-gradient-to-br from-violet-900/10 to-purple-900/10 p-6 border border-violet-500/20">
                    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <Brain size={18} className="text-violet-400" />
                      Clinical Rationale
                    </h3>
                    <p className="text-slate-300 leading-relaxed italic">
                      {task.details.rationale}
                    </p>
                  </div>
                )}

                {/* Timeline & Assignment */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                      <Clock size={16} />
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <TimelineItem
                        label="Created"
                        value={new Date(task.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        icon={<Calendar size={14} />}
                      />
                      <TimelineItem
                        label="Due Date"
                        value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Not set'}
                        icon={<Flag size={14} />}
                        highlight={task.dueDate}
                      />
                      {task.status === 'completed' && (
                        <TimelineItem
                          label="Completed"
                          value="2 days ago"
                          icon={<CheckCircle2 size={14} />}
                          highlight
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                    <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                      <Users size={16} />
                      Assignment
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            {task.assignee || 'Unassigned'}
                          </p>
                          <p className="text-xs text-slate-500">Primary Assignee</p>
                        </div>
                      </div>
                      {task.epicName && (
                        <div className="pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">Care Plan Goal</p>
                          <p className="text-sm text-sky-400">{task.epicName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-tasks */}
                {task.details?.subTasks && task.details.subTasks.length > 0 && (
                  <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                      <CheckSquare size={18} className="text-emerald-400" />
                      Sub-tasks
                    </h3>
                    <div className="space-y-2">
                      {task.details.subTasks.map((subTask: any, index: number) => (
                        <label 
                          key={subTask.id || index}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors cursor-pointer"
                        >
                          <input 
                            type="checkbox" 
                            checked={subTask.completed} 
                            readOnly
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                          />
                          <span className={`text-slate-300 ${subTask.completed ? 'line-through opacity-60' : ''}`}>
                            {subTask.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links & Resources */}
                <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Link2 size={18} className="text-blue-400" />
                    Resources & Links
                  </h3>
                  <div className="space-y-3">
                    <ResourceLink
                      icon={<Paperclip size={16} />}
                      label="Clinical Guidelines"
                      value="Heart Failure Management Protocol v2.3"
                    />
                    <ResourceLink
                      icon={<Shield size={16} />}
                      label="Prior Authorization"
                      value="PA-2024-0523 (Approved)"
                    />
                    <ResourceLink
                      icon={<FileText size={16} />}
                      label="Related Documentation"
                      value="Discharge_Summary_05242024.pdf"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <History size={18} className="text-amber-400" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-4">
                    <ActivityEntry
                      user="RN Sarah Johnson"
                      action="updated task status to In Progress"
                      time="2 hours ago"
                      type="status"
                    />
                    <ActivityEntry
                      user="Dr. Michael Chen"
                      action="added clinical note: 'Patient showing positive response to intervention'"
                      time="Yesterday at 3:45 PM"
                      type="comment"
                    />
                    <ActivityEntry
                      user="Care Coordinator"
                      action="linked prior authorization PA-2024-0523"
                      time="May 23, 2024"
                      type="link"
                    />
                    <ActivityEntry
                      user="System"
                      action="created task from Care Plan Goal"
                      time="May 22, 2024"
                      type="system"
                    />
                  </div>
                </div>

                {/* Comment Section */}
                <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-sky-400" />
                    Add Comment
                  </h3>
                  <textarea
                    placeholder="Share updates or collaborate with the care team..."
                    className="w-full p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-4">
                    <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg">
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'outcomes' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Target size={18} className="text-emerald-400" />
                    Outcome Metrics
                  </h3>
                  {task.status === 'completed' ? (
                    <div className="space-y-4">
                      <OutcomeMetric
                        label="Task Completion Time"
                        value="48 hours"
                        benchmark="72 hours"
                        status="success"
                      />
                      <OutcomeMetric
                        label="Clinical Goal Achievement"
                        value="Met"
                        benchmark="Target: Improved mobility"
                        status="success"
                      />
                      <OutcomeMetric
                        label="Patient Satisfaction"
                        value="4.8/5.0"
                        benchmark="Target: >4.0"
                        status="success"
                      />
                      <div className="mt-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                        <p className="text-emerald-300 text-sm">
                          <strong>Outcome Summary:</strong> Task completed successfully with positive patient outcomes. 
                          All clinical goals were met within the expected timeframe.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                        <Clock className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-400">Outcomes will be available once the task is completed</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-slate-800/50 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Task
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-900/50 hover:bg-red-900/20 text-red-400"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
              
              <Button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

// Helper Components
const TimelineItem: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}> = ({ label, value, icon, highlight }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-sm font-medium ${highlight ? 'text-sky-400' : 'text-slate-300'}`}>
      {value}
    </span>
  </div>
);

const ResourceLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3">
      <span className="text-slate-500">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-300 group-hover:text-sky-400 transition-colors">
          {value}
        </p>
      </div>
    </div>
    <ArrowUpRight size={16} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
  </div>
);

const ActivityEntry: React.FC<{
  user: string;
  action: string;
  time: string;
  type: 'status' | 'comment' | 'link' | 'system';
}> = ({ user, action, time, type }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'status': return <Activity size={14} className="text-amber-400" />;
      case 'comment': return <MessageSquare size={14} className="text-sky-400" />;
      case 'link': return <Link2 size={14} className="text-violet-400" />;
      case 'system': return <Shield size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-800/20 transition-colors">
      <div className="flex-shrink-0 mt-1">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-slate-200">{user}</span>
          <span className="text-slate-400"> {action}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

const OutcomeMetric: React.FC<{
  label: string;
  value: string;
  benchmark: string;
  status: 'success' | 'warning' | 'error';
}> = ({ label, value, benchmark, status }) => {
  const statusColors = {
    success: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-900/20 border-amber-500/30',
    error: 'text-red-400 bg-red-900/20 border-red-500/30'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border ${statusColors[status]}">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 mt-1">{benchmark}</p>
      </div>
      <div className={`text-lg font-semibold ${statusColors[status].split(' ')[0]}`}>
        {value}
      </div>
    </div>
  );
};

export default TaskDetailModal;