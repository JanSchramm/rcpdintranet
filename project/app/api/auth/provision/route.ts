import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    
    // Get the current user from the session
    const { data: { user }, error: authError } = await admin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    // Check if user exists in the user table
    const { data: existing } = await (admin.from('user') as any)
      .select('id, status, role, firstname, lastname')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        user: existing 
      });
    }

    // Create new user
    const meta = user.user_metadata ?? {};
    const fullName = meta.full_name || meta.name || meta.global_name || '';
    const [firstname, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);

    const newUser = {
      id: user.id,
      firstname: firstname || 'New',
      lastname: rest.join(' ') || 'Officer',
      badgenumber: null,
      rank: 'Officer',
      division: [],
      role: 'officer',
      status: 'pending',
    };

    console.log('Provision API: Creating new user:', newUser);

    const { data: inserted, error: insertError } = await (admin.from('user') as any)
      .insert(newUser)
      .select();

    if (insertError) {
      console.error('Provision API: Failed to create user:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: insertError.message,
        details: insertError 
      }, { status: 500 });
    }

    console.log('Provision API: User created successfully:', inserted);
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: inserted?.[0] || newUser 
    });
  } catch (err: any) {
    console.error('Provision API: Unexpected error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Unknown error' 
    }, { status: 500 });
  }
}
