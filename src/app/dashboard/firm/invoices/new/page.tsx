'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getDemoUser } from '@/lib/auth';
import { mockClients, mockInvoices } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import type { Profile, InvoiceItem } from '@/lib/types';

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const existingCount = mockInvoices.filter((i) =>
    i.invoice_number.startsWith(`CTX-${year}`)
  ).length;
  const nextNum = String(existingCount + 1).padStart(3, '0');
  return `CTX-${year}-${nextNum}`;
}

const EMPTY_ITEM: InvoiceItem = {
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [gstRate, setGstRate] = useState(18);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setInvoiceNumber(generateInvoiceNumber());

    // Default due date: 15 days from now
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 15);
    setDueDate(defaultDue.toISOString().split('T')[0]);
  }, [router]);

  if (!user) return null;

  const firmClients = mockClients.filter((c) => c.firm_id === user.firm_id);
  const clientOptions = [
    { value: '', label: 'Select a client' },
    ...firmClients.map((c) => ({
      value: c.id,
      label: c.company_name ? `${c.name} - ${c.company_name}` : c.name,
    })),
  ];

  // Auto-calculate amounts
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'description') {
        item.description = value as string;
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0;
        item.amount = item.quantity * item.rate;
      } else if (field === 'rate') {
        item.rate = Number(value) || 0;
        item.amount = item.quantity * item.rate;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + gstAmount;

  const handleSave = (sendAfterSave: boolean) => {
    if (!clientId) {
      alert('Please select a client.');
      return;
    }
    if (items.every((i) => !i.description.trim() || i.amount === 0)) {
      alert('Please add at least one line item with a description and amount.');
      return;
    }

    setIsSaving(true);

    // Simulate save (demo mode)
    setTimeout(() => {
      setIsSaving(false);
      router.push('/dashboard/firm/invoices');
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Create Invoice</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate a new invoice for a client
            </p>
          </div>
        </div>

        {/* Invoice Form */}
        <Card>
          <CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
              <Select
                label="Client"
                options={clientOptions}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent>
            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
                <Button variant="ghost" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Header Row */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start p-3 rounded-lg border border-gray-200 bg-gray-50/50 sm:p-0 sm:border-0 sm:bg-transparent"
                >
                  <div className="sm:col-span-5">
                    <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Description</label>
                    <Input
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Qty</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block">Rate</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      placeholder="0"
                      className="text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end">
                    <label className="sm:hidden text-xs font-medium text-gray-500 mb-1 block mr-auto">Amount</label>
                    <span className="text-sm font-semibold text-gray-900 py-2">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center gap-8 text-sm w-full sm:w-auto sm:min-w-[300px]">
                  <span className="text-gray-500 flex-1">Subtotal</span>
                  <span className="font-medium text-gray-900 text-right min-w-[100px]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm w-full sm:w-auto sm:min-w-[300px]">
                  <span className="text-gray-500 flex-1">GST @</span>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="0"
                      max="28"
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value) || 0)}
                      className="text-right text-sm py-1"
                    />
                  </div>
                  <span className="text-gray-500">%</span>
                  <span className="font-medium text-gray-900 text-right min-w-[100px]">
                    {formatCurrency(gstAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-8 text-base font-bold border-t border-gray-200 pt-2 w-full sm:w-auto sm:min-w-[300px]">
                  <span className="text-navy-900 flex-1">Total</span>
                  <span className="text-navy-900 text-right min-w-[100px]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <Textarea
                label="Notes (Optional)"
                placeholder="Payment terms, bank details, or any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            loading={isSaving}
            onClick={() => handleSave(false)}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            loading={isSaving}
            onClick={() => handleSave(true)}
          >
            Save &amp; Send
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
