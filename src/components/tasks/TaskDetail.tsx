'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, TaskComment } from '@/lib/types';
import { STATUS_CONFIG, ALL_STATUSES } from '@/lib/constants';
import {
  cn,
  formatDate,
  timeAgo,
  getInitials,
  formatFileSize,
  isOverdue,
} from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Paperclip,
  FileText,
  MessageSquare,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TaskDetailProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  className?: string;
}

export function TaskDetail({ task, onStatusChange, className }: TaskDetailProps) {
  const [comments, setComments] = useState<TaskComment[]>(task.comments ?? []);
  const [newComment, setNewComment] = useState('');
  const overdue = task.status !== 'completed' && isOverdue(task.due_date);

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const comment: TaskComment = {
      id: `comment-local-${Date.now()}`,
      task_id: task.id,
      user_id: 'current-user',
      content: trimmed,
      created_at: new Date().toISOString(),
      user: {
        id: 'current-user',
        firm_id: null,
        full_name: 'You',
        email: '',
        role: 'firm_admin',
        avatar_url: null,
        phone: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    setComments((prev) => [...prev, comment]);
    setNewComment('');
  };

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>

        {/* Status change */}
        {onStatusChange && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Change Status
            </label>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="block w-full max-w-xs appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Description
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {task.description}
            </p>
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Client */}
          {task.client && (
            <div>
              <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <User className="h-3 w-3" />
                Client
              </h4>
              <p className="mt-1 text-sm font-medium text-gray-900">{task.client.name}</p>
              {task.client.company_name && (
                <p className="text-xs text-gray-500">{task.client.company_name}</p>
              )}
            </div>
          )}

          {/* Category */}
          {task.category && (
            <div>
              <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <Tag className="h-3 w-3" />
                Category
              </h4>
              <p className="mt-1 text-sm font-medium text-gray-900">{task.category.name}</p>
            </div>
          )}

          {/* Assignee */}
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <User className="h-3 w-3" />
              Assignee
            </h4>
            {task.assignee ? (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e3a5f] text-[11px] font-medium text-white">
                  {getInitials(task.assignee.full_name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.assignee.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{task.assignee.email}</p>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm italic text-gray-400">Unassigned</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Calendar className="h-3 w-3" />
              Due Date
            </h4>
            {task.due_date ? (
              <p
                className={cn(
                  'mt-1 text-sm font-medium',
                  overdue ? 'text-red-600' : 'text-gray-900'
                )}
              >
                {formatDate(task.due_date)}
                {overdue && ' (Overdue)'}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">No due date</p>
            )}
          </div>

          {/* Created */}
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Clock className="h-3 w-3" />
              Created
            </h4>
            <p className="mt-1 text-sm text-gray-700">{formatDate(task.created_at)}</p>
          </div>
        </div>

        {/* ── Attachments ─────────────────────────────────── */}
        {task.attachments && task.attachments.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Paperclip className="h-3 w-3" />
              Attachments ({task.attachments.length})
            </h4>
            <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
              {task.attachments.map((att) => (
                <li key={att.id} className="flex items-center gap-3 px-4 py-3">
                  <FileText className="h-5 w-5 flex-shrink-0 text-[#1e3a5f]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {att.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {att.file_size !== null ? formatFileSize(att.file_size) : 'Unknown size'}
                      {att.uploader && ` · Uploaded by ${att.uploader.full_name}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Comments ────────────────────────────────────── */}
        <div>
          <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <MessageSquare className="h-3 w-3" />
            Comments ({comments.length})
          </h4>

          {comments.length > 0 ? (
            <ul className="mt-3 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-[11px] font-medium text-white">
                    {comment.user
                      ? getInitials(comment.user.full_name)
                      : '??'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.user?.full_name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No comments yet.</p>
          )}

          {/* New comment */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Add a comment..."
              className="block flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
