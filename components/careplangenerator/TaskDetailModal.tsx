"use client";

import React from 'react';
import {
  X, CheckSquare, Users, Calendar, Tag, Info, MessageSquare, Paperclip, LinkIcon, BarChart, Edit, Trash2, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { KanbanTask } from './kanban-helpers'; // Assuming types are exported

interface TaskDetailModalProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  patientName,
  patientId,
}) => {
  if (!isOpen || !task) {
    return null;
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'urgent': return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'low': return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      default: return 'bg-slate-600 text-slate-300 border-slate-500';
    }
  };

  const getStatusColor = (status: KanbanTask['status']) => {
    switch (status) {
      case 'todo': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'in-progress': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'review': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-slate-600 text-slate-300 border-slate-500';
    }
  };
  
  const taskTypeColor = (type: KanbanTask['type']) => {
    switch (type) {
      case 'intervention': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'assessment': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'evaluation': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      default: return 'bg-slate-600 text-slate-300 border-slate-500';
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-700/50">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-slate-100 truncate" title={task.title}>{task.title}</h2>
            <p className="text-sm text-slate-400">
              Patient: {patientName || 'N/A'} (ID: {patientId || 'N/A'})
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-100 hover:bg-slate-700">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-grow styled-scrollbar">
          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoPill icon={<Clock size={16} />} label="Status" value={task.status} badgeClassName={getStatusColor(task.status)} />
              <InfoPill icon={<AlertTriangle size={16} />} label="Priority" value={task.priority} badgeClassName={getPriorityColor(task.priority)} />
              <InfoPill icon={<Tag size={16} />} label="Type" value={task.type} badgeClassName={taskTypeColor(task.type)} />
            </div>
            
            <Separator className="bg-slate-700" />

            {/* Core Details */}
            <Section title="Core Details" icon={<Info size={18} />}>
              <p className="text-slate-300 leading-relaxed">{task.description}</p>
              {task.details?.rationale && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <h4 className="font-semibold text-slate-200 mb-1">Rationale (from ADPIE):</h4>
                  <p className="text-sm text-slate-400 italic">{task.details.rationale}</p>
                </div>
              )}
              {task.epicName && (
                 <div className="mt-3 pt-3 border-t border-slate-700">
                    <h4 className="font-semibold text-slate-200 mb-1">Associated Care Plan Goal:</h4>
                    <p className="text-sm text-slate-400">{task.epicName}</p>
                 </div>
              )}
            </Section>

            {/* Assignment and Dates */}
            <Section title="Assignment & Timeline" icon={<Calendar size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Assigned To" value={task.assignee || 'Unassigned'} icon={<Users size={14} />} />
                <DetailItem label="Created At" value={new Date(task.createdAt).toLocaleDateString()} icon={<Clock size={14} />} />
                <DetailItem label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'} icon={<Calendar size={14} />} />
                {/* Placeholder for completion date */}
                <DetailItem label="Completed At" value={'N/A'} icon={<CheckSquare size={14} />} />
              </div>
            </Section>
            
            {/* Sub-Tasks / Checklist (Placeholder) */}
            {task.details?.subTasks && task.details.subTasks.length > 0 && (
              <Section title="Sub-Tasks / Checklist" icon={<CheckSquare size={18} />}>
                <ul className="space-y-2">
                  {task.details.subTasks.map((subTask: {id: string, text: string, completed: boolean}, index: number) => (
                    <li key={subTask.id || index} className="flex items-center text-slate-300">
                      <input type="checkbox" checked={subTask.completed} readOnly className="mr-2 h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500/50 bg-slate-700 cursor-not-allowed" />
                      <span>{subTask.text}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Supporting Information (Placeholders) */}
            <Section title="Supporting Information" icon={<Paperclip size={18} />}>
              <div className="space-y-2 text-sm">
                <DetailItem label="Linked Documents" value="Consent_Form_XYZ.pdf (Placeholder)" icon={<Paperclip size={14} />} isLink />
                <DetailItem label="SDOH Factors" value="Patient lacks transportation (Placeholder)" icon={<Users size={14} />} />
                <DetailItem label="Compliance Notes" value="Ensure form XYZ is signed (Placeholder)" icon={<ShieldCheck size={14} />} />
                <DetailItem label="FHIR Resource" value="ServiceRequest/123 (Placeholder)" icon={<LinkIcon size={14} />} isLink />
              </div>
            </Section>

            {/* Activity Log (Placeholder) */}
            <Section title="Activity Log & Collaboration" icon={<MessageSquare size={18} />}>
              <div className="space-y-3 text-sm max-h-40 overflow-y-auto styled-scrollbar-mini pr-2">
                <ActivityItem user="RN Jane" action="Marked as In Progress" time="2 hours ago" />
                <ActivityItem user="Dr. Smith" action="Added comment: 'Please prioritize this.'" time="May 14, 2025, 10:30 AM" />
                <ActivityItem user="System" action="Task created from Care Plan Goal 'Improve Glycemic Control'" time="May 14, 2025, 09:00 AM" />
              </div>
              <div className="mt-4">
                <textarea
                  placeholder="Add a comment... (Feature not implemented)"
                  className="w-full p-2 rounded-md bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                  disabled
                />
                <Button variant="outline" size="sm" className="mt-2 text-blue-300 border-blue-500/70 hover:bg-blue-500/10 hover:text-blue-200" disabled>
                  Add Comment
                </Button>
              </div>
            </Section>

            {/* Outcomes & Evaluation (Placeholder) */}
            <Section title="Outcomes & Evaluation" icon={<BarChart size={18} />}>
              <p className="text-slate-400 italic">
                {task.status === 'completed' ? 'Task completed. Outcome: Patient demonstrated correct insulin injection technique. (Placeholder)' : 'Evaluation pending task completion. (Placeholder)'}
              </p>
            </Section>
          </div>
        </ScrollArea>

        {/* Footer Actions (Placeholder) */}
        <div className="p-5 border-t border-slate-700 bg-slate-700/50 flex justify-end space-x-3">
          <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100" disabled>
            <Edit size={16} className="mr-2" /> Edit Task
          </Button>
          <Button variant="destructive_outline" className="text-red-400 border-red-500/70 hover:bg-red-500/10 hover:text-red-300" disabled>
            <Trash2 size={16} className="mr-2" /> Delete Task
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); /* slate-800 with opacity */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #475569; /* slate-600 */ border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; /* slate-500 */ }

        .styled-scrollbar-mini::-webkit-scrollbar { width: 6px; height: 6px; }
        .styled-scrollbar-mini::-webkit-scrollbar-track { background: rgba(51, 65, 85, 0.3); /* slate-700 with opacity */ border-radius: 10px; }
        .styled-scrollbar-mini::-webkit-scrollbar-thumb { background: #334155; /* slate-700 */ border-radius: 10px; }
        .styled-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: #4b5563; /* slate-600 */ }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div>
    <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center">
      {React.cloneElement(icon as React.ReactElement, { className: "mr-2 text-blue-400" })}
      {title}
    </h3>
    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/70">
      {children}
    </div>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string; icon: React.ReactNode; isLink?: boolean }> = ({ label, value, icon, isLink }) => (
  <div className="flex items-start">
    {React.cloneElement(icon as React.ReactElement, { className: "mr-2 mt-1 text-slate-500 flex-shrink-0" })}
    <div>
      <span className="text-slate-400 block">{label}:</span>
      {isLink ? (
        <a href="#" className="text-blue-400 hover:underline break-all">{value}</a>
      ) : (
        <span className="text-slate-200 break-all">{value}</span>
      )}
    </div>
  </div>
);

const ActivityItem: React.FC<{ user: string; action: string; time: string }> = ({ user, action, time }) => (
  <div className="border-b border-slate-700 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
    <p className="text-slate-300">
      <span className="font-semibold text-slate-100">{user}</span> {action}
    </p>
    <p className="text-xs text-slate-500">{time}</p>
  </div>
);

const InfoPill: React.FC<{icon: React.ReactNode, label: string, value: string, badgeClassName?: string}> = ({icon, label, value, badgeClassName}) => (
  <div className="bg-slate-700/60 p-3 rounded-lg border border-slate-600/80">
    <div className="text-xs text-slate-400 mb-1 flex items-center">
      {icon}
      <span className="ml-1.5">{label}</span>
    </div>
    <Badge variant="outline" className={`text-sm font-semibold capitalize px-2.5 py-1 ${badgeClassName || 'bg-slate-600 text-slate-300 border-slate-500'}`}>
      {value}
    </Badge>
  </div>
);


export default TaskDetailModal;