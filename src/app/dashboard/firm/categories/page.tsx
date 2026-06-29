'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { getDemoUser } from '@/lib/auth';
import { mockCategories } from '@/lib/mock-data';
import type { TaskCategory, Profile } from '@/lib/types';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setCategories([...mockCategories]);
  }, [router]);

  const presetCategories = categories.filter((c) => c.is_preset && !c.firm_id);
  const customCategories = categories.filter(
    (c) => !c.is_preset && c.firm_id === user?.firm_id
  );

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newCategory: TaskCategory = {
      id: `cat-${Date.now()}`,
      firm_id: user?.firm_id ?? null,
      name: formName.trim(),
      description: formDescription.trim() || null,
      is_preset: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCategory]);
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !formName.trim()) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formName.trim(),
              description: formDescription.trim() || null,
            }
          : c
      )
    );
    resetForm();
    setEditingCategory(null);
  };

  const openEditModal = (category: TaskCategory) => {
    setFormName(category.name);
    setFormDescription(category.description ?? '');
    setEditingCategory(category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setDeleteConfirm(null);
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, is_active: !c.is_active } : c
      )
    );
  };

  if (!user) return null;

  const categoryForm = (
    <>
      <Input
        label="Name"
        placeholder="e.g. Payroll Processing"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
      />
      <Textarea
        label="Description"
        placeholder="Brief description of the category"
        value={formDescription}
        onChange={(e) => setFormDescription(e.target.value)}
        rows={3}
      />
    </>
  );

  const renderCategoryItem = (category: TaskCategory, isCustom: boolean) => (
    <div
      key={category.id}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Tag className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {category.name}
            </span>
            <Badge variant={category.is_preset ? 'info' : 'secondary'}>
              {category.is_preset ? 'Preset' : 'Custom'}
            </Badge>
          </div>
          {category.description && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={() => handleToggleActive(category.id)}
          className="focus:outline-none"
          title="Click to toggle status"
        >
          <Badge variant={category.is_active ? 'success' : 'danger'}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </button>
        {isCustom && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(category)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(category.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Task Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage preset and custom task categories for your firm
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Preset Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-900">
                Preset Categories
              </h3>
              <span className="text-sm text-gray-500">
                {presetCategories.length} categories
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {presetCategories.map((cat) => renderCategoryItem(cat, false))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-900">
                Custom Categories
              </h3>
              <span className="text-sm text-gray-500">
                {customCategories.length} categories
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {customCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Tag className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="font-medium text-gray-500">
                    No custom categories yet
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Create custom categories specific to your firm
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {customCategories.map((cat) => renderCategoryItem(cat, true))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { resetForm(); setIsAddModalOpen(false); }}
        title="Add Custom Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          {categoryForm}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setIsAddModalOpen(false); }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => { resetForm(); setEditingCategory(null); }}
        title="Edit Category"
      >
        <form onSubmit={handleEditCategory} className="space-y-4">
          {categoryForm}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setEditingCategory(null); }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this category? This action cannot be
            undone. Tasks assigned to this category will not be affected.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDeleteCategory(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
