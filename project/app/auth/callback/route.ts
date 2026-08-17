import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL(`/?error=no_code&message=${encodeURIComponent('No authorization code provided')}`, origin));
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth exchange error:', error);
      return NextResponse.redirect(new URL(`/?error=auth&message=${encodeURIComponent(error.message)}`, origin));
    }

    if (!data.user) {
      console.error('No user returned from auth exchange');
      return NextResponse.redirect(new URL(`/?error=no_user&message=${encodeURIComponent('No user returned from authentication')}`, origin));
    }

    const admin = getSupabaseAdmin();
    console.log('Callback: Processing user', data.user.id, data.user.email);

    const { data: existing, error: existingError } = await (admin.from('user') as any)
      .select('id, status, role, firstname, lastname')
      .eq('id', data.user.id)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing user:', existingError);
      return NextResponse.redirect(new URL(`/?error=db_check&message=${encodeURIComponent(existingError.message)}`, origin));
    }

    if (!existing) {
      console.log('Callback: User not found, creating new user...');
      const meta = data.user.user_metadata ?? {};
      const fullName = meta.full_name || meta.name || meta.global_name || '';
      const [firstname, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);

      const newUser = {
        id: data.user.id,
        firstname: firstname || 'New',
        lastname: rest.join(' ') || 'Officer',
        badgenumber: null,
        rank: 'Officer',
        division: [],
        role: 'officer',
        status: 'pending',
      };

      console.log('Callback: Inserting new user:', newUser);

      const { data: inserted, error: insertError } = await (admin.from('user') as any)
        .insert(newUser)
        .select();

      if (insertError) {
        console.error('Failed to create user:', insertError);
        return NextResponse.redirect(new URL(`/?error=provision&message=${encodeURIComponent(insertError.message)}`, origin));
      }

      console.log('Callback: User created successfully:', inserted);
    } else {
      console.log('Callback: User already exists:', existing.id, 'status:', existing.status);
    }

    return NextResponse.redirect(new URL('/dashboard', origin));
  } catch (err) {
    console.error('Callback unexpected error:', err);
    return NextResponse.redirect(new URL(`/?error=callback&message=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`, origin));
  }
}