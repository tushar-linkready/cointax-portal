import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env var');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firm_id, full_name, email, phone, role } = body;

    if (!firm_id || !full_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: firm_id, full_name, email, role' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    const tempPassword = crypto.randomUUID() + '!Aa1';
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'A user with this email already exists.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        firm_id,
        full_name,
        email,
        phone: phone || null,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Profile creation failed: ' + profileError.message },
        { status: 500 }
      );
    }

    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://portal.cointaxfinance.com') + '/reset-password',
      },
    });

    if (resetError) {
      console.warn('Failed to send password reset email:', resetError.message);
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error('Invite error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
