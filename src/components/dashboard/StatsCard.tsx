'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  color = '#1e3a5f',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{title}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1">
          {trend === 'up' && (
            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
          )}
          {trend === 'down' && (
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              !trend && 'text-gray-500'
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
