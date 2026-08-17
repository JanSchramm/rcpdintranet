import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL(`/?error=auth&message=${encodeURIComponent(error.message)}`, origin));
    }

    if (data.user) {
      try {
        const admin = getSupabaseAdmin();

        const { data: existing, error: existingError } = await (admin.from('user') as any)
          .select('id, status, role, firstname, lastname')
          .eq('id', data.user.id)
          .maybeSingle();

        if (existingError) {
          console.error('Error checking existing user:', existingError);
        }

        if (!existing) {
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

          const { data: inserted, error: insertError } = await (admin.from('user') as any).insert(newUser).select();

          if (insertError) {
            console.error('Failed to create user:', insertError);
            return NextResponse.redirect(new URL(`/?error=provision&message=${encodeURIComponent(insertError.message)}`, origin));
          }

          console.log('New user created:', data.user.id);
        } else {
          console.log('User already exists:', existing.id, 'status:', existing.status);
        }
      } catch (provisionError) {
        console.error('Provisioning error:', provisionError);
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', origin));
}