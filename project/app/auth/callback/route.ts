import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    console.error('[CALLBACK] No code provided');
    return NextResponse.redirect(new URL('/?error=no_code&message=No authorization code', origin));
  }

  try {
    // Step 1: Exchange code for session using server client
    const supabase = createSupabaseServerClient();
    console.log('[CALLBACK] Exchanging code for session...');
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[CALLBACK] Auth exchange error:', error);
      return NextResponse.redirect(new URL(`/?error=auth&message=${encodeURIComponent(error.message)}`, origin));
    }

    if (!data.user) {
      console.error('[CALLBACK] No user returned from auth exchange');
      return NextResponse.redirect(new URL('/?error=no_user&message=No user returned', origin));
    }

    console.log('[CALLBACK] Auth successful:', data.user.id, data.user.email);

    // Step 2: Create or update user in database using admin client
    const admin = getSupabaseAdmin();
    console.log('[CALLBACK] Checking if user exists in database...');

    const { data: existing, error: existingError } = await (admin.from('user') as any)
      .select('id, status, role, firstname, lastname')
      .eq('id', data.user.id)
      .maybeSingle();

    if (existingError) {
      console.error('[CALLBACK] Error checking existing user:', existingError);
    }

    if (!existing) {
      console.log('[CALLBACK] User not found, creating new user...');
      
      // Extract name from Discord metadata
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

      console.log('[CALLBACK] Inserting new user:', newUser);

      const { data: inserted, error: insertError } = await (admin.from('user') as any)
        .insert(newUser)
        .select();

      if (insertError) {
        console.error('[CALLBACK] Failed to create user:', insertError);
        return NextResponse.redirect(new URL(`/?error=provision&message=${encodeURIComponent(insertError.message)}`, origin));
      }

      console.log('[CALLBACK] User created successfully:', inserted);
    } else {
      console.log('[CALLBACK] User already exists:', existing.id, 'status:', existing.status);
    }

    console.log('[CALLBACK] Redirecting to dashboard...');
    return NextResponse.redirect(new URL('/dashboard', origin));
    
  } catch (err) {
    console.error('[CALLBACK] Unexpected error:', err);
    return NextResponse.redirect(new URL(`/?error=callback&message=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`, origin));
  }
}