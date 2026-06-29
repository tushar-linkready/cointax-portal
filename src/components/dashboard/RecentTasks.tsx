'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { formatDate, isOverdue, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { Calendar, ClipboardList } from 'lucide-react';

interface RecentTasksProps {
  tasks: Task[];
  className?: string;
}

export function RecentTasks({ tasks, className }: RecentTasksProps) {
  const recentTasks = tasks.slice(0, 5);

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <ClipboardList className="h-5 w-5 text-[#1e3a5f]" />
        <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {recentTasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No tasks yet
          </div>
        ) : (
          recentTasks.map((task) => {
            const overdue =
              task.status !== 'completed' && isOverdue(task.due_date);

            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {task.title}
                  </p>
                  {task.client && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {task.client.name}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={task.status} />
                  {task.due_date && (
                    <span
                      className={cn(
                        'flex items-center gap-1 text-xs whitespace-nowrap',
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
          })
        )}
      </div>
    </div>
  );
}
