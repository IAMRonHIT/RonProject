'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle2, User, Tag, FileText, Activity, Target } from 'lucide-react';
import { KanbanTask } from './kanban-helpers';
import { cn } from '@/lib/utils';

interface TaskViewProps {
  task: KanbanTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ task, isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  console.log('TaskView rendered with:', { task, isOpen, isClosing });

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) {
    console.log('TaskView returning null because isOpen=false and isClosing=false');
    return null;
  }
  if (!task) {
    console.log('TaskView returning null because task is null/undefined');
    return null;
  }

  const priorityColors = {
    urgent: 'text-pink-500 bg-pink-50 border-pink-200',
    high: 'text-red-500 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200'
  };

  const statusIcons = {
    todo: <AlertCircle className="w-5 h-5" />,
    'in-progress': <Activity className="w-5 h-5" />,
    review: <Clock className="w-5 h-5" />,
    completed: <CheckCircle2 className="w-5 h-5" />
  };

  const statusColors = {
    todo: 'text-gray-600 bg-gray-50',
    'in-progress': 'text-blue-600 bg-blue-50',
    review: 'text-purple-600 bg-purple-50',
    completed: 'text-green-600 bg-green-50'
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300",
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div 
        className={cn(
          "relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
          isOpen && !isClosing ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full", statusColors[task.status])}>
                    {statusIcons[task.status]}
                    <span className="font-medium capitalize">{task.status}</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border", priorityColors[task.priority])}>
                    <Tag className="w-4 h-4" />
                    <span className="font-medium capitalize">{task.priority} Priority</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-8 space-y-8">
            {/* Description */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                {task.description || 'No description provided.'}
              </div>
            </section>

            {/* Task Details Grid */}
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Activity className="w-5 h-5 text-gray-600" />
                Task Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {task.assignee && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assigned to</p>
                        <p className="font-medium text-gray-900">{task.assignee}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {task.epicName && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Goal/Epic</p>
                        <p className="font-medium text-gray-900">{task.epicName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {task.type && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Task Type</p>
                        <p className="font-medium text-gray-900 capitalize">{task.type}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Task Details */}
            {task.details && (
              <section>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Additional Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {typeof task.details === 'object' ? JSON.stringify(task.details, null, 2) : task.details}
                  </pre>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

TaskView.displayName = 'TaskView';