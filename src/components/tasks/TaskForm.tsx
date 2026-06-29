'use client';

import React, { useState, FormEvent } from 'react';
import { Task, TaskPriority, Client, TaskCategory, Profile } from '@/lib/types';
import { ALL_PRIORITIES, PRIORITY_CONFIG } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface TaskFormProps {
  clients: Client[];
  categories: TaskCategory[];
  teamMembers: Profile[];
  initialData?: Partial<Task>;
  onSubmit: (data: TaskFormData) => void;
  className?: string;
}

export interface TaskFormData {
  client_id: string;
  category_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee_id: string;
  due_date: string;
}

export function TaskForm({
  clients,
  categories,
  teamMembers,
  initialData,
  onSubmit,
  className,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    client_id: initialData?.client_id ?? '',
    category_id: initialData?.category_id ?? '',
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    priority: initialData?.priority ?? 'medium',
    assignee_id: initialData?.assignee_id ?? '',
    due_date: initialData?.due_date ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<keyof TaskFormData, string>> = {};
    if (!formData.title.trim()) next.title = 'Title is required';
    if (!formData.client_id) next.client_id = 'Client is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    field: keyof TaskFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-5">
        {/* Client */}
        <Select
          label="Client *"
          placeholder="Select a client"
          value={formData.client_id}
          onChange={(e) => handleChange('client_id', e.target.value)}
          error={errors.client_id}
          options={clients.map((c) => ({
            value: c.id,
            label: c.company_name ? `${c.name} (${c.company_name})` : c.name,
          }))}
        />

        {/* Category */}
        <Select
          label="Category"
          placeholder="Select a category"
          value={formData.category_id}
          onChange={(e) => handleChange('category_id', e.target.value)}
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />

        {/* Title */}
        <Input
          label="Title *"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the task details..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
        />

        {/* Priority */}
        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={ALL_PRIORITIES.map((p) => ({
            value: p,
            label: PRIORITY_CONFIG[p].label,
          }))}
        />

        {/* Assignee */}
        <Select
          label="Assignee"
          placeholder="Select a team member"
          value={formData.assignee_id}
          onChange={(e) => handleChange('assignee_id', e.target.value)}
          options={teamMembers.map((m) => ({
            value: m.id,
            label: m.full_name,
          }))}
        />

        {/* Due Date */}
        <Input
          label="Due Date"
          type="date"
          value={formData.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
        />

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="primary">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </form>
  );
}
