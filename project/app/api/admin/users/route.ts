import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET: Lädt alle Benutzer aus der Datenbank
export async function GET() {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await (supabaseAdmin.from('user') as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Aktualisiert Benutzerdaten (z. B. Rolle/Freigabe) via dieselben Admin-Validierungen.
export async function POST(request: Request) {
    return PATCH(request);
}

// PATCH: Aktualisiert Benutzerdaten (z. B. Rolle/Freigabe)
export async function PATCH(request: Request) {
    try {
        const { userId, updates } = await request.json();
        if (!userId || !updates) {
            return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // If rank_id is provided, ensure it's a valid UUID
        // If rank_id is empty string, set to null
        let processedUpdates = { ...updates };
        if (processedUpdates.rank_id === '') {
            processedUpdates.rank_id = null;
        }

        const { data, error } = await (supabaseAdmin.from('user') as any)
            .update(processedUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}