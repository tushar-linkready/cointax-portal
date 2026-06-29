'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { cn, formatDate, isOverdue, getInitials } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Calendar, User, Tag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  className?: string;
}

export function TaskCard({ task, onClick, className }: TaskCardProps) {
  const overdue = task.status !== 'completed' && isOverdue(task.due_date);

  return (
    <div
      onClick={() => onClick?.(task)}
      className={cn(
        'rounded-xl border bg-white p-4 shadow-sm transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        overdue ? 'border-red-300' : 'border-gray-200',
        className
      )}
    >
      {/* Header: Title */}
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
        {task.title}
      </h3>

      {/* Client & Category */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {task.client && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.client.name}
          </span>
        )}
        {task.category && (
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {task.category.name}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Footer: Assignee & Due Date */}
      <div className="mt-3 flex items-center justify-between">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f] text-[10px] font-medium text-white">
              {getInitials(task.assignee.full_name)}
            </div>
            <span className="text-xs text-gray-600">{task.assignee.full_name}</span>
          </div>
        ) : (
          <span className="text-xs italic text-gray-400">Unassigned</span>
        )}

        {/* Due Date */}
        {task.due_date && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              overdue ? 'font-medium text-red-600' : 'text-gray-500'
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
