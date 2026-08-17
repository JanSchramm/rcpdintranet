import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('exchangeCodeForSession fehlgeschlagen:', error.message);
    }

    if (!error && data.user) {
      try {
        const admin = getSupabaseAdmin();

        const { data: existing } = await (admin.from('user') as any)
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existing) {
          const meta = data.user.user_metadata ?? {};
          const discordName: string =
            meta.full_name || meta.name || meta.user_name || meta.preferred_username || '';
          const [firstname, ...rest] = discordName.trim().split(/\s+/).filter(Boolean);

          await (admin.from('user') as any).insert({
            id: data.user.id,
            firstname: firstname || 'Neuer',
            lastname: rest.join(' ') || 'Officer',
            rank: 'Officer',
            division: ['Patrol'],
            role: 'officer',
            status: 'pending',
          });
        }
      } catch (provisionError) {
        console.error('Auto-provisioning fehlgeschlagen:', provisionError);
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}