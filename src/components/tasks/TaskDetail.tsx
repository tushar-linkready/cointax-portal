'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskComment, Profile, TaskCategory } from '@/lib/types';
import { STATUS_CONFIG, ALL_STATUSES, ALL_PRIORITIES } from '@/lib/constants';
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
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { addTaskComment, updateTask } from '@/lib/services';

interface TaskDetailProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskUpdated?: (updatedTask: Task) => void;
  teamMembers?: Profile[];
  categories?: TaskCategory[];
  className?: string;
}

export function TaskDetail({ task, onStatusChange, onTaskUpdated, teamMembers = [], categories = [], className }: TaskDetailProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState<TaskComment[]>(task.comments ?? []);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const overdue = task.status !== 'completed' && isOverdue(task.due_date);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description ?? '',
    due_date: task.due_date ?? '',
    priority: task.priority as string,
    assignee_id: task.assignee_id ?? '',
    category_id: task.category_id ?? '',
  });

  const handleStartEdit = () => {
    setEditData({
      title: task.title,
      description: task.description ?? '',
      due_date: task.due_date ?? '',
      priority: task.priority,
      assignee_id: task.assignee_id ?? '',
      category_id: task.category_id ?? '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim()) {
      showToast('Task title is required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, {
        title: editData.title.trim(),
        description: editData.description.trim() || null,
        due_date: editData.due_date || null,
        priority: editData.priority as TaskPriority,
        assignee_id: editData.assignee_id || null,
        category_id: editData.category_id || null,
      });
      // Build updated task with joined data for local state
      const updatedTask: Task = {
        ...task,
        title: editData.title.trim(),
        description: editData.description.trim() || null,
        due_date: editData.due_date || null,
        priority: editData.priority as TaskPriority,
        assignee_id: editData.assignee_id || null,
        category_id: editData.category_id || null,
        assignee: teamMembers.find(m => m.id === editData.assignee_id) || undefined,
        category: categories.find(c => c.id === editData.category_id) || undefined,
      };
      setIsEditing(false);
      showToast('Task updated successfully.', 'success');
      onTaskUpdated?.(updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
      showToast('Failed to update task. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !profile) return;

    setSubmittingComment(true);
    try {
      const saved = await addTaskComment({
        task_id: task.id,
        user_id: profile.id,
        content: trimmed,
      });
      setComments((prev) => [...prev, saved]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      showToast('Failed to post comment. Please try again.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          {isEditing ? (
            <Input
              value={editData.title}
              onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))}
              className="text-lg font-semibold"
              placeholder="Task title"
            />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
          )}
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={task.status} />
          {isEditing ? (
            <Select
              options={ALL_PRIORITIES.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
              value={editData.priority}
              onChange={(e) => setEditData(d => ({ ...d, priority: e.target.value }))}
              className="w-32"
            />
          ) : (
            <PriorityBadge priority={task.priority} />
          )}
          {!isEditing && overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>

        {/* Edit mode save/cancel buttons */}
        {isEditing && (
          <div className="mt-4 flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleSaveEdit} loading={saving}>
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saving}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {/* Status change */}
        {!isEditing && onStatusChange && (
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
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Description
          </h4>
          {isEditing ? (
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(d => ({ ...d, description: e.target.value }))}
              placeholder="Describe the task details..."
              rows={3}
              className="mt-1"
            />
          ) : task.description ? (
            <p className="mt-1 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {task.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-400">No description</p>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Client (not editable — changing client is destructive) */}
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
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Tag className="h-3 w-3" />
              Category
            </h4>
            {isEditing ? (
              <Select
                options={[
                  { value: '', label: 'No category' },
                  ...categories.map(c => ({ value: c.id, label: c.name })),
                ]}
                value={editData.category_id}
                onChange={(e) => setEditData(d => ({ ...d, category_id: e.target.value }))}
                className="mt-1"
              />
            ) : task.category ? (
              <p className="mt-1 text-sm font-medium text-gray-900">{task.category.name}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">Uncategorized</p>
            )}
          </div>

          {/* Assignee */}
          <div>
            <h4 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <User className="h-3 w-3" />
              Assignee
            </h4>
            {isEditing ? (
              <Select
                options={[
                  { value: '', label: 'Unassigned' },
                  ...teamMembers.map(m => ({ value: m.id, label: m.full_name })),
                ]}
                value={editData.assignee_id}
                onChange={(e) => setEditData(d => ({ ...d, assignee_id: e.target.value }))}
                className="mt-1"
              />
            ) : task.assignee ? (
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
            {isEditing ? (
              <Input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData(d => ({ ...d, due_date: e.target.value }))}
                className="mt-1"
              />
            ) : task.due_date ? (
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
                    {att.file_url ? (
                      <a
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm font-medium text-[#0d9488] hover:underline block"
                      >
                        {att.file_name}
                      </a>
                    ) : (
                      <p className="truncate text-sm font-medium text-gray-900">
                        {att.file_name}
                      </p>
                    )}
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
              disabled={!newComment.trim() || submittingComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
