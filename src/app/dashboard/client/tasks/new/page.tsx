'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
  PlusCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getCategories, createTask } from '@/lib/services';
import type { TaskCategory } from '@/lib/types';

interface FileItem {
  name: string;
  size: number;
}

export default function ClientNewRequestPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!profile) { router.push('/login'); return; }
    if (profile.role !== 'client') { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        // Find client record by email
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('email', profile.email)
          .limit(1);
        if (clients?.[0]) setClientId(clients[0].id);

        // Load categories
        const cats = await getCategories(firmId);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };
    fetchData();
  }, [profile, loading, firmId, router]);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!firmId || !clientId) return;

    setSubmitting(true);
    try {
      await createTask({
        firm_id: firmId,
        client_id: clientId,
        category_id: categoryId || null,
        title: title.trim(),
        description: description.trim() || null,
        created_by: profile?.id || null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error creating task:', err);
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles: FileItem[] = Array.from(selectedFiles).map((f) => ({
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;
    const newFiles: FileItem[] = Array.from(droppedFiles).map((f) => ({
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setCategoryId('');
    setTitle('');
    setDescription('');
    setFiles([]);
    setErrors({});
    setSubmitted(false);
  };

  if (loading || !profile) {
    return null;
  }

  // Success screen
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Request Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your request has been submitted! The firm will review it shortly.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard/client/tasks">
                <Button variant="primary" size="md">
                  View My Tasks
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={resetForm}>
                <PlusCircle className="h-4 w-4" />
                Submit Another Request
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/client/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Raise New Request
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Submit a new service request to your firm
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <Select
                label="Category"
                placeholder="Select a category"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.category) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.category;
                      return next;
                    });
                  }
                }}
                error={errors.category}
              />

              {/* Title */}
              <Input
                label="Title"
                placeholder="e.g. ITR Filing for FY 2024-25"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }
                }}
                error={errors.title}
                required
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Please describe what you need help with. Include any relevant details such as financial year, deadlines, special requirements, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />

              {/* File Attachments */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[#0d9488] bg-teal-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <Upload
                    className={`mx-auto h-8 w-8 ${
                      isDragging ? 'text-[#0d9488]' : 'text-gray-400'
                    }`}
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer font-medium text-[#0d9488] hover:underline"
                    >
                      Upload files
                    </label>{' '}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, Excel, Images, or other documents
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                {/* Selected files list */}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
