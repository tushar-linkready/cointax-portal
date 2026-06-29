import { TaskStatus, TaskPriority, InvoiceStatus } from './types';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending_approval: { label: 'Pending Approval', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  assigned: { label: 'Assigned', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  under_review: { label: 'Under Review', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  on_hold: { label: 'On Hold', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const ALL_STATUSES: TaskStatus[] = [
  'pending_approval',
  'assigned',
  'in_progress',
  'under_review',
  'completed',
  'on_hold',
];

export const ALL_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export const PRESET_CATEGORIES = [
  { name: 'ITR Filing', description: 'Income Tax Return filing services' },
  { name: 'GST Returns', description: 'GST return filing and compliance' },
  { name: 'TDS Returns', description: 'TDS return filing and compliance' },
  { name: 'ROC/MCA Filing', description: 'Registrar of Companies and MCA filings' },
  { name: 'Audit', description: 'Statutory and internal audit services' },
  { name: 'Bookkeeping', description: 'Regular bookkeeping and accounting' },
  { name: 'Advisory', description: 'Tax and business advisory services' },
  { name: 'Company Incorporation', description: 'New company registration and incorporation' },
  { name: 'Transfer Pricing', description: 'Transfer pricing documentation and compliance' },
  { name: 'FEMA/RBI', description: 'FEMA and RBI compliance services' },
  { name: 'International Tax Filing', description: 'Cross-border tax filing services' },
];

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  sent: { label: 'Sent', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export const ALL_INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

export const NAV_ITEMS = {
  super_admin: [
    { label: 'Dashboard', href: '/dashboard/super-admin', icon: 'LayoutDashboard' },
    { label: 'Firms', href: '/dashboard/super-admin/firms', icon: 'Building2' },
  ],
  firm_admin: [
    { label: 'Dashboard', href: '/dashboard/firm', icon: 'LayoutDashboard' },
    { label: 'Tasks', href: '/dashboard/firm/tasks', icon: 'CheckSquare' },
    { label: 'Clients', href: '/dashboard/firm/clients', icon: 'Users' },
    { label: 'Team', href: '/dashboard/firm/team', icon: 'UserCog' },
    { label: 'Invoices', href: '/dashboard/firm/invoices', icon: 'FileText' },
    { label: 'Categories', href: '/dashboard/firm/categories', icon: 'Tag' },
    { label: 'Settings', href: '/dashboard/firm/settings', icon: 'Settings' },
  ],
  team_member: [
    { label: 'Dashboard', href: '/dashboard/firm', icon: 'LayoutDashboard' },
    { label: 'My Tasks', href: '/dashboard/firm/tasks', icon: 'CheckSquare' },
  ],
  client: [
    { label: 'Dashboard', href: '/dashboard/client', icon: 'LayoutDashboard' },
    { label: 'My Tasks', href: '/dashboard/client/tasks', icon: 'CheckSquare' },
    { label: 'Invoices', href: '/dashboard/client/invoices', icon: 'FileText' },
    { label: 'New Request', href: '/dashboard/client/tasks/new', icon: 'PlusCircle' },
  ],
};
