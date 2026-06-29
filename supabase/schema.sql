-- Cointax Portal Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'firm_admin', 'team_member', 'client');
CREATE TYPE task_status AS ENUM ('pending_approval', 'assigned', 'in_progress', 'under_review', 'completed', 'on_hold');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE firm_plan AS ENUM ('starter', 'pro', 'enterprise');

-- Firms table
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  plan firm_plan DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table (firm's customers)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  gst_number TEXT,
  pan_number TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client users (links auth users to clients for portal login)
CREATE TABLE client_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task categories
CREATE TABLE task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending_approval',
  priority task_priority DEFAULT 'medium',
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_firm_id ON profiles(firm_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_clients_firm_id ON clients(firm_id);
CREATE INDEX idx_tasks_firm_id ON tasks(firm_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's firm_id
CREATE OR REPLACE FUNCTION get_user_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Firms policies
CREATE POLICY "Super admins can see all firms" ON firms
  FOR SELECT TO authenticated
  USING (get_user_role() = 'super_admin');

CREATE POLICY "Firm members can see their firm" ON firms
  FOR SELECT TO authenticated
  USING (id = get_user_firm_id());

CREATE POLICY "Super admins can manage firms" ON firms
  FOR ALL TO authenticated
  USING (get_user_role() = 'super_admin');

-- Profiles policies
CREATE POLICY "Super admins can see all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (get_user_role() = 'super_admin');

CREATE POLICY "Firm members can see profiles in their firm" ON profiles
  FOR SELECT TO authenticated
  USING (firm_id = get_user_firm_id());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Clients policies
CREATE POLICY "Super admins can see all clients" ON clients
  FOR SELECT TO authenticated
  USING (get_user_role() = 'super_admin');

CREATE POLICY "Firm members can see their firm clients" ON clients
  FOR SELECT TO authenticated
  USING (firm_id = get_user_firm_id());

CREATE POLICY "Firm admins can manage clients" ON clients
  FOR ALL TO authenticated
  USING (firm_id = get_user_firm_id() AND get_user_role() IN ('firm_admin', 'super_admin'));

-- Tasks policies
CREATE POLICY "Super admins can see all tasks" ON tasks
  FOR SELECT TO authenticated
  USING (get_user_role() = 'super_admin');

CREATE POLICY "Firm members can see their firm tasks" ON tasks
  FOR SELECT TO authenticated
  USING (firm_id = get_user_firm_id());

CREATE POLICY "Firm admins can manage tasks" ON tasks
  FOR ALL TO authenticated
  USING (firm_id = get_user_firm_id() AND get_user_role() IN ('firm_admin', 'super_admin'));

CREATE POLICY "Team members can update assigned tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (assignee_id = auth.uid() AND get_user_role() = 'team_member');

-- Task categories policies
CREATE POLICY "Anyone can see categories" ON task_categories
  FOR SELECT TO authenticated
  USING (firm_id IS NULL OR firm_id = get_user_firm_id());

CREATE POLICY "Firm admins can manage categories" ON task_categories
  FOR ALL TO authenticated
  USING (firm_id = get_user_firm_id() AND get_user_role() IN ('firm_admin', 'super_admin'));

-- Task comments policies
CREATE POLICY "Firm members can see comments on their tasks" ON task_comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_comments.task_id
      AND tasks.firm_id = get_user_firm_id()
    )
  );

CREATE POLICY "Authenticated users can create comments" ON task_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Task attachments policies
CREATE POLICY "Firm members can see attachments" ON task_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_attachments.task_id
      AND tasks.firm_id = get_user_firm_id()
    )
  );

CREATE POLICY "Authenticated users can upload attachments" ON task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Notifications policies
CREATE POLICY "Users can see own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_firms_updated_at
  BEFORE UPDATE ON firms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert preset task categories (global presets, firm_id = NULL)
INSERT INTO task_categories (name, description, is_preset, firm_id) VALUES
  ('ITR Filing', 'Income Tax Return filing services', true, NULL),
  ('GST Returns', 'GST return filing and compliance', true, NULL),
  ('TDS Returns', 'TDS return filing and compliance', true, NULL),
  ('ROC/MCA Filing', 'Registrar of Companies and MCA filings', true, NULL),
  ('Audit', 'Statutory and internal audit services', true, NULL),
  ('Bookkeeping', 'Regular bookkeeping and accounting', true, NULL),
  ('Advisory', 'Tax and business advisory services', true, NULL),
  ('Company Incorporation', 'New company registration and incorporation', true, NULL),
  ('Transfer Pricing', 'Transfer pricing documentation and compliance', true, NULL),
  ('FEMA/RBI', 'FEMA and RBI compliance services', true, NULL),
  ('International Tax Filing', 'Cross-border tax filing services', true, NULL);

-- ============================================================
-- Invoices
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst_rate DECIMAL(5,2) DEFAULT 18.00,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_firm_id ON invoices(firm_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Firm members can see their invoices" ON invoices FOR SELECT TO authenticated USING (firm_id = get_user_firm_id());
CREATE POLICY "Firm admins can manage invoices" ON invoices FOR ALL TO authenticated USING (firm_id = get_user_firm_id() AND get_user_role() IN ('firm_admin', 'super_admin'));

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
