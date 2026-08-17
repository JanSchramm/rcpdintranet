import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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

    console.log('Callback: Auth successful for user', data.user.id, data.user.email);
    // Note: User provisioning is now handled client-side by AuthContext
    // to avoid timing issues and provide better error handling

    return NextResponse.redirect(new URL('/dashboard', origin));
  } catch (err) {
    console.error('Callback unexpected error:', err);
    return NextResponse.redirect(new URL(`/?error=callback&message=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`, origin));
  }
}