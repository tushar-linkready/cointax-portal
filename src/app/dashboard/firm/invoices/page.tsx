'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, IndianRupee, AlertTriangle, Clock, CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getDemoUser } from '@/lib/auth';
import { getEnrichedInvoices, mockInvoices } from '@/lib/mock-data';
import { INVOICE_STATUS_CONFIG, ALL_INVOICE_STATUSES } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Profile, Invoice, InvoiceStatus } from '@/lib/types';

function getStatusBadgeVariant(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
    draft: 'default',
    sent: 'info',
    paid: 'success',
    overdue: 'danger',
    cancelled: 'default',
  };
  return map[status];
}

function generateInvoiceEmailBody(inv: Invoice): string {
  const itemsList = inv.items
    .map((item, i) => `${i + 1}. ${item.description} — Qty: ${item.quantity}, Rate: ${formatCurrency(item.rate)}, Amount: ${formatCurrency(item.amount)}`)
    .join('\n');

  return `Dear ${inv.client?.name ?? 'Client'},

Please find below the details for Invoice ${inv.invoice_number}:

${itemsList}

Subtotal: ${formatCurrency(inv.subtotal)}
GST @ ${inv.gst_rate}%: ${formatCurrency(inv.gst_amount)}
Total: ${formatCurrency(inv.total)}

Due Date: ${formatDate(inv.due_date)}
${inv.notes ? `\nNotes: ${inv.notes}` : ''}

Please make the payment by the due date. For any queries, feel free to reach out.

Regards,
Cointax Financial Services LLP`;
}

function generateWhatsAppMessage(inv: Invoice): string {
  const itemsList = inv.items
    .map((item, i) => `${i + 1}. ${item.description} — ${formatCurrency(item.amount)}`)
    .join('\n');

  return `Hi ${inv.client?.name ?? ''},

Here is your invoice from *Cointax Financial Services LLP*:

*Invoice:* ${inv.invoice_number}
*Due Date:* ${formatDate(inv.due_date)}

${itemsList}

*Total: ${formatCurrency(inv.total)}* (incl. GST @ ${inv.gst_rate}%)
${inv.notes ? `\n_${inv.notes}_` : ''}

Please make the payment by the due date. Thank you!`;
}

function openEmailForInvoice(inv: Invoice) {
  const subject = encodeURIComponent(`Invoice ${inv.invoice_number} — Cointax Financial Services LLP`);
  const body = encodeURIComponent(generateInvoiceEmailBody(inv));
  const to = inv.client?.email ?? '';
  window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
}

function openWhatsAppForInvoice(inv: Invoice) {
  const phone = (inv.client?.phone ?? '').replace(/[\s\-\+]/g, '');
  const message = encodeURIComponent(generateWhatsAppMessage(inv));
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

export default function FirmInvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    const firmInvoices = getEnrichedInvoices(currentUser.firm_id ?? undefined);
    setInvoices(firmInvoices);
  }, [router]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = inv.invoice_number.toLowerCase().includes(q);
        const matchesClient = inv.client?.name?.toLowerCase().includes(q) ?? false;
        const matchesCompany = inv.client?.company_name?.toLowerCase().includes(q) ?? false;
        if (!matchesNumber && !matchesClient && !matchesCompany) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Summary stats
  const totalOutstanding = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const overdueAmount = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return invoices
      .filter((i) => i.status === 'paid' && i.paid_date && new Date(i.paid_date) >= monthStart)
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...ALL_INVOICE_STATUSES.map((s) => ({
      value: s,
      label: INVOICE_STATUS_CONFIG[s].label,
    })),
  ];

  const handleInvoiceClick = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Invoices</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage client invoices and billing
            </p>
          </div>
          <Link href="/dashboard/firm/invoices/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                <p className="text-xl font-bold text-navy-900">{formatCurrency(totalOutstanding)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid This Month</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(paidThisMonth)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by invoice # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>

        {/* Invoice Table */}
        {filteredInvoices.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Invoice #</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Client</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Due Date</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleInvoiceClick(inv)}
                    >
                      <td className="px-6 py-4 font-medium text-navy-900">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{inv.client?.name ?? '-'}</p>
                          {inv.client?.company_name && (
                            <p className="text-xs text-gray-500">{inv.client.company_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusBadgeVariant(inv.status)}>
                          {INVOICE_STATUS_CONFIG[inv.status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoiceClick(inv);
                          }}
                          className="inline-flex items-center gap-1 text-[#1e3a5f] hover:text-[#162d4a] font-medium text-xs"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No invoices match your filters.</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Invoice Detail Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); }}
          title="Invoice Details"
          size="lg"
        >
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-navy-900">{selectedInvoice.invoice_number}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedInvoice.client?.name}
                    {selectedInvoice.client?.company_name && (
                      <span> - {selectedInvoice.client.company_name}</span>
                    )}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                  {INVOICE_STATUS_CONFIG[selectedInvoice.status].label}
                </Badge>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedInvoice.due_date)}</p>
                </div>
                {selectedInvoice.paid_date && (
                  <div>
                    <p className="text-gray-500">Paid Date</p>
                    <p className="font-medium text-green-600">{formatDate(selectedInvoice.paid_date)}</p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Line Items</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Description</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">Qty</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">Rate</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                          <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST @ {selectedInvoice.gst_rate}%</span>
                  <span className="font-medium text-gray-900">{formatCurrency(selectedInvoice.gst_amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span className="text-navy-900">Total</span>
                  <span className="text-navy-900">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}

{/* Send buttons */}
              {selectedInvoice.status !== 'cancelled' && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Send Invoice</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedInvoice.client?.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEmailForInvoice(selectedInvoice)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Send Email
                      </Button>
                    )}
                    {selectedInvoice.client?.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWhatsAppForInvoice(selectedInvoice)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Send WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              )}

                            {/* Status update buttons */}
              <div className="flex gap-2 flex-wrap pt-2">
                {selectedInvoice.status === 'draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, status: 'sent' as const } : i));
                      setSelectedInvoice(prev => prev ? { ...prev, status: 'sent' as const } : null);
                    }}
                  >
                    Mark as Sent
                  </Button>
                )}
                {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, status: 'paid' as const, paid_date: today } : i));
                      setSelectedInvoice(prev => prev ? { ...prev, status: 'paid' as const, paid_date: today } : null);
                    }}
                  >
                    Mark as Paid
                  </Button>
                )}
                {selectedInvoice.status !== 'cancelled' && selectedInvoice.status !== 'paid' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, status: 'cancelled' as const } : i));
                      setSelectedInvoice(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
                    }}
                  >
                    Cancel Invoice
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
