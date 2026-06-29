export type UserRole = 'super_admin' | 'firm_admin' | 'team_member' | 'client';
export type TaskStatus = 'pending_approval' | 'assigned' | 'in_progress' | 'under_review' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FirmPlan = 'starter' | 'pro' | 'enterprise';

export interface Firm {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  plan: FirmPlan;
  is_active: boolean;
  logo_url: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  firm_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  firm_id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientUser {
  id: string;
  client_id: string;
  firm_id: string;
  created_at: string;
}

export interface TaskCategory {
  id: string;
  firm_id: string | null;
  name: string;
  description: string | null;
  is_preset: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  firm_id: string;
  client_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Client;
  category?: TaskCategory;
  assignee?: Profile;
  creator?: Profile;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  uploader?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  firm_id: string | null;
  title: string;
  message: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalClients: number;
  totalTasks: number;
  pendingApprovals: number;
  inProgress: number;
  overdue: number;
  completedThisMonth: number;
}

export interface SuperAdminStats {
  totalFirms: number;
  activeFirms: number;
  totalRevenue: number;
  totalUsers: number;
}

// --- Invoices ---

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  firm_id: string;
  client_id: string;
  invoice_number: string;
  items: InvoiceItem[];
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
}
