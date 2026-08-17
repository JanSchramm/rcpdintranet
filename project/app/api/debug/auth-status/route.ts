import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    
    // Get the current user from the session
    const { data: { user }, error: authError } = await admin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: authError?.message || 'No user session' 
      });
    }

    // Check if user exists in the user table
    const { data: officer, error: officerError } = await (admin.from('user') as any)
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      authUser: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
      officer: officer || null,
      officerError: officerError?.message || null,
      officerExists: !!officer,
    });
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || 'Unknown error' 
    }, { status: 500 });
  }
}
