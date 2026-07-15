import { supabase } from './supabase';
import type {
  Firm, Profile, Client, TaskCategory, Task, TaskComment, TaskAttachment,
  Notification, Invoice, InvoiceItem, InvoiceStatus, TaskStatus, TaskPriority,
} from './types';

// ============================================================
// Firms
// ============================================================

export async function getFirms(): Promise<Firm[]> {
  const { data, error } = await supabase.from('firms').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFirm(firmId: string): Promise<Firm | null> {
  const { data, error } = await supabase.from('firms').select('*').eq('id', firmId).single();
  if (error) return null;
  return data;
}

export async function updateFirm(firmId: string, updates: Partial<Firm>): Promise<Firm> {
  const { data, error } = await supabase.from('firms').update(updates).eq('id', firmId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Profiles
// ============================================================

export async function getProfiles(firmId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('firm_id', firmId)
    .order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Clients
// ============================================================

export async function getClients(firmId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getClient(clientId: string): Promise<Client | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();
  if (error) return null;
  return data;
}

export async function createClient(client: {
  firm_id: string;
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  address?: string | null;
}): Promise<Client> {
  const { data, error } = await supabase.from('clients').insert(client).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase.from('clients').update(updates).eq('id', clientId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Task Categories
// ============================================================

export async function getCategories(firmId?: string | null): Promise<TaskCategory[]> {
  let query = supabase.from('task_categories').select('*').eq('is_active', true);
  if (firmId) {
    // Preset (firm_id IS NULL) + firm-specific
    query = supabase
      .from('task_categories')
      .select('*')
      .eq('is_active', true)
      .or(`firm_id.is.null,firm_id.eq.${firmId}`);
  }
  const { data, error } = await query.order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(cat: {
  firm_id: string;
  name: string;
  description?: string | null;
}): Promise<TaskCategory> {
  const { data, error } = await supabase.from('task_categories').insert(cat).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(catId: string, updates: Partial<TaskCategory>): Promise<TaskCategory> {
  const { data, error } = await supabase.from('task_categories').update(updates).eq('id', catId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Tasks
// ============================================================

export async function getTasks(firmId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(*),
      category:task_categories(*),
      assignee:profiles!tasks_assignee_id_fkey(*),
      creator:profiles!tasks_created_by_fkey(*)
    `)
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(*),
      category:task_categories(*),
      assignee:profiles!tasks_assignee_id_fkey(*),
      creator:profiles!tasks_created_by_fkey(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:clients(*),
      category:task_categories(*),
      assignee:profiles!tasks_assignee_id_fkey(*),
      creator:profiles!tasks_created_by_fkey(*),
      comments:task_comments(*, user:profiles(*)),
      attachments:task_attachments(*, uploader:profiles!task_attachments_uploaded_by_fkey(*))
    `)
    .eq('id', taskId)
    .single();
  if (error) return null;
  return data;
}

export async function getClientTasks(clientId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      category:task_categories(*),
      assignee:profiles!tasks_assignee_id_fkey(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(task: {
  firm_id: string;
  client_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  created_by?: string | null;
  due_date?: string | null;
}): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  // Strip joined fields — only send column values
  const { client, category, assignee, creator, comments, attachments, ...cols } = updates as any;
  const { data, error } = await supabase.from('tasks').update(cols).eq('id', taskId).select().single();
  if (error) throw error;
  return data;
}

// ============================================================
// Task Comments
// ============================================================

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*, user:profiles(*)')
    .eq('task_id', taskId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addTaskComment(comment: {
  task_id: string;
  user_id: string;
  content: string;
}): Promise<TaskComment> {
  const { data, error } = await supabase.from('task_comments').insert(comment).select('*, user:profiles(*)').single();
  if (error) throw error;
  return data;
}

// ============================================================
// Notifications
// ============================================================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
}

// ============================================================
// Invoices
// ============================================================

export async function getInvoices(firmId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('client_id', clientId)
    .neq('status', 'draft') // Clients shouldn't see drafts
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('id', invoiceId)
    .single();
  if (error) return null;
  return data;
}

export async function createInvoice(invoice: {
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
  notes?: string | null;
  created_by: string;
}): Promise<Invoice> {
  const { data, error } = await supabase.from('invoices').insert(invoice).select('*, client:clients(*)').single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
  const { client, ...cols } = updates as any;
  const { data, error } = await supabase
    .from('invoices')
    .update(cols)
    .eq('id', invoiceId)
    .select('*, client:clients(*)')
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// Dashboard stats (computed from real data)
// ============================================================

export async function getFirmDashboardStats(firmId: string) {
  const [clientsRes, tasksRes, invoicesRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact' }).eq('firm_id', firmId).eq('is_active', true),
    supabase.from('tasks').select('id, status, due_date, completed_at').eq('firm_id', firmId),
    supabase.from('invoices').select('id, status, total').eq('firm_id', firmId),
  ]);

  const tasks = tasksRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return {
    totalClients: clientsRes.count ?? 0,
    totalTasks: tasks.length,
    pendingApprovals: tasks.filter(t => t.status === 'pending_approval').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < now && !['completed', 'on_hold'].includes(t.status)).length,
    completedThisMonth: tasks.filter(t => t.completed_at && t.completed_at >= startOfMonth).length,
    totalOutstanding: invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum: number, i: any) => sum + Number(i.total), 0),
    totalOverdue: invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum: number, i: any) => sum + Number(i.total), 0),
    paidThisMonth: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum: number, i: any) => sum + Number(i.total), 0),
  };
}

export async function getSuperAdminStats() {
  const [firmsRes, profilesRes] = await Promise.all([
    supabase.from('firms').select('id, is_active', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ]);

  const firms = firmsRes.data ?? [];
  return {
    totalFirms: firmsRes.count ?? 0,
    activeFirms: firms.filter(f => f.is_active).length,
    totalUsers: profilesRes.count ?? 0,
  };
}

// ============================================================
// Invoice number generation
// ============================================================

export async function getNextInvoiceNumber(firmId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CTX-${year}`;
  const { count, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('firm_id', firmId)
    .like('invoice_number', `${prefix}%`);
  const nextNum = String((count ?? 0) + 1).padStart(3, '0');
  return `${prefix}-${nextNum}`;
}
