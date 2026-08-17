import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Beim allerersten Discord-Login: Officer-Profil mit Status "pending" anlegen,
    // falls noch keins existiert. Bestehende Profile werden NIE überschrieben,
    // damit Admin-Freigaben/-Bearbeitungen bei jedem weiteren Login erhalten bleiben.
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
        // Provisioning-Fehler dürfen den Login nicht blockieren – der User landet
        // dann auf der "Officer-Profil nicht gefunden"-Seite und ein Admin kann
        // manuell nachhelfen bzw. das Log wird in den Vercel Function Logs sichtbar.
        console.error('Auto-provisioning fehlgeschlagen:', provisionError);
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}