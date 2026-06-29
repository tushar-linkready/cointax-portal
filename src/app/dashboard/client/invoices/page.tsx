'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getDemoUser } from '@/lib/auth';
import { getClientInvoices, mockClients } from '@/lib/mock-data';
import { INVOICE_STATUS_CONFIG } from '@/lib/constants';
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

export default function ClientInvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Find client record linked to this user
    const clientRecord = mockClients.find(
      (c) => c.email === currentUser.email || c.name === currentUser.full_name
    );
    if (clientRecord) {
      const clientInvoices = getClientInvoices(clientRecord.id);
      // Clients should not see draft invoices
      setInvoices(clientInvoices.filter((i) => i.status !== 'draft'));
    }
  }, [router]);

  const totalOutstanding = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);
  }, [invoices]);

  const handleInvoiceClick = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            View invoices from your CA firm
          </p>
        </div>

        {/* Outstanding summary */}
        {totalOutstanding > 0 && (
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding Amount</p>
                <p className="text-xl font-bold text-navy-900">{formatCurrency(totalOutstanding)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice List */}
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} onClick={() => handleInvoiceClick(inv)}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-navy-900">{inv.invoice_number}</p>
                        <Badge variant={getStatusBadgeVariant(inv.status)}>
                          {INVOICE_STATUS_CONFIG[inv.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {formatDate(inv.due_date)}
                        {inv.paid_date && (
                          <span className="text-green-600"> | Paid: {formatDate(inv.paid_date)}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {inv.items.length} item{inv.items.length !== 1 ? 's' : ''}
                        {' - '}
                        {inv.items.map((i) => i.description).join(', ')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-navy-900">{formatCurrency(inv.total)}</p>
                      <p className="text-xs text-gray-400">incl. GST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No invoices yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Your invoices will appear here once your firm generates them.
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
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-navy-900">{selectedInvoice.invoice_number}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {formatDate(selectedInvoice.due_date)}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                  {INVOICE_STATUS_CONFIG[selectedInvoice.status].label}
                </Badge>
              </div>

              {/* Line Items Table */}
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

              {/* Paid date */}
              {selectedInvoice.paid_date && (
                <div className="text-sm text-green-600 font-medium">
                  Paid on {formatDate(selectedInvoice.paid_date)}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
