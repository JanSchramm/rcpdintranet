import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const results: any = {
    env: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    tests: [],
  };

  try {
    const admin = getSupabaseAdmin();
    
    // Test 1: Read users
    const { data: users, error: readError } = await (admin.from('user') as any)
      .select('id, firstname, lastname, status')
      .limit(5);

    results.tests.push({
      name: 'read_users',
      success: !readError,
      count: users?.length ?? 0,
      error: readError?.message ?? null,
      data: users ?? [],
    });

    // Test 2: Try to insert a test user
    const testId = `test-${Date.now()}`;
    const { data: inserted, error: insertError } = await (admin.from('user') as any)
      .insert({
        id: testId,
        firstname: 'Test',
        lastname: 'User',
        badgenumber: null,
        rank: 'Officer',
        division: [],
        role: 'officer',
        status: 'pending',
      })
      .select();

    results.tests.push({
      name: 'insert_test_user',
      success: !insertError,
      error: insertError?.message ?? null,
      data: inserted ?? null,
    });

    // Test 3: Delete the test user
    if (inserted?.[0]) {
      const { error: deleteError } = await (admin.from('user') as any)
        .delete()
        .eq('id', testId);

      results.tests.push({
        name: 'delete_test_user',
        success: !deleteError,
        error: deleteError?.message ?? null,
      });
    }

    // Test 4: Check RLS policies
    const { data: policies, error: policyError } = await admin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user');

    results.tests.push({
      name: 'check_policies',
      success: !policyError,
      error: policyError?.message ?? null,
      policies: policies ?? [],
    });

  } catch (err: any) {
    results.tests.push({
      name: 'unexpected_error',
      success: false,
      error: err.message ?? 'Unknown error',
    });
  }

  return NextResponse.json(results);
}
