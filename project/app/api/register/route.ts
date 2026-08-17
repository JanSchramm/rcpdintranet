import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    console.error('Register API: No code provided');
    return NextResponse.redirect(new URL('/?error=no_code&message=No authorization code provided', origin));
  }

  try {
    const admin = getSupabaseAdmin();
    console.log('Register API: Exchanging code for session...');

    const { data, error } = await admin.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Register API: Auth exchange error:', error);
      return NextResponse.redirect(new URL(`/?error=auth&message=${encodeURIComponent(error.message)}`, origin));
    }

    if (!data.user) {
      console.error('Register API: No user returned');
      return NextResponse.redirect(new URL('/?error=no_user&message=No user returned from authentication', origin));
    }

    console.log('Register API: Auth successful for user', data.user.id, data.user.email);

    // Check if user already exists
    const { data: existing, error: existingError } = await (admin.from('user') as any)
      .select('id, status, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (existingError) {
      console.error('Register API: Error checking existing user:', existingError);
      return NextResponse.redirect(new URL(`/?error=db_check&message=${encodeURIComponent(existingError.message)}`, origin));
    }

    if (!existing) {
      console.log('Register API: User not found, creating new user...');
      
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

      console.log('Register API: Inserting new user:', newUser);

      const { data: inserted, error: insertError } = await (admin.from('user') as any)
        .insert(newUser)
        .select();

      if (insertError) {
        console.error('Register API: Failed to create user:', insertError);
        return NextResponse.redirect(new URL(`/?error=provision&message=${encodeURIComponent(insertError.message)}`, origin));
      }

      console.log('Register API: User created successfully:', inserted);
    } else {
      console.log('Register API: User already exists:', existing.id, 'status:', existing.status);
    }

    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/?registration=success', origin));
  } catch (err) {
    console.error('Register API: Unexpected error:', err);
    return NextResponse.redirect(new URL(`/?error=callback&message=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`, origin));
  }
}
