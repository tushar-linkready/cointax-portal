'use client';

import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { STATUS_CONFIG, ALL_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

interface TaskChartProps {
  tasks: Task[];
  className?: string;
}

export function TaskChart({ tasks, className }: TaskChartProps) {
  const statusCounts = ALL_STATUSES.reduce<Record<TaskStatus, number>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status).length;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <BarChart3 className="h-5 w-5 text-[#1e3a5f]" />
        <h3 className="text-sm font-semibold text-gray-900">Tasks by Status</h3>
      </div>
      <div className="space-y-3 px-5 py-4">
        {ALL_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const count = statusCounts[status];
          const widthPercent = (count / maxCount) * 100;

          return (
            <div key={status}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {config.label}
                </span>
                <span className="text-xs font-semibold text-gray-900">
                  {count}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    status === 'pending_approval' && 'bg-amber-500',
                    status === 'assigned' && 'bg-blue-500',
                    status === 'in_progress' && 'bg-indigo-500',
                    status === 'under_review' && 'bg-purple-500',
                    status === 'completed' && 'bg-green-500',
                    status === 'on_hold' && 'bg-gray-400'
                  )}
                  style={{ width: count > 0 ? `${widthPercent}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
