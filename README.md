# Cointax Portal

A multi-tenant SaaS client portal for CA/CS firms in India, built by Cointax Financial Services LLP.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server (demo mode is enabled by default)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Demo Mode

By default, `NEXT_PUBLIC_DEMO_MODE=true` is set in `.env.local`. This uses local mock data so the app works without a Supabase connection.

### Demo Accounts

| Role         | Email                          | Password |
|--------------|-------------------------------|----------|
| Super Admin  | tushar@cointaxfinance.com     | demo123  |
| Firm Admin   | rajesh@sharmaassociates.in    | demo123  |
| Team Member  | priya@sharmaassociates.in     | demo123  |
| Client       | vikram@techcorp.in            | demo123  |

## Setting Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase/schema.sql` in the Supabase SQL Editor
3. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   NEXT_PUBLIC_DEMO_MODE=false
   ```

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Landing page
    login/                # Authentication
    signup/               # Firm registration
    dashboard/
      super-admin/        # Super admin views
      firm/               # Firm admin & team views
      client/             # Client portal views
  components/
    layout/               # Sidebar, Header, DashboardLayout
    ui/                   # Reusable UI components
    tasks/                # Task-related components
    dashboard/            # Dashboard widgets
  lib/
    types.ts              # TypeScript interfaces
    constants.ts          # App constants
    mock-data.ts          # Demo data
    auth.ts               # Auth helpers
    supabase.ts           # Supabase client
    utils.ts              # Utility functions
  middleware.ts           # Route protection
```

## User Roles

1. **Super Admin**: Manages all firms, billing, platform-wide visibility
2. **Firm Admin**: CA firm owner managing team, clients, and tasks
3. **Team Member**: Staff working on assigned tasks
4. **Client**: Views tasks, raises service requests, uploads documents

## Task Workflow

```
Client creates request → Pending Approval → Firm Admin approves →
Assigned → In Progress → Under Review → Completed
```

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel
```

## License

Proprietary - Cointax Financial Services LLP
