'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { useAuth } from '@/lib/auth';
import { getClients, createClient, updateClient } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import type { Client, Profile } from '@/lib/types';
import { Plus, Search, Pencil, Users } from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Add form state
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPan, setFormPan] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formAddress, setFormAddress] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await getClients(firmId!);
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile, loading, firmId, router]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.pan_number && c.pan_number.toLowerCase().includes(q)) ||
        (c.gst_number && c.gst_number.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  const resetForm = () => {
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormPan('');
    setFormGst('');
    setFormAddress('');
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const newClient = await createClient({
        firm_id: firmId!,
        name: formName.trim(),
        company_name: formCompany.trim() || null,
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        pan_number: formPan.trim() || null,
        gst_number: formGst.trim() || null,
        address: formAddress.trim() || null,
      });
      setClients((prev) => [newClient, ...prev]);
      resetForm();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create client:', err);
      alert('Failed to create client. Please try again.');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !formName.trim()) return;

    try {
      const updated = await updateClient(editingClient.id, {
        name: formName.trim(),
        company_name: formCompany.trim() || null,
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        pan_number: formPan.trim() || null,
        gst_number: formGst.trim() || null,
        address: formAddress.trim() || null,
      });
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? updated : c))
      );
      resetForm();
      setEditingClient(null);
    } catch (err) {
      console.error('Failed to update client:', err);
      alert('Failed to update client. Please try again.');
    }
  };

  const openEditModal = (client: Client) => {
    setFormName(client.name);
    setFormCompany(client.company_name ?? '');
    setFormEmail(client.email ?? '');
    setFormPhone(client.phone ?? '');
    setFormPan(client.pan_number ?? '');
    setFormGst(client.gst_number ?? '');
    setFormAddress(client.address ?? '');
    setEditingClient(client);
  };

  const handleToggleStatus = async (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    try {
      const updated = await updateClient(clientId, {
        is_active: !client.is_active,
      });
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? updated : c))
      );
    } catch (err) {
      console.error('Failed to toggle client status:', err);
      alert('Failed to update client status. Please try again.');
    }
  };

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  const clientForm = (
    <>
      <Input
        label="Name"
        placeholder="e.g. Vikram Singh"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
      />
      <Input
        label="Company Name"
        placeholder="e.g. TechCorp Solutions Pvt. Ltd."
        value={formCompany}
        onChange={(e) => setFormCompany(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        placeholder="e.g. vikram@techcorp.in"
        value={formEmail}
        onChange={(e) => setFormEmail(e.target.value)}
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="e.g. +91 98111 22233"
        value={formPhone}
        onChange={(e) => setFormPhone(e.target.value)}
      />
      <Input
        label="PAN Number"
        placeholder="e.g. AABCT1234A"
        value={formPan}
        onChange={(e) => setFormPan(e.target.value)}
      />
      <Input
        label="GST Number"
        placeholder="e.g. 07AABCT1234A1ZA"
        value={formGst}
        onChange={(e) => setFormGst(e.target.value)}
      />
      <Textarea
        label="Address"
        placeholder="Enter full address"
        value={formAddress}
        onChange={(e) => setFormAddress(e.target.value)}
        rows={3}
      />
    </>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Clients</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} in your firm
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, PAN, or GST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>

        {/* Clients Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-10 w-10 text-gray-300" />
                    <div>
                      <p className="font-medium text-gray-500">No clients found</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {searchQuery
                          ? 'Try adjusting your search query'
                          : 'Add your first client to get started'}
                      </p>
                    </div>
                    {!searchQuery && (
                      <Button
                        size="sm"
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Client
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-gray-900">
                    {client.name}
                  </TableCell>
                  <TableCell>{client.company_name ?? '-'}</TableCell>
                  <TableCell>{client.email ?? '-'}</TableCell>
                  <TableCell>{client.phone ?? '-'}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{client.pan_number ?? '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{client.gst_number ?? '-'}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(client.id)}
                      className="focus:outline-none"
                      title="Click to toggle status"
                    >
                      <Badge variant={client.is_active ? 'success' : 'danger'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(client)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(client.id)}
                      >
                        {client.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { resetForm(); setIsAddModalOpen(false); }}
        title="Add New Client"
        size="lg"
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          {clientForm}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setIsAddModalOpen(false); }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={!!editingClient}
        onClose={() => { resetForm(); setEditingClient(null); }}
        title="Edit Client"
        size="lg"
      >
        <form onSubmit={handleEditClient} className="space-y-4">
          {clientForm}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setEditingClient(null); }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
