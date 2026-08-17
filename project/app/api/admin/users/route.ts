import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
    console.log("=== ENV CHECK ===");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Service Key vorhanden?:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log("=================");
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('user')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId, updates } = await request.json();
        if (!userId || !updates) {
            return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await (supabaseAdmin.from('user') as any)
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}